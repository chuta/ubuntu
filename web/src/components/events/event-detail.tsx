import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EVENT_TYPES, labelFor, UBUNTU_ROLES } from "@/lib/constants/events";
import { formatCurrency } from "@/lib/utils";
import type { Event } from "@/types/events";

export function EventDetail({ event }: { event: Event }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="purple">{labelFor(EVENT_TYPES, event.event_type)}</Badge>
        {event.ubuntu_role && (
          <Badge variant="gold">{labelFor(UBUNTU_ROLES, event.ubuntu_role)}</Badge>
        )}
        {event.google_event_id && <Badge variant="blue">Imported from Google</Badge>}
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Start Date</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{new Date(event.start_date).toLocaleDateString()}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">End Date</dt>
          <dd className="mt-0.5 text-sm text-gray-900">
            {event.end_date ? new Date(event.end_date).toLocaleDateString() : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Location</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{event.location ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Territory</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{event.territory?.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Budget</dt>
          <dd className="mt-0.5 text-sm text-gray-900">
            {event.budget != null ? formatCurrency(event.budget) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Actual Cost</dt>
          <dd className="mt-0.5 text-sm text-gray-900">
            {event.actual_cost != null ? formatCurrency(event.actual_cost) : "—"}
          </dd>
        </div>
      </dl>

      {event.description && (
        <div className="mt-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Description</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{event.description}</dd>
        </div>
      )}

      {event.roi_notes && (
        <div className="mt-4 rounded-lg border border-brand-gold/20 bg-brand-gold/5 p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-brand-gold">ROI Notes</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{event.roi_notes}</dd>
        </div>
      )}
    </div>
  );
}

export function EventSourceDeals({ deals }: { deals: { id: string; name: string; stage: string; estimated_value: number | null }[] }) {
  if (deals.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">Deals Sourced from This Event</h3>
      <ul className="space-y-2 text-sm">
        {deals.map((d) => (
          <li key={d.id}>
            <Link href={`/pipeline/${d.id}`} className="text-brand-purple hover:underline">{d.name}</Link>
            <span className="ml-2 text-gray-400">{d.stage}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
