"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import type { Activity, ActivityType } from "@/types/pipeline";
import { revalidatePath } from "next/cache";

export type ActivityFormData = {
  activity_type: ActivityType;
  subject: string;
  description?: string;
  occurred_at: string;
  duration_minutes?: number;
  outcome?: string;
};

export async function getActivities(dealId: string): Promise<Activity[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select("*, logged_by:profiles(full_name)")
    .eq("deal_id", dealId)
    .order("occurred_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Activity[];
}

export async function createActivity(dealId: string, organizationId: string, data: ActivityFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { error } = await supabase.from("activities").insert({
    activity_type: data.activity_type,
    subject: data.subject,
    description: data.description || null,
    occurred_at: data.occurred_at,
    duration_minutes: data.duration_minutes || null,
    outcome: data.outcome || null,
    deal_id: dealId,
    organization_id: organizationId,
    logged_by_id: profile.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/pipeline/${dealId}`);
}
