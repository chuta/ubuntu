"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { labelFor, DOCUMENT_STATUSES, DOCUMENT_TYPES, documentStatusVariant } from "@/lib/constants/documents";
import { isInlineStorage } from "@/lib/s3/storage";
import type { Document, DocumentVersion } from "@/types/documents";
import { Download, Eye, FileText, Presentation, Sparkles } from "lucide-react";
import { BrandedDocumentPreview } from "@/components/documents/branded-document-preview";
import { isPresentationDocumentType, preferredExportFormat } from "@/lib/documents/format-routing";
import type { DocumentType } from "@/types/documents";

export function DocumentDetailSummary({ document }: { document: Document }) {
  const org = Array.isArray(document.organization) ? document.organization[0] : document.organization;
  const deal = Array.isArray(document.deal) ? document.deal[0] : document.deal;
  const partnership = Array.isArray(document.partnership) ? document.partnership[0] : document.partnership;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant={documentStatusVariant(document.status)}>
          {labelFor(DOCUMENT_STATUSES, document.status)}
        </Badge>
        <Badge variant="purple">{labelFor(DOCUMENT_TYPES, document.document_type)}</Badge>
        {document.ai_generated && (
          <Badge variant="gold"><Sparkles className="mr-1 h-3 w-3" />AI Draft</Badge>
        )}
      </div>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {org && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Organization</dt>
            <dd className="mt-0.5 text-sm"><Link href={`/accounts/${org.id}`} className="text-brand-purple hover:underline">{org.name}</Link></dd>
          </div>
        )}
        {deal && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Deal</dt>
            <dd className="mt-0.5 text-sm"><Link href={`/pipeline/${deal.id}`} className="text-brand-purple hover:underline">{deal.name}</Link></dd>
          </div>
        )}
        {partnership && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Partnership</dt>
            <dd className="mt-0.5 text-sm"><Link href={`/partnerships/${partnership.id}`} className="text-brand-purple hover:underline">{partnership.name}</Link></dd>
          </div>
        )}
      </dl>
    </div>
  );
}

export function VersionPanel({
  documentId,
  documentType,
  versions,
}: {
  documentId: string;
  documentType: DocumentType;
  versions: DocumentVersion[];
}) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const isDeck = isPresentationDocumentType(documentType);
  const officeFormat = preferredExportFormat(documentType);

  async function loadPreview(version: DocumentVersion) {
    setLoading(`preview-${version.id}`);
    try {
      if (isInlineStorage(version.storage_url)) {
        const res = await fetch("/api/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operation: "download", documentId, versionId: version.id }),
        });
        const data = await res.json();
        if (data.inline && data.content) setPreview(data.content);
        else alert(data.error ?? "Preview failed");
        return;
      }
      const res = await fetch("/api/documents/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, versionId: version.id, format: "md" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Preview failed");
        return;
      }
      setPreview(await res.text());
    } finally {
      setLoading(null);
    }
  }

  async function handleDownloadOffice(version: DocumentVersion) {
    setLoading(`${officeFormat}-${version.id}`);
    try {
      const res = await fetch("/api/documents/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, versionId: version.id, format: officeFormat }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Export failed");
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? `document-v${version.version_number}.${officeFormat}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(null);
    }
  }

  async function handleDownloadDocx(version: DocumentVersion) {
    setLoading(`docx-${version.id}`);
    try {
      const res = await fetch("/api/documents/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, versionId: version.id, format: "docx" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Export failed");
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? `document-v${version.version_number}.docx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(null);
    }
  }

  async function handleDownload(version: DocumentVersion) {
    setLoading(version.id);
    try {
      const res = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "download", documentId, versionId: version.id }),
      });
      const data = await res.json();
      if (data.inline && data.content) {
        setPreview(data.content);
      } else if (data.url) {
        window.open(data.url, "_blank");
      } else {
        alert(data.error ?? "Download failed");
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading("upload");
    try {
      const res = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "upload",
          key: `documents/${documentId}/v${versions.length + 1}/${file.name}`,
          contentType: file.type || "application/octet-stream",
        }),
      });
      const { url, storageUrl, error } = await res.json();
      if (error || !url) {
        alert(error ?? "S3 not configured — use AI draft for text documents");
        return;
      }
      await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      const { addDocumentVersion } = await import("@/lib/actions/documents");
      await addDocumentVersion(documentId, storageUrl, `Uploaded ${file.name}`);
      router.refresh();
    } finally {
      setLoading(null);
      e.target.value = "";
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Versions</h3>
          <p className="text-xs text-gray-500">{versions.length} version{versions.length !== 1 ? "s" : ""}</p>
        </div>
        <label className="cursor-pointer">
          <span className="inline-flex h-8 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
            {loading === "upload" ? "Uploading…" : "Upload New Version"}
          </span>
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
      </div>
      {versions.length === 0 ? (
        <p className="p-8 text-center text-sm text-gray-500">No versions yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {versions.map((v) => (
            <li key={v.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-gray-900">v{v.version_number}</p>
                <p className="text-xs text-gray-500">
                  {new Date(v.created_at).toLocaleString()}
                  {v.created_by?.full_name && ` · ${v.created_by.full_name}`}
                  {isInlineStorage(v.storage_url) && " · inline"}
                </p>
                {v.change_summary && !isInlineStorage(v.storage_url) && (
                  <p className="mt-1 text-sm text-gray-600">{v.change_summary}</p>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  title="Preview"
                  onClick={() => loadPreview(v)}
                  disabled={loading === `preview-${v.id}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  title={isDeck ? "Download branded PPTX" : "Download branded DOCX"}
                  onClick={() => handleDownloadOffice(v)}
                  disabled={loading === `${officeFormat}-${v.id}`}
                >
                  {isDeck ? <Presentation className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </Button>
                {isDeck && (
                  <Button
                    size="sm"
                    variant="ghost"
                    title="Download as DOCX (outline)"
                    onClick={() => handleDownloadDocx(v)}
                    disabled={loading === `docx-${v.id}`}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  title="Download markdown"
                  onClick={() => handleDownload(v)}
                  disabled={loading === v.id}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {preview && (
        <div className="border-t border-gray-200 bg-gray-50 p-5">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">Branded Preview</h4>
            <Button size="sm" variant="ghost" onClick={() => setPreview(null)}>Close</Button>
          </div>
          <BrandedDocumentPreview content={preview} />
        </div>
      )}
    </div>
  );
}
