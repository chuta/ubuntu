"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/crm/form-field";
import { createTask, updateTaskStatus } from "@/lib/actions/tasks";
import { DEAL_PRIORITIES, TASK_STATUSES } from "@/lib/constants/deals";
import type { ProfileOption, Task, TaskStatus } from "@/types/pipeline";
import { Plus } from "lucide-react";

export function TaskPanel({
  dealId,
  organizationId,
  tasks,
  profiles,
}: {
  dealId: string;
  organizationId: string;
  tasks: Task[];
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
      await createTask(dealId, organizationId, {
        title: fd.get("title") as string,
        description: (fd.get("description") as string) || undefined,
        assignee_id: fd.get("assignee_id") as string,
        due_date: (fd.get("due_date") as string) || undefined,
        priority: (fd.get("priority") as Task["priority"]) || undefined,
      });
      setShowForm(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    await updateTaskStatus(taskId, status, dealId);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">Tasks</h3>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Task
          </Button>
        )}
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="border-b border-gray-200 bg-gray-50 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Title" htmlFor="title" required className="sm:col-span-2">
              <Input id="title" name="title" required />
            </FormField>
            <FormField label="Assignee" htmlFor="assignee_id" required>
              <Select id="assignee_id" name="assignee_id" required>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Due Date" htmlFor="due_date">
              <Input id="due_date" name="due_date" type="date" />
            </FormField>
            <FormField label="Priority" htmlFor="priority">
              <Select id="priority" name="priority">
                <option value="">Not set</option>
                {DEAL_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
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
      {tasks.length === 0 && !showForm ? (
        <p className="p-8 text-center text-sm text-gray-500">No tasks yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-medium text-gray-900">{t.title}</p>
                <p className="text-xs text-gray-500">
                  {t.assignee?.full_name}
                  {t.due_date && ` · Due ${new Date(t.due_date).toLocaleDateString()}`}
                </p>
              </div>
              <Select
                value={t.status}
                onChange={(e) => handleStatusChange(t.id, e.target.value as TaskStatus)}
                className="w-36"
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
