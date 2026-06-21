import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  MEETING_TYPES,
  MEETING_STATUSES,
  labelFor,
  statusVariant,
} from "@/lib/constants/regulatory";
import type { RegulatoryMeeting } from "@/types/regulatory";

export function MeetingTable({ meetings }: { meetings: RegulatoryMeeting[] }) {
  if (meetings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
        No regulatory meetings yet.{" "}
        <Link href="/regulatory/meetings/new" className="text-brand-purple hover:underline">
          Create one
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Meeting</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Regulator</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Territory</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {meetings.map((m) => (
            <tr key={m.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <Link href={`/regulatory/meetings/${m.id}`} className="font-medium text-brand-purple hover:underline">
                  {m.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-600">
                {new Date(m.meeting_date).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-gray-600">{labelFor(MEETING_TYPES, m.meeting_type)}</td>
              <td className="px-4 py-3 text-gray-600">{m.regulator?.name ?? "—"}</td>
              <td className="px-4 py-3 text-gray-600">{m.territory?.name ?? "—"}</td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant(m.status)}>{labelFor(MEETING_STATUSES, m.status)}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
