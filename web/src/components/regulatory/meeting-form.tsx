"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/crm/form-field";
import {
  createMeeting,
  updateMeeting,
  type MeetingFormData,
} from "@/lib/actions/regulatory";
import { MEETING_TYPES, MEETING_STATUSES } from "@/lib/constants/regulatory";
import type { RegulatoryMeeting } from "@/types/regulatory";
import type { Territory } from "@/types/crm";

type Option = { id: string; name: string };

export function MeetingForm({
  territories,
  organizations,
  deals,
  meeting,
}: {
  territories: Territory[];
  organizations: Option[];
  deals: { id: string; name: string }[];
  meeting?: RegulatoryMeeting;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const data: MeetingFormData = {
      title: fd.get("title") as string,
      meeting_date: fd.get("meeting_date") as string,
      meeting_type: fd.get("meeting_type") as MeetingFormData["meeting_type"],
      territory_id: fd.get("territory_id") as string,
      status: fd.get("status") as MeetingFormData["status"],
      regulator_organization_id: (fd.get("regulator_organization_id") as string) || undefined,
      deal_id: (fd.get("deal_id") as string) || undefined,
      outcome_summary: (fd.get("outcome_summary") as string) || undefined,
      next_steps: (fd.get("next_steps") as string) || undefined,
    };

    try {
      if (meeting) {
        await updateMeeting(meeting.id, data);
        router.push(`/regulatory/meetings/${meeting.id}`);
      } else {
        const id = await createMeeting(data);
        router.push(`/regulatory/meetings/${id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Meeting Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Title" htmlFor="title" required className="sm:col-span-2">
            <Input id="title" name="title" required defaultValue={meeting?.title} />
          </FormField>
          <FormField label="Meeting Date" htmlFor="meeting_date" required>
            <Input
              id="meeting_date"
              name="meeting_date"
              type="date"
              required
              defaultValue={meeting?.meeting_date?.slice(0, 10)}
            />
          </FormField>
          <FormField label="Type" htmlFor="meeting_type" required>
            <Select id="meeting_type" name="meeting_type" required defaultValue={meeting?.meeting_type ?? "IN_PERSON"}>
              {MEETING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Status" htmlFor="status" required>
            <Select id="status" name="status" required defaultValue={meeting?.status ?? "SCHEDULED"}>
              {MEETING_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Territory" htmlFor="territory_id" required>
            <Select id="territory_id" name="territory_id" required defaultValue={meeting?.territory_id ?? ""}>
              <option value="" disabled>Select territory</option>
              {territories.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Regulator" htmlFor="regulator_organization_id">
            <Select id="regulator_organization_id" name="regulator_organization_id" defaultValue={meeting?.regulator_organization_id ?? ""}>
              <option value="">None</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Linked Deal" htmlFor="deal_id">
            <Select id="deal_id" name="deal_id" defaultValue={meeting?.deal_id ?? ""}>
              <option value="">None</option>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Outcome Summary" htmlFor="outcome_summary" className="sm:col-span-2">
            <Textarea id="outcome_summary" name="outcome_summary" rows={3} defaultValue={meeting?.outcome_summary ?? ""} />
          </FormField>
          <FormField label="Next Steps" htmlFor="next_steps" className="sm:col-span-2">
            <Textarea id="next_steps" name="next_steps" rows={2} defaultValue={meeting?.next_steps ?? ""} />
          </FormField>
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : meeting ? "Update Meeting" : "Create Meeting"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
