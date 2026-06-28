"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import type { MilestoneStatus, PartnershipMilestone } from "@/types/partnerships";
import { revalidatePath } from "next/cache";

export type MilestoneFormData = {
  title: string;
  description?: string;
  due_date?: string;
  assignee_id?: string;
};

export async function getPartnershipMilestones(
  partnershipId: string
): Promise<PartnershipMilestone[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partnership_milestones")
    .select("*, assignee:profiles!partnership_milestones_assignee_id_fkey(full_name)")
    .eq("partnership_id", partnershipId)
    .order("sort_order", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as PartnershipMilestone[];
}

export async function createPartnershipMilestone(
  partnershipId: string,
  data: MilestoneFormData
) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("partnership_milestones")
    .select("sort_order")
    .eq("partnership_id", partnershipId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const sortOrder = (existing?.[0]?.sort_order ?? 0) + 1;

  const { error } = await supabase.from("partnership_milestones").insert({
    partnership_id: partnershipId,
    title: data.title,
    description: data.description || null,
    due_date: data.due_date || null,
    assignee_id: data.assignee_id || null,
    sort_order: sortOrder,
    created_by: profile.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/partnerships/${partnershipId}`);
}

export async function updateMilestoneStatus(
  milestoneId: string,
  status: MilestoneStatus,
  partnershipId: string
) {
  const supabase = await createClient();
  const completedAt = status === "COMPLETED" ? new Date().toISOString() : null;
  const { error } = await supabase
    .from("partnership_milestones")
    .update({ status, completed_at: completedAt, updated_at: new Date().toISOString() })
    .eq("id", milestoneId);

  if (error) throw new Error(error.message);
  revalidatePath(`/partnerships/${partnershipId}`);
}

export async function deletePartnershipMilestone(
  milestoneId: string,
  partnershipId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("partnership_milestones")
    .delete()
    .eq("id", milestoneId);

  if (error) throw new Error(error.message);
  revalidatePath(`/partnerships/${partnershipId}`);
}
