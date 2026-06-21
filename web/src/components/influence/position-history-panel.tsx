"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/crm/form-field";
import { Badge } from "@/components/ui/badge";
import { createPosition, deletePosition } from "@/lib/actions/influence";
import type { ContactPositionHistory } from "@/types/influence";
import { Plus, Trash2 } from "lucide-react";

type OrgOption = { id: string; name: string };

export function PositionHistoryPanel({
  contactId,
  positions,
  organizations,
  revalidatePaths = [],
}: {
  contactId: string;
  positions: ContactPositionHistory[];
  organizations: OrgOption[];
  revalidatePaths?: string[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createPosition(
        {
          contact_id: contactId,
          organization_id: fd.get("organization_id") as string,
          title: fd.get("title") as string,
          start_date: (fd.get("start_date") as string) || undefined,
          end_date: (fd.get("end_date") as string) || undefined,
          is_current: fd.get("is_current") === "on",
          notes: (fd.get("notes") as string) || undefined,
        },
        revalidatePaths
      );
      setShowForm(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this position?")) return;
    await deletePosition(id, revalidatePaths);
    router.refresh();
  }

  return (
    <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Career History</h4>
        {!showForm && (
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-3 w-3" />Add Role
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-3 space-y-2 border-b border-gray-200 pb-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <FormField label="Organization" htmlFor={`org-${contactId}`}>
              <Select id={`org-${contactId}`} name="organization_id" required defaultValue="">
                <option value="" disabled>Select org</option>
                {organizations.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Title" htmlFor={`title-${contactId}`}>
              <Input id={`title-${contactId}`} name="title" required />
            </FormField>
            <FormField label="Start" htmlFor={`start-${contactId}`}>
              <Input id={`start-${contactId}`} name="start_date" type="date" />
            </FormField>
            <FormField label="End" htmlFor={`end-${contactId}`}>
              <Input id={`end-${contactId}`} name="end_date" type="date" />
            </FormField>
            <FormField label="Notes" htmlFor={`notes-${contactId}`} className="sm:col-span-2">
              <Textarea id={`notes-${contactId}`} name="notes" rows={2} />
            </FormField>
            <label className="flex items-center gap-2 text-xs text-gray-700 sm:col-span-2">
              <input type="checkbox" name="is_current" className="rounded border-gray-300" />
              Current role
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {positions.length === 0 ? (
        <p className="text-xs text-gray-400">No position history recorded.</p>
      ) : (
        <ul className="space-y-2">
          {positions.map((p) => (
            <li key={p.id} className="flex items-start justify-between text-xs">
              <div>
                <span className="font-medium text-gray-800">{p.title}</span>
                <span className="text-gray-500"> · {p.organization?.name ?? "Unknown org"}</span>
                {p.is_current && <Badge variant="green" className="ml-2">Current</Badge>}
                <p className="text-gray-400">
                  {p.start_date ? new Date(p.start_date).toLocaleDateString() : "?"}
                  {" – "}
                  {p.is_current ? "Present" : p.end_date ? new Date(p.end_date).toLocaleDateString() : "?"}
                </p>
              </div>
              <Button size="sm" variant="ghost" className="h-6 text-red-400" onClick={() => handleDelete(p.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
