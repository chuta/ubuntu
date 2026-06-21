import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SUBMISSION_TYPES, SUBMISSION_STATUSES, labelFor, statusVariant } from "@/lib/constants/regulatory";
import type { RegulatorySubmission } from "@/types/regulatory";

export function SubmissionTable({ submissions }: { submissions: RegulatorySubmission[] }) {
  if (submissions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
        No submissions yet.{" "}
        <Link href="/regulatory/submissions/new" className="text-brand-purple hover:underline">Create one</Link>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Regulator</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Territory</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {submissions.map((s) => (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <Link href={`/regulatory/submissions/${s.id}`} className="font-medium text-brand-purple hover:underline">{s.title}</Link>
              </td>
              <td className="px-4 py-3 text-gray-600">{labelFor(SUBMISSION_TYPES, s.submission_type)}</td>
              <td className="px-4 py-3 text-gray-600">{s.regulator?.name ?? "—"}</td>
              <td className="px-4 py-3 text-gray-600">{s.territory?.name ?? "—"}</td>
              <td className="px-4 py-3"><Badge variant={statusVariant(s.status)}>{labelFor(SUBMISSION_STATUSES, s.status)}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SubmissionDetail({ submission }: { submission: RegulatorySubmission }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant="purple">{labelFor(SUBMISSION_TYPES, submission.submission_type)}</Badge>
        <Badge variant={statusVariant(submission.status)}>{labelFor(SUBMISSION_STATUSES, submission.status)}</Badge>
      </div>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div><dt className="text-xs font-medium uppercase text-gray-500">Territory</dt><dd className="mt-0.5 text-sm">{submission.territory?.name ?? "—"}</dd></div>
        <div><dt className="text-xs font-medium uppercase text-gray-500">Regulator</dt><dd className="mt-0.5 text-sm">{submission.regulator?.name ?? "—"}</dd></div>
        <div><dt className="text-xs font-medium uppercase text-gray-500">Reference</dt><dd className="mt-0.5 text-sm">{submission.reference_number ?? "—"}</dd></div>
        <div><dt className="text-xs font-medium uppercase text-gray-500">Submitted</dt><dd className="mt-0.5 text-sm">{submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : "—"}</dd></div>
        <div><dt className="text-xs font-medium uppercase text-gray-500">Document</dt><dd className="mt-0.5 text-sm">{submission.document ? <Link href={`/documents/${submission.document_id}`} className="text-brand-purple hover:underline">{submission.document.title}</Link> : "—"}</dd></div>
        <div><dt className="text-xs font-medium uppercase text-gray-500">Deal</dt><dd className="mt-0.5 text-sm">{submission.deal ? <Link href={`/pipeline/${submission.deal.id}`} className="text-brand-purple hover:underline">{submission.deal.name}</Link> : "—"}</dd></div>
      </dl>
      {submission.response_summary && (
        <div className="mt-4"><dt className="text-xs font-medium uppercase text-gray-500">Response</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{submission.response_summary}</dd></div>
      )}
    </div>
  );
}
