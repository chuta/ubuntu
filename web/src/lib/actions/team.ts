"use server";

import { revalidatePath } from "next/cache";
import { createClient, getProfile } from "@/lib/supabase/server";
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
};

const ASSIGNABLE: UserRole[] = ["COMMERCIAL", "EXECUTIVE", "ADMIN"];

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
    .order("full_name");

  if (error) throw new Error(error.message);
  return (data ?? []) as TeamMember[];
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
