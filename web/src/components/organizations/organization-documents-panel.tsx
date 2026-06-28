import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  labelFor,
  DOCUMENT_STATUSES,
  DOCUMENT_TYPES,
  documentStatusVariant,
} from "@/lib/constants/documents";
import type { Document } from "@/types/documents";
import { ChevronRight, FileText, Plus, Sparkles } from "lucide-react";

function newDocumentUrl(organizationId: string, ai?: boolean) {
  const params = new URLSearchParams({ organization_id: organizationId });
  if (ai) params.set("ai", "1");
  return `/documents/new?${params.toString()}`;
}

export function OrganizationDocumentsPanel({
  organizationId,
  documents,
  entityLabel = "organization",
}: {
  organizationId: string;
  documents: Document[];
  entityLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Documents</h3>
        <div className="flex flex-wrap gap-2">
          <Link href={newDocumentUrl(organizationId)}>
            <Button size="sm" variant="outline">
              <Plus className="mr-1.5 h-4 w-4" />
              New Document
            </Button>
          </Link>
          <Link href={newDocumentUrl(organizationId, true)}>
            <Button size="sm">
              <Sparkles className="mr-1.5 h-4 w-4" />
              AI Draft
            </Button>
          </Link>
        </div>
      </div>

      {documents.length === 0 ? (
        <p className="p-8 text-center text-sm text-gray-500">
          No documents linked to this {entityLabel} yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Updated</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="flex items-center gap-2 font-medium text-gray-900 hover:text-brand-purple"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-brand-purple" />
                      {doc.title}
                      {doc.ai_generated && (
                        <Sparkles className="h-3 w-3 text-brand-gold" aria-label="AI generated" />
                      )}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {labelFor(DOCUMENT_TYPES, doc.document_type)}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={documentStatusVariant(doc.status)}>
                      {labelFor(DOCUMENT_STATUSES, doc.status)}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(doc.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/documents/${doc.id}`} className="text-gray-400 hover:text-brand-purple">
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
