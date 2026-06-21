import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { REQUIREMENT_CATEGORIES, COMPLIANCE_STATUSES, labelFor, statusVariant } from "@/lib/constants/regulatory";
import type { RegulatoryRequirement } from "@/types/regulatory";

function isOverdue(dueDate: string | null, status: string) {
  if (!dueDate || status === "MET" || status === "NOT_APPLICABLE") return false;
  return new Date(dueDate) < new Date();
}

export function RequirementTable({ requirements }: { requirements: RegulatoryRequirement[] }) {
  if (requirements.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
        No requirements yet.{" "}
        <Link href="/regulatory/requirements/new" className="text-brand-purple hover:underline">Create one</Link>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Requirement</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Territory</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Due</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {requirements.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <Link href={`/regulatory/requirements/${r.id}`} className="font-medium text-brand-purple hover:underline">{r.title}</Link>
                {isOverdue(r.due_date, r.compliance_status) && <Badge variant="red" className="ml-2">Overdue</Badge>}
              </td>
              <td className="px-4 py-3 text-gray-600">{labelFor(REQUIREMENT_CATEGORIES, r.category)}</td>
              <td className="px-4 py-3 text-gray-600">{r.territory?.name ?? "—"}</td>
              <td className="px-4 py-3 text-gray-600">{r.due_date ? new Date(r.due_date).toLocaleDateString() : "—"}</td>
              <td className="px-4 py-3"><Badge variant={statusVariant(r.compliance_status)}>{labelFor(COMPLIANCE_STATUSES, r.compliance_status)}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RequirementDetail({ requirement }: { requirement: RegulatoryRequirement }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant="purple">{labelFor(REQUIREMENT_CATEGORIES, requirement.category)}</Badge>
        <Badge variant={statusVariant(requirement.compliance_status)}>{labelFor(COMPLIANCE_STATUSES, requirement.compliance_status)}</Badge>
        {isOverdue(requirement.due_date, requirement.compliance_status) && <Badge variant="red">Overdue</Badge>}
      </div>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div><dt className="text-xs font-medium uppercase text-gray-500">Territory</dt><dd className="mt-0.5 text-sm">{requirement.territory?.name ?? "—"}</dd></div>
        <div><dt className="text-xs font-medium uppercase text-gray-500">Product</dt><dd className="mt-0.5 text-sm">{requirement.product?.name ?? "—"}</dd></div>
        <div><dt className="text-xs font-medium uppercase text-gray-500">Due Date</dt><dd className="mt-0.5 text-sm">{requirement.due_date ? new Date(requirement.due_date).toLocaleDateString() : "—"}</dd></div>
        <div className="sm:col-span-2"><dt className="text-xs font-medium uppercase text-gray-500">Evidence</dt><dd className="mt-0.5 text-sm">{requirement.evidence_document ? <Link href={`/documents/${requirement.evidence_document_id}`} className="text-brand-purple hover:underline">{requirement.evidence_document.title}</Link> : "—"}</dd></div>
      </dl>
      {requirement.description && <div className="mt-4"><dt className="text-xs font-medium uppercase text-gray-500">Description</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{requirement.description}</dd></div>}
    </div>
  );
}
