"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createNote, deleteNote } from "@/lib/actions/notes";
import type { Note } from "@/types/pipeline";
import { Pin, Plus, Trash2 } from "lucide-react";

export function NotePanel({ dealId, notes }: { dealId: string; notes: Note[] }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    try {
      await createNote(dealId, body.trim(), pinned);
      setBody("");
      setPinned(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(noteId: string) {
    if (!confirm("Delete this note?")) return;
    await deleteNote(noteId, dealId);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
      </div>
      <form onSubmit={handleSubmit} className="border-b border-gray-200 bg-gray-50 p-5">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a note…"
          rows={3}
        />
        <div className="mt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
            Pin note
          </label>
          <Button type="submit" size="sm" disabled={loading || !body.trim()}>
            <Plus className="mr-1.5 h-4 w-4" />
            {loading ? "Saving…" : "Add Note"}
          </Button>
        </div>
      </form>
      {notes.length === 0 ? (
        <p className="p-8 text-center text-sm text-gray-500">No notes yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {notes.map((n) => (
            <li key={n.id} className="flex items-start justify-between gap-4 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  {n.is_pinned && (
                    <Badge variant="gold">
                      <Pin className="mr-1 h-3 w-3" />
                      Pinned
                    </Badge>
                  )}
                  <span className="text-xs text-gray-400">
                    {n.author?.full_name} · {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{n.body}</p>
              </div>
              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-600" onClick={() => handleDelete(n.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
