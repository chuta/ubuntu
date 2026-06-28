"use server";

import { revalidatePath } from "next/cache";
import { createClient, getProfile } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { provisionTeamInvite } from "@/lib/team/invite-provision";
import type { UserRole } from "@/types/database";

export type TeamMember = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  title: string | null;
  department: string | null;
  is_active: boolean;
  reports_to_id: string | null;
  invited_at: string | null;
  /** Admin invited; password not yet set and first sign-in not completed. */
  pending_invite: boolean;
};

const ASSIGNABLE: UserRole[] = [
  "COMMERCIAL",
  "LEGAL",
  "OPERATIONS",
  "MARKETING",
  "EXECUTIVE",
  "ADMIN",
];

async function requireAdmin() {
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");
  if (profile.role !== "ADMIN") throw new Error("Only admins can manage the team");
  return profile;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, title, department, is_active, reports_to_id, invited_at")
    .order("is_active", { ascending: true })
    .order("full_name");

  if (error) throw new Error(error.message);

  return (data ?? []).map((m) => ({
    ...m,
    pending_invite: !!m.invited_at && !m.is_active,
  })) as TeamMember[];
}

export type InviteDeliveryResult = {
  emailSent: boolean;
  /** Present when Resend failed — admin can copy and share manually. */
  inviteUrl?: string;
};

/**
 * Invite a teammate. Supabase generates the auth link; Resend delivers the email.
 * Account stays inactive until the invitee sets a password and signs in.
 */
export async function inviteTeamMember(input: {
  email: string;
  fullName: string;
  role: UserRole;
}): Promise<InviteDeliveryResult> {
  const admin = await requireAdmin();
  if (!ASSIGNABLE.includes(input.role)) throw new Error("Invalid role");

  const result = await provisionTeamInvite({
    email: input.email,
    fullName: input.fullName,
    role: input.role,
    inviterName: admin.full_name,
  });

  revalidatePath("/settings/team");

  if (!result.emailSent) {
    return { emailSent: false, inviteUrl: result.inviteUrl };
  }
  return { emailSent: true };
}

/**
 * Activate an invited user after their first successful password sign-in.
 * Self-registered users (no invited_at) are not affected — admins still approve those.
 */
export async function completeInviteLogin(): Promise<{ activated: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { activated: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("invited_at, is_active")
    .eq("id", user.id)
    .single();

  if (!profile?.invited_at || profile.is_active) return { activated: false };

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: true, last_login_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/settings/team");
  return { activated: true };
}

/** Re-send invite email via Resend (fresh Supabase link). */
export async function resendInvite(userId: string): Promise<InviteDeliveryResult> {
  const adminProfile = await requireAdmin();
  const service = createAdminClient();

  const { data: member, error: memberError } = await service
    .from("profiles")
    .select("email, full_name, role")
    .eq("id", userId)
    .single();

  if (memberError || !member?.email) throw new Error("User not found");

  const result = await provisionTeamInvite({
    email: member.email,
    fullName: member.full_name,
    role: member.role,
    inviterName: adminProfile.full_name,
  });

  revalidatePath("/settings/team");

  if (!result.emailSent) {
    return { emailSent: false, inviteUrl: result.inviteUrl };
  }
  return { emailSent: true };
}

export async function updateUserRole(userId: string, role: UserRole) {
  const admin = await requireAdmin();
  if (!ASSIGNABLE.includes(role)) throw new Error("Invalid role");
  if (userId === admin.id && role !== "ADMIN") {
    throw new Error("You cannot remove your own admin access");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/settings/team");
}

export async function setUserActive(userId: string, isActive: boolean) {
  const admin = await requireAdmin();
  if (userId === admin.id && !isActive) {
    throw new Error("You cannot deactivate your own account");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ is_active: isActive }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/settings/team");
}

export async function setUserManager(userId: string, managerId: string | null) {
  await requireAdmin();
  if (managerId === userId) throw new Error("A user cannot report to themselves");

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ reports_to_id: managerId })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/settings/team");
}
