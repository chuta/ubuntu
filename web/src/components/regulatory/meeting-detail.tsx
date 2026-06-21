import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  MEETING_TYPES,
  MEETING_STATUSES,
  labelFor,
  statusVariant,
} from "@/lib/constants/regulatory";
import type { RegulatoryMeeting } from "@/types/regulatory";

export function MeetingDetail({ meeting }: { meeting: RegulatoryMeeting }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="purple">{labelFor(MEETING_TYPES, meeting.meeting_type)}</Badge>
        <Badge variant={statusVariant(meeting.status)}>
          {labelFor(MEETING_STATUSES, meeting.status)}
        </Badge>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Meeting Date</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{new Date(meeting.meeting_date).toLocaleDateString()}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Territory</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{meeting.territory?.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Regulator</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{meeting.regulator?.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Linked Deal</dt>
          <dd className="mt-0.5 text-sm text-gray-900">
            {meeting.deal ? (
              <Link href={`/pipeline/${meeting.deal.id}`} className="text-brand-purple hover:underline">
                {meeting.deal.name}
              </Link>
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>

      {meeting.outcome_summary && (
        <div className="mt-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Outcome</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{meeting.outcome_summary}</dd>
        </div>
      )}

      {meeting.next_steps && (
        <div className="mt-4 rounded-lg border border-brand-gold/20 bg-brand-gold/5 p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-brand-gold">Next Steps</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{meeting.next_steps}</dd>
        </div>
      )}
    </div>
  );
}
