"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import type { Note } from "@/types/pipeline";
import { revalidatePath } from "next/cache";

export async function getNotes(dealId: string): Promise<Note[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .select("*, author:profiles(full_name)")
    .eq("entity_type", "deal")
    .eq("entity_id", dealId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Note[];
}

export async function createNote(dealId: string, body: string, isPinned = false) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { error } = await supabase.from("notes").insert({
    body,
    author_id: profile.id,
    entity_type: "deal",
    entity_id: dealId,
    is_pinned: isPinned,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/pipeline/${dealId}`);
}

export async function deleteNote(noteId: string, dealId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("notes").delete().eq("id", noteId);
  if (error) throw new Error(error.message);
  revalidatePath(`/pipeline/${dealId}`);
}
