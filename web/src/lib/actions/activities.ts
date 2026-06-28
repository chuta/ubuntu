"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import type { Activity, ActivityType } from "@/types/pipeline";
import type { WorkspaceContext } from "@/lib/workspace-context";
import { workspacePath } from "@/lib/workspace-context";
import { revalidatePath } from "next/cache";

export type ActivityFormData = {
  activity_type: ActivityType;
  subject: string;
  description?: string;
  occurred_at: string;
  duration_minutes?: number;
  outcome?: string;
};

export async function getActivities(ctx: WorkspaceContext): Promise<Activity[]> {
  const supabase = await createClient();
  let query = supabase
    .from("activities")
    .select("*, logged_by:profiles(full_name)");

  if (ctx.kind === "deal") query = query.eq("deal_id", ctx.id);
  else if (ctx.kind === "partnership") query = query.eq("partnership_id", ctx.id);
  else
    query = query
      .eq("organization_id", ctx.id)
      .is("deal_id", null)
      .is("partnership_id", null);

  const { data, error } = await query.order("occurred_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Activity[];
}

/** @deprecated Use getActivities({ kind: "deal", id, organizationId }) */
export async function getDealActivities(dealId: string): Promise<Activity[]> {
  return getActivities({ kind: "deal", id: dealId, organizationId: "" });
}

export async function createActivity(
  ctx: WorkspaceContext,
  data: ActivityFormData
) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const base = {
    activity_type: data.activity_type,
    subject: data.subject,
    description: data.description || null,
    occurred_at: data.occurred_at,
    duration_minutes: data.duration_minutes || null,
    outcome: data.outcome || null,
    organization_id: ctx.organizationId || null,
    logged_by_id: profile.id,
  };

  const row =
    ctx.kind === "deal"
      ? { ...base, deal_id: ctx.id }
      : ctx.kind === "partnership"
        ? { ...base, partnership_id: ctx.id }
        : base;

  const { error } = await supabase.from("activities").insert(row);

  if (error) throw new Error(error.message);
  revalidatePath(workspacePath(ctx));
}
