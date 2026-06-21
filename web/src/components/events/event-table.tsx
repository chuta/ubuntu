import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EVENT_TYPES, labelFor, UBUNTU_ROLES } from "@/lib/constants/events";
import { formatCurrency } from "@/lib/utils";
import type { Event } from "@/types/events";

export function EventTable({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
        No events yet.{" "}
        <Link href="/events/new" className="text-brand-purple hover:underline">Create one</Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Event</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Location</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">Budget</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {events.map((event) => (
            <tr key={event.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <Link href={`/events/${event.id}`} className="font-medium text-brand-purple hover:underline">
                  {event.name}
                </Link>
                {event.google_event_id && (
                  <Badge variant="blue" className="ml-2">Google</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">{labelFor(EVENT_TYPES, event.event_type)}</td>
              <td className="px-4 py-3 text-gray-600">
                {new Date(event.start_date).toLocaleDateString()}
                {event.end_date && event.end_date !== event.start_date && (
                  <> – {new Date(event.end_date).toLocaleDateString()}</>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {event.location ?? event.territory?.name ?? "—"}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {labelFor(UBUNTU_ROLES, event.ubuntu_role)}
              </td>
              <td className="px-4 py-3 text-right text-gray-600">
                {event.budget != null ? formatCurrency(event.budget) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
