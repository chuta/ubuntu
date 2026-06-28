"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient, getProfile } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
  /** Invited but has not yet accepted (set a password / signed in). */
  pending_invite: boolean;
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Best-effort public origin for building auth redirect links. */
async function appOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

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
    .select("id, email, full_name, role, title, department, is_active, reports_to_id")
    .order("is_active", { ascending: true })
    .order("full_name");

  if (error) throw new Error(error.message);

  const members = (data ?? []).map((m) => ({
    ...m,
    pending_invite: false,
  })) as TeamMember[];

  // Enrich with auth state so the UI can distinguish invited-but-not-yet-joined
  // users from active/inactive ones. Non-fatal if the admin API is unavailable.
  try {
    const admin = createAdminClient();
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const byId = new Map(authData.users.map((u) => [u.id, u]));
    for (const m of members) {
      const u = byId.get(m.id);
      m.pending_invite = !!u && !u.last_sign_in_at && !u.email_confirmed_at;
    }
  } catch {
    // Leave pending_invite=false if we can't read auth state.
  }

  return members;
}

/**
 * Invite a teammate by email. Creates the auth user (Supabase sends the invite
 * email), assigns the chosen role, and pre-approves the account so they can sign
 * in as soon as they set a password.
 */
export async function inviteTeamMember(input: {
  email: string;
  fullName: string;
  role: UserRole;
}) {
  await requireAdmin();

  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  if (!EMAIL_RE.test(email)) throw new Error("Enter a valid email address");
  if (!fullName) throw new Error("Enter the person's full name");
  if (!ASSIGNABLE.includes(input.role)) throw new Error("Invalid role");

  const admin = createAdminClient();
  const redirectTo = `${await appOrigin()}/auth/callback?next=/auth/set-password`;

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
    redirectTo,
  });

  if (error) {
    if (/already.*(registered|exist)|been registered/i.test(error.message)) {
      throw new Error("That email already has an account or a pending invite.");
    }
    throw new Error(error.message);
  }

  // The handle_new_user trigger creates the profile (COMMERCIAL, inactive).
  // Apply the chosen role/name and pre-approve the invited user.
  const userId = data.user?.id;
  if (userId) {
    const { error: updateError } = await admin
      .from("profiles")
      .update({ role: input.role, full_name: fullName, is_active: true })
      .eq("id", userId);
    if (updateError) throw new Error(updateError.message);
  }

  revalidatePath("/settings/team");
}

/**
 * Re-send an invite. Tries the invite email again; if the user already exists
 * (the usual case for a pending invite), returns a fresh shareable link the
 * admin can copy and send manually — so this works even without project SMTP.
 */
export async function resendInvite(userId: string): Promise<{ link: string | null }> {
  await requireAdmin();

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .single();
  if (profileError || !profile?.email) throw new Error("User not found");

  const redirectTo = `${await appOrigin()}/auth/callback?next=/auth/set-password`;

  const { error } = await admin.auth.admin.inviteUserByEmail(profile.email, {
    redirectTo,
  });
  if (!error) {
    revalidatePath("/settings/team");
    return { link: null };
  }

  // Already registered → generate a one-time link the admin can share directly.
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: profile.email,
    options: { redirectTo },
  });
  if (linkError) throw new Error(linkError.message);

  revalidatePath("/settings/team");
  return { link: linkData.properties?.action_link ?? null };
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
