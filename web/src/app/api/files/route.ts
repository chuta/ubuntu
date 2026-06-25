import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getPresignedDownloadUrl,
  getPresignedUploadUrl,
  isStorageConfigured,
  isInlineStorage,
  parseS3Location,
} from "@/lib/s3/storage";
import { getDocumentVersions } from "@/lib/actions/documents";
import {
  isTextDocumentStorage,
  loadDocumentVersionContent,
} from "@/lib/documents/version-content";

export async function GET() {
  return NextResponse.json({
    configured: isStorageConfigured(),
    bucket: process.env.AWS_S3_BUCKET_NAME ?? process.env.AWS_S3_BUCKET ?? null,
    ai: Boolean(process.env.ANTHROPIC_API_KEY),
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { operation, key, contentType, storageUrl, versionId, documentId } = body;

  if (operation === "upload") {
    if (!isStorageConfigured()) {
      return NextResponse.json({ error: "S3 not configured" }, { status: 503 });
    }
    if (!key || !contentType) {
      return NextResponse.json({ error: "key and contentType required" }, { status: 400 });
    }
    const result = await getPresignedUploadUrl(key, contentType);
    return NextResponse.json(result);
  }

  if (operation === "download") {
    if (versionId) {
      if (!documentId) {
        return NextResponse.json({ error: "documentId required" }, { status: 400 });
      }

      const versions = await getDocumentVersions(documentId);
      const version = versions.find((v) => v.id === versionId);
      if (!version) return NextResponse.json({ error: "Version not found" }, { status: 404 });

      if (isTextDocumentStorage(version.storage_url)) {
        try {
          const content = await loadDocumentVersionContent(version);
          return NextResponse.json({
            inline: true,
            content,
            filename: `document-v${version.version_number}.md`,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Download unavailable";
          return NextResponse.json({ error: message }, { status: 500 });
        }
      }

      if (isInlineStorage(version.storage_url)) {
        return NextResponse.json({ error: "Download unavailable" }, { status: 503 });
      }

      if (!isStorageConfigured() || !parseS3Location(version.storage_url)) {
        return NextResponse.json({ error: "Download unavailable" }, { status: 503 });
      }

      try {
        const url = await getPresignedDownloadUrl(version.storage_url);
        return NextResponse.json({ url, filename: `v${version.version_number}` });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Download unavailable";
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    if (!storageUrl || !isStorageConfigured()) {
      return NextResponse.json({ error: "Download unavailable" }, { status: 503 });
    }

    if (!parseS3Location(storageUrl)) {
      return NextResponse.json({ error: "Invalid storage URL" }, { status: 400 });
    }

    try {
      const url = await getPresignedDownloadUrl(storageUrl);
      return NextResponse.json({ url });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Download unavailable";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
}
