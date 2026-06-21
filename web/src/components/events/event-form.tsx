"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/crm/form-field";
import { createEvent, updateEvent, type EventFormData } from "@/lib/actions/events";
import { EVENT_TYPES, UBUNTU_ROLES } from "@/lib/constants/events";
import type { Event } from "@/types/events";
import type { Territory } from "@/types/crm";

export function EventForm({
  territories,
  event,
}: {
  territories: Territory[];
  event?: Event;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const data: EventFormData = {
      name: fd.get("name") as string,
      event_type: fd.get("event_type") as EventFormData["event_type"],
      start_date: fd.get("start_date") as string,
      end_date: (fd.get("end_date") as string) || undefined,
      location: (fd.get("location") as string) || undefined,
      country_code: (fd.get("country_code") as string) || undefined,
      territory_id: (fd.get("territory_id") as string) || undefined,
      description: (fd.get("description") as string) || undefined,
      budget: fd.get("budget") ? Number(fd.get("budget")) : undefined,
      actual_cost: fd.get("actual_cost") ? Number(fd.get("actual_cost")) : undefined,
      ubuntu_role: (fd.get("ubuntu_role") as EventFormData["ubuntu_role"]) || undefined,
      roi_notes: (fd.get("roi_notes") as string) || undefined,
    };

    try {
      if (event) {
        await updateEvent(event.id, data);
        router.push(`/events/${event.id}`);
      } else {
        const id = await createEvent(data);
        router.push(`/events/${id}`);
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
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Event Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Event Name" htmlFor="name" required className="sm:col-span-2">
            <Input id="name" name="name" required defaultValue={event?.name} />
          </FormField>
          <FormField label="Type" htmlFor="event_type" required>
            <Select id="event_type" name="event_type" required defaultValue={event?.event_type ?? ""}>
              <option value="" disabled>Select type</option>
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Ubuntu Role" htmlFor="ubuntu_role">
            <Select id="ubuntu_role" name="ubuntu_role" defaultValue={event?.ubuntu_role ?? ""}>
              <option value="">Not specified</option>
              {UBUNTU_ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Start Date" htmlFor="start_date" required>
            <Input id="start_date" name="start_date" type="date" required defaultValue={event?.start_date?.slice(0, 10)} />
          </FormField>
          <FormField label="End Date" htmlFor="end_date">
            <Input id="end_date" name="end_date" type="date" defaultValue={event?.end_date?.slice(0, 10) ?? ""} />
          </FormField>
          <FormField label="Location" htmlFor="location">
            <Input id="location" name="location" defaultValue={event?.location ?? ""} />
          </FormField>
          <FormField label="Territory" htmlFor="territory_id">
            <Select id="territory_id" name="territory_id" defaultValue={event?.territory_id ?? ""}>
              <option value="">None</option>
              {territories.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Country Code" htmlFor="country_code">
            <Input id="country_code" name="country_code" maxLength={2} placeholder="NG" defaultValue={event?.country_code ?? ""} />
          </FormField>
          <FormField label="Budget (USD)" htmlFor="budget">
            <Input id="budget" name="budget" type="number" min={0} step="0.01" defaultValue={event?.budget ?? ""} />
          </FormField>
          <FormField label="Actual Cost (USD)" htmlFor="actual_cost">
            <Input id="actual_cost" name="actual_cost" type="number" min={0} step="0.01" defaultValue={event?.actual_cost ?? ""} />
          </FormField>
          <FormField label="Description" htmlFor="description" className="sm:col-span-2">
            <Textarea id="description" name="description" rows={3} defaultValue={event?.description ?? ""} />
          </FormField>
          <FormField label="ROI Notes" htmlFor="roi_notes" className="sm:col-span-2">
            <Textarea id="roi_notes" name="roi_notes" rows={2} defaultValue={event?.roi_notes ?? ""} placeholder="Post-event ROI assessment" />
          </FormField>
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : event ? "Update Event" : "Create Event"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
