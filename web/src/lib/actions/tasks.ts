"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import type { DealPriority, Task, TaskStatus } from "@/types/pipeline";
import { revalidatePath } from "next/cache";

export type TaskFormData = {
  title: string;
  description?: string;
  assignee_id: string;
  due_date?: string;
  priority?: DealPriority;
};

export async function getTasks(dealId: string): Promise<Task[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*, assignee:profiles(full_name)")
    .eq("deal_id", dealId)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Task[];
}

export async function createTask(dealId: string, organizationId: string, data: TaskFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { error } = await supabase.from("tasks").insert({
    title: data.title,
    description: data.description || null,
    assignee_id: data.assignee_id,
    due_date: data.due_date || null,
    priority: data.priority || null,
    deal_id: dealId,
    organization_id: organizationId,
    created_by: profile.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/pipeline/${dealId}`);
}

export async function updateTaskStatus(taskId: string, status: TaskStatus, dealId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath(`/pipeline/${dealId}`);
}
