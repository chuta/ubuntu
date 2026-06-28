"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import type { Note } from "@/types/pipeline";
import type { WorkspaceContext } from "@/lib/workspace-context";
import { workspacePath } from "@/lib/workspace-context";
import { revalidatePath } from "next/cache";

function entityType(ctx: WorkspaceContext): "deal" | "partnership" | "organization" {
  return ctx.kind;
}

export async function getNotes(ctx: WorkspaceContext): Promise<Note[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .select("*, author:profiles(full_name)")
    .eq("entity_type", entityType(ctx))
    .eq("entity_id", ctx.id)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Note[];
}

export async function createNote(ctx: WorkspaceContext, body: string, isPinned = false) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { error } = await supabase.from("notes").insert({
    body,
    author_id: profile.id,
    entity_type: entityType(ctx),
    entity_id: ctx.id,
    is_pinned: isPinned,
  });

  if (error) throw new Error(error.message);
  revalidatePath(workspacePath(ctx));
}

export async function deleteNote(noteId: string, ctx: WorkspaceContext) {
  const supabase = await createClient();
  const { error } = await supabase.from("notes").delete().eq("id", noteId);
  if (error) throw new Error(error.message);
  revalidatePath(workspacePath(ctx));
}
