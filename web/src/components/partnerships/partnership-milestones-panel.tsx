"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/crm/form-field";
import {
  createPartnershipMilestone,
  deletePartnershipMilestone,
  updateMilestoneStatus,
} from "@/lib/actions/partnership-milestones";
import {
  labelFor,
  MILESTONE_STATUSES,
  milestoneStatusVariant,
} from "@/lib/constants/partnerships";
import type { MilestoneStatus, PartnershipMilestone } from "@/types/partnerships";
import type { ProfileOption } from "@/types/pipeline";
import { Plus, Trash2 } from "lucide-react";

function isOverdue(dueDate: string | null, status: MilestoneStatus): boolean {
  if (!dueDate || status === "COMPLETED" || status === "CANCELLED") return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

export function PartnershipMilestonesPanel({
  partnershipId,
  milestones,
  profiles,
}: {
  partnershipId: string;
  milestones: PartnershipMilestone[];
  profiles: ProfileOption[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createPartnershipMilestone(partnershipId, {
        title: fd.get("title") as string,
        description: (fd.get("description") as string) || undefined,
        due_date: (fd.get("due_date") as string) || undefined,
        assignee_id: (fd.get("assignee_id") as string) || undefined,
      });
      setShowForm(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(milestoneId: string, status: MilestoneStatus) {
    await updateMilestoneStatus(milestoneId, status, partnershipId);
    router.refresh();
  }

  async function handleDelete(milestoneId: string) {
    if (!confirm("Delete this milestone?")) return;
    await deletePartnershipMilestone(milestoneId, partnershipId);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Implementation Milestones</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Track pilot scope, integration, and go-to-market tests.
          </p>
        </div>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Milestone
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border-b border-gray-200 bg-gray-50 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Title" htmlFor="title" required className="sm:col-span-2">
              <Input id="title" name="title" required placeholder="e.g. Pilot scope agreed" />
            </FormField>
            <FormField label="Due Date" htmlFor="due_date">
              <Input id="due_date" name="due_date" type="date" />
            </FormField>
            <FormField label="Assignee" htmlFor="assignee_id">
              <Select id="assignee_id" name="assignee_id">
                <option value="">Unassigned</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Description" htmlFor="description" className="sm:col-span-2">
              <Textarea id="description" name="description" rows={2} />
            </FormField>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" size="sm" disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {milestones.length === 0 && !showForm ? (
        <p className="p-8 text-center text-sm text-gray-500">No milestones yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {milestones.map((m) => {
            const overdue = isOverdue(m.due_date, m.status);
            return (
              <li key={m.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-gray-900">{m.title}</p>
                    <Badge variant={milestoneStatusVariant(m.status)}>
                      {labelFor(MILESTONE_STATUSES, m.status)}
                    </Badge>
                    {overdue && <Badge variant="red">Overdue</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {m.assignee?.full_name ?? "Unassigned"}
                    {m.due_date && ` · Due ${new Date(m.due_date).toLocaleDateString()}`}
                  </p>
                  {m.description && (
                    <p className="mt-1 text-sm text-gray-600">{m.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Select
                    value={m.status}
                    onChange={(e) => handleStatusChange(m.id, e.target.value as MilestoneStatus)}
                    className="w-36"
                  >
                    {MILESTONE_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </Select>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-red-600"
                    onClick={() => handleDelete(m.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
