"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/crm/form-field";
import { createActivity } from "@/lib/actions/activities";
import { ACTIVITY_TYPES } from "@/lib/constants/deals";
import type { WorkspaceContext } from "@/lib/workspace-context";
import type { Activity } from "@/types/pipeline";
import { Plus } from "lucide-react";

export function ActivityPanel({
  workspace,
  activities,
}: {
  workspace: WorkspaceContext;
  activities: Activity[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createActivity(workspace, {
        activity_type: fd.get("activity_type") as Activity["activity_type"],
        subject: fd.get("subject") as string,
        description: (fd.get("description") as string) || undefined,
        occurred_at: new Date(fd.get("occurred_at") as string).toISOString(),
        duration_minutes: fd.get("duration_minutes") ? Number(fd.get("duration_minutes")) : undefined,
        outcome: (fd.get("outcome") as string) || undefined,
      });
      setShowForm(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">Activities</h3>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Log Activity
          </Button>
        )}
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="border-b border-gray-200 bg-gray-50 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Type" htmlFor="activity_type" required>
              <Select id="activity_type" name="activity_type" required defaultValue="MEETING">
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Date & Time" htmlFor="occurred_at" required>
              <Input id="occurred_at" name="occurred_at" type="datetime-local" required defaultValue={new Date().toISOString().slice(0, 16)} />
            </FormField>
            <FormField label="Subject" htmlFor="subject" required className="sm:col-span-2">
              <Input id="subject" name="subject" required />
            </FormField>
            <FormField label="Duration (min)" htmlFor="duration_minutes">
              <Input id="duration_minutes" name="duration_minutes" type="number" min="0" />
            </FormField>
            <FormField label="Outcome" htmlFor="outcome">
              <Input id="outcome" name="outcome" />
            </FormField>
            <FormField label="Notes" htmlFor="description" className="sm:col-span-2">
              <Textarea id="description" name="description" rows={2} />
            </FormField>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" size="sm" disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}
      {activities.length === 0 && !showForm ? (
        <p className="p-8 text-center text-sm text-gray-500">No activities logged yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {activities.map((a) => (
            <li key={a.id} className="px-5 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{a.subject}</p>
                  <p className="text-xs text-gray-500">
                    {ACTIVITY_TYPES.find((t) => t.value === a.activity_type)?.label} ·{" "}
                    {new Date(a.occurred_at).toLocaleString()}
                    {a.logged_by?.full_name && ` · ${a.logged_by.full_name}`}
                  </p>
                  {a.outcome && <p className="mt-1 text-sm text-gray-600">{a.outcome}</p>}
                  {a.description && <p className="mt-1 text-sm text-gray-500">{a.description}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
