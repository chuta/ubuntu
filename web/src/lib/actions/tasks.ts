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

function scopeFilter(ctx: WorkspaceContext) {
  return ctx.kind === "deal"
    ? { column: "deal_id" as const, value: ctx.id }
    : { column: "partnership_id" as const, value: ctx.id };
}

export async function getTasks(ctx: WorkspaceContext): Promise<Task[]> {
  const supabase = await createClient();
  const { column, value } = scopeFilter(ctx);
  const { data, error } = await supabase
    .from("tasks")
    .select("*, assignee:profiles(full_name)")
    .eq(column, value)
    .order("due_date", { ascending: true, nullsFirst: false });

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

  const { error } =
    ctx.kind === "deal"
      ? await supabase.from("tasks").insert({ ...base, deal_id: ctx.id })
      : await supabase.from("tasks").insert({ ...base, partnership_id: ctx.id });

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
