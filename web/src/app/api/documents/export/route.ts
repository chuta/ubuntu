import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDocumentVersions, getVersionContent } from "@/lib/actions/documents";
import { buildBrandedDocumentDocx } from "@/lib/docx/branded-document";
import { preferredExportFormat } from "@/lib/documents/format-routing";
import { buildBrandedPresentationPptx } from "@/lib/pptx/branded-presentation";
import { getObjectText, isInlineStorage, isStorageConfigured } from "@/lib/s3/storage";
import { labelFor, DOCUMENT_TYPES } from "@/lib/constants/documents";
import type { OfficeExportFormat } from "@/lib/documents/format-routing";

async function loadVersionMarkdown(
  documentId: string,
  versionId: string
): Promise<{ content: string; versionNumber: number; title: string; documentType: string }> {
  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("documents")
    .select("title, document_type")
    .eq("id", documentId)
    .single();
  if (!doc) throw new Error("Document not found");

  const versions = await getDocumentVersions(documentId);
  const version = versions.find((v) => v.id === versionId);
  if (!version) throw new Error("Version not found");

  let content: string | null = null;
  if (isInlineStorage(version.storage_url)) {
    content = await getVersionContent(version);
  } else if (isStorageConfigured()) {
    content = await getObjectText(version.storage_url);
  }
  if (!content) throw new Error("Could not load document content");

  return {
    content,
    versionNumber: version.version_number,
    title: doc.title,
    documentType: doc.document_type,
  };
}

function safeFilename(title: string, versionNumber: number, ext: string) {
  return `${title.replace(/[^\w\s-]/g, "").trim() || "document"}-v${versionNumber}.${ext}`;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { documentId, versionId, format } = body as {
    documentId?: string;
    versionId?: string;
    format?: OfficeExportFormat;
  };

  if (!documentId || !versionId) {
    return NextResponse.json({ error: "documentId and versionId required" }, { status: 400 });
  }

  try {
    const { content, versionNumber, title, documentType } = await loadVersionMarkdown(
      documentId,
      versionId
    );

    const resolvedFormat = format ?? preferredExportFormat(documentType);

    if (resolvedFormat === "md") {
      return new NextResponse(content, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="${safeFilename(title, versionNumber, "md")}"`,
        },
      });
    }

    if (resolvedFormat === "pptx") {
      const buffer = await buildBrandedPresentationPptx({ title, bodyMarkdown: content });
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "Content-Disposition": `attachment; filename="${safeFilename(title, versionNumber, "pptx")}"`,
        },
      });
    }

    const buffer = await buildBrandedDocumentDocx({
      title,
      documentTypeLabel: labelFor(DOCUMENT_TYPES, documentType),
      bodyMarkdown: content,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${safeFilename(title, versionNumber, "docx")}"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
