import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { labelFor, DOCUMENT_STATUSES, DOCUMENT_TYPES, documentStatusVariant } from "@/lib/constants/documents";
import type { Document } from "@/types/documents";
import { ChevronRight, FileText, Sparkles } from "lucide-react";

function link(row: Document["organization"]) {
  if (!row) return null;
  return Array.isArray(row) ? row[0] : row;
}

export function DocumentTable({ documents }: { documents: Document[] }) {
  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">No documents yet.</p>
        <Link href="/documents/new" className="mt-2 inline-block text-sm text-brand-purple hover:underline">
          Create or AI-draft your first document
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Linked To</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {documents.map((doc) => {
            const org = link(doc.organization);
            const deal = link(doc.deal);
            return (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/documents/${doc.id}`} className="flex items-center gap-2 font-medium text-gray-900 hover:text-brand-purple">
                    <FileText className="h-4 w-4 text-brand-purple" />
                    {doc.title}
                    {doc.ai_generated && <Sparkles className="h-3 w-3 text-brand-gold" aria-label="AI generated" />}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{labelFor(DOCUMENT_TYPES, doc.document_type)}</td>
                <td className="px-4 py-3">
                  <Badge variant={documentStatusVariant(doc.status)}>{labelFor(DOCUMENT_STATUSES, doc.status)}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {org?.name ?? deal?.name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/documents/${doc.id}`} className="text-gray-400 hover:text-brand-purple">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
