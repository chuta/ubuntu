"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/crm/form-field";
import { Badge } from "@/components/ui/badge";
import {
  addMeetingAttendee,
  removeMeetingAttendee,
} from "@/lib/actions/regulatory";
import { ATTENDANCE_ROLES, labelFor } from "@/lib/constants/regulatory";
import type { RegulatoryMeetingAttendee } from "@/types/regulatory";

export function MeetingAttendeesPanel({
  meetingId,
  attendees,
  contacts,
}: {
  meetingId: string;
  attendees: RegulatoryMeetingAttendee[];
  contacts: { id: string; first_name: string; last_name: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingIds = new Set(attendees.map((a) => a.contact_id));
  const available = contacts.filter((c) => !existingIds.has(c.id));

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const contactId = fd.get("contact_id") as string;
    const role = fd.get("attendance_role") as RegulatoryMeetingAttendee["attendance_role"];
    try {
      await addMeetingAttendee(meetingId, contactId, role);
      router.refresh();
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add attendee");
    }
    setLoading(false);
  }

  async function handleRemove(attendeeId: string) {
    if (!confirm("Remove this attendee?")) return;
    try {
      await removeMeetingAttendee(attendeeId, meetingId);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove");
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Attendees</h3>

      {attendees.length === 0 ? (
        <p className="mb-4 text-sm text-gray-400">No attendees recorded yet.</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {attendees.map((a) => (
            <li key={a.id} className="flex items-center justify-between text-sm">
              <span>
                {a.contact?.first_name} {a.contact?.last_name}
                <Badge variant="default" className="ml-2">
                  {labelFor(ATTENDANCE_ROLES, a.attendance_role)}
                </Badge>
              </span>
              <Button type="button" variant="outline" size="sm" onClick={() => handleRemove(a.id)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {available.length > 0 && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 border-t border-gray-100 pt-4">
          <FormField label="Contact" htmlFor="contact_id">
            <Select id="contact_id" name="contact_id" required defaultValue="">
              <option value="" disabled>Select contact</option>
              {available.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Role" htmlFor="attendance_role">
            <Select id="attendance_role" name="attendance_role" defaultValue="OTHER">
              {ATTENDANCE_ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>
          </FormField>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Adding…" : "Add Attendee"}
          </Button>
        </form>
      )}
    </div>
  );
}
