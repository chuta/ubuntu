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

function scopeFilter(ctx: WorkspaceContext) {
  return ctx.kind === "deal"
    ? { column: "deal_id" as const, value: ctx.id }
    : { column: "partnership_id" as const, value: ctx.id };
}

export async function getActivities(ctx: WorkspaceContext): Promise<Activity[]> {
  const supabase = await createClient();
  const { column, value } = scopeFilter(ctx);
  const { data, error } = await supabase
    .from("activities")
    .select("*, logged_by:profiles(full_name)")
    .eq(column, value)
    .order("occurred_at", { ascending: false });

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

  const { error } =
    ctx.kind === "deal"
      ? await supabase.from("activities").insert({ ...base, deal_id: ctx.id })
      : await supabase.from("activities").insert({ ...base, partnership_id: ctx.id });

  if (error) throw new Error(error.message);
  revalidatePath(workspacePath(ctx));
}
