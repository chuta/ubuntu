import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CONSULTATION_RESPONSE_STATUSES, labelFor, statusVariant } from "@/lib/constants/regulatory";
import type { RegulatoryConsultation } from "@/types/regulatory";

function isOverdue(deadline: string | null) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

export function ConsultationTable({ consultations }: { consultations: RegulatoryConsultation[] }) {
  if (consultations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
        No consultations yet.{" "}
        <Link href="/regulatory/consultations/new" className="text-brand-purple hover:underline">Create one</Link>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Regulator</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Deadline</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Response</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {consultations.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <Link href={`/regulatory/consultations/${c.id}`} className="font-medium text-brand-purple hover:underline">{c.title}</Link>
                {isOverdue(c.response_deadline) && c.response_status !== "SUBMITTED" && (
                  <Badge variant="red" className="ml-2">Overdue</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">{c.regulator?.name ?? "—"}</td>
              <td className="px-4 py-3 text-gray-600">{c.response_deadline ? new Date(c.response_deadline).toLocaleDateString() : "—"}</td>
              <td className="px-4 py-3"><Badge variant={statusVariant(c.response_status)}>{labelFor(CONSULTATION_RESPONSE_STATUSES, c.response_status)}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ConsultationDetail({ consultation }: { consultation: RegulatoryConsultation }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant={statusVariant(consultation.response_status)}>{labelFor(CONSULTATION_RESPONSE_STATUSES, consultation.response_status)}</Badge>
        {isOverdue(consultation.response_deadline) && consultation.response_status !== "SUBMITTED" && (
          <Badge variant="red">Overdue</Badge>
        )}
      </div>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div><dt className="text-xs font-medium uppercase text-gray-500">Territory</dt><dd className="mt-0.5 text-sm">{consultation.territory?.name ?? "—"}</dd></div>
        <div><dt className="text-xs font-medium uppercase text-gray-500">Regulator</dt><dd className="mt-0.5 text-sm">{consultation.regulator?.name ?? "—"}</dd></div>
        <div><dt className="text-xs font-medium uppercase text-gray-500">Published</dt><dd className="mt-0.5 text-sm">{consultation.published_date ? new Date(consultation.published_date).toLocaleDateString() : "—"}</dd></div>
        <div><dt className="text-xs font-medium uppercase text-gray-500">Deadline</dt><dd className="mt-0.5 text-sm">{consultation.response_deadline ? new Date(consultation.response_deadline).toLocaleDateString() : "—"}</dd></div>
        <div className="sm:col-span-2"><dt className="text-xs font-medium uppercase text-gray-500">URL</dt><dd className="mt-0.5 text-sm">{consultation.consultation_url ? <a href={consultation.consultation_url} target="_blank" rel="noreferrer" className="text-brand-purple hover:underline">{consultation.consultation_url}</a> : "—"}</dd></div>
        <div><dt className="text-xs font-medium uppercase text-gray-500">Response Document</dt><dd className="mt-0.5 text-sm">{consultation.response_document ? <Link href={`/documents/${consultation.our_response_document_id}`} className="text-brand-purple hover:underline">{consultation.response_document.title}</Link> : "—"}</dd></div>
      </dl>
      {consultation.notes && <div className="mt-4"><dt className="text-xs font-medium uppercase text-gray-500">Notes</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{consultation.notes}</dd></div>}
    </div>
  );
}
