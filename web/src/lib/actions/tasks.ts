"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import type { DealPriority, Task, TaskStatus } from "@/types/pipeline";
import type { WorkspaceContext } from "@/lib/workspace-context";
import { workspacePath } from "@/lib/workspace-context";
import { revalidatePath } from "next/cache";

export type TaskFormData = {
  title: string;
  description?: string;
  assignee_id: string;
  due_date?: string;
  priority?: DealPriority;
};

export async function getTasks(ctx: WorkspaceContext): Promise<Task[]> {
  const supabase = await createClient();
  let query = supabase.from("tasks").select("*, assignee:profiles(full_name)");

  if (ctx.kind === "deal") query = query.eq("deal_id", ctx.id);
  else if (ctx.kind === "partnership") query = query.eq("partnership_id", ctx.id);
  else
    query = query
      .eq("organization_id", ctx.id)
      .is("deal_id", null)
      .is("partnership_id", null);

  const { data, error } = await query.order("due_date", {
    ascending: true,
    nullsFirst: false,
  });

  if (error) throw new Error(error.message);
  return (data ?? []) as Task[];
}

export async function createTask(ctx: WorkspaceContext, data: TaskFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const base = {
    title: data.title,
    description: data.description || null,
    assignee_id: data.assignee_id,
    due_date: data.due_date || null,
    priority: data.priority || null,
    organization_id: ctx.organizationId || null,
    created_by: profile.id,
  };

  const row =
    ctx.kind === "deal"
      ? { ...base, deal_id: ctx.id }
      : ctx.kind === "partnership"
        ? { ...base, partnership_id: ctx.id }
        : base;

  const { error } = await supabase.from("tasks").insert(row);

  if (error) throw new Error(error.message);
  revalidatePath(workspacePath(ctx));
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  ctx: WorkspaceContext
) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath(workspacePath(ctx));
}
