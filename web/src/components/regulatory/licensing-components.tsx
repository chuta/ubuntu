import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { LICENSE_TYPES, LICENSING_STATUSES, labelFor, statusVariant } from "@/lib/constants/regulatory";
import type { LicensingConversation } from "@/types/regulatory";

export function LicensingTable({ conversations }: { conversations: LicensingConversation[] }) {
  if (conversations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
        No licensing conversations yet.{" "}
        <Link href="/regulatory/licensing/new" className="text-brand-purple hover:underline">Create one</Link>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">License Type</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Territory</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {conversations.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <Link href={`/regulatory/licensing/${c.id}`} className="font-medium text-brand-purple hover:underline">{c.title}</Link>
              </td>
              <td className="px-4 py-3 text-gray-600">{labelFor(LICENSE_TYPES, c.license_type)}</td>
              <td className="px-4 py-3 text-gray-600">{c.territory?.name ?? "—"}</td>
              <td className="px-4 py-3"><Badge variant={statusVariant(c.status)}>{labelFor(LICENSING_STATUSES, c.status)}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LicensingDetail({ conversation }: { conversation: LicensingConversation }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant="purple">{labelFor(LICENSE_TYPES, conversation.license_type)}</Badge>
        <Badge variant={statusVariant(conversation.status)}>{labelFor(LICENSING_STATUSES, conversation.status)}</Badge>
      </div>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div><dt className="text-xs font-medium uppercase text-gray-500">Territory</dt><dd className="mt-0.5 text-sm">{conversation.territory?.name ?? "—"}</dd></div>
        <div><dt className="text-xs font-medium uppercase text-gray-500">Regulator</dt><dd className="mt-0.5 text-sm">{conversation.regulator?.name ?? "—"}</dd></div>
        <div><dt className="text-xs font-medium uppercase text-gray-500">Primary Contact</dt><dd className="mt-0.5 text-sm">{conversation.primary_contact ? `${conversation.primary_contact.first_name} ${conversation.primary_contact.last_name}` : "—"}</dd></div>
        <div><dt className="text-xs font-medium uppercase text-gray-500">Timeline</dt><dd className="mt-0.5 text-sm">{conversation.target_timeline ?? "—"}</dd></div>
        <div><dt className="text-xs font-medium uppercase text-gray-500">Deal</dt><dd className="mt-0.5 text-sm">{conversation.deal ? <Link href={`/pipeline/${conversation.deal.id}`} className="text-brand-purple hover:underline">{conversation.deal.name}</Link> : "—"}</dd></div>
      </dl>
      {conversation.notes && <div className="mt-4"><dt className="text-xs font-medium uppercase text-gray-500">Notes</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{conversation.notes}</dd></div>}
    </div>
  );
}
