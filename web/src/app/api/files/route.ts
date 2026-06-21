import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getPresignedDownloadUrl,
  getPresignedUploadUrl,
  isStorageConfigured,
  isInlineStorage,
  parseS3Key,
} from "@/lib/s3/storage";
import { getDocumentVersions, getVersionContent } from "@/lib/actions/documents";

export async function GET() {
  return NextResponse.json({
    configured: isStorageConfigured(),
    bucket: process.env.AWS_S3_BUCKET_NAME ?? null,
    ai: Boolean(process.env.ANTHROPIC_API_KEY),
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { operation, key, contentType, storageUrl, versionId } = body;

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
      const versions = await getDocumentVersions(body.documentId);
      const version = versions.find((v) => v.id === versionId);
      if (!version) return NextResponse.json({ error: "Version not found" }, { status: 404 });

      if (isInlineStorage(version.storage_url)) {
        const content = await getVersionContent(version);
        return NextResponse.json({ inline: true, content, filename: "draft.md" });
      }

      if (!isStorageConfigured() || !parseS3Key(version.storage_url)) {
        return NextResponse.json({ error: "Download unavailable" }, { status: 503 });
      }
      const url = await getPresignedDownloadUrl(version.storage_url);
      return NextResponse.json({ url, filename: `v${version.version_number}.md` });
    }

    if (!storageUrl || !isStorageConfigured()) {
      return NextResponse.json({ error: "Download unavailable" }, { status: 503 });
    }
    const url = await getPresignedDownloadUrl(storageUrl);
    return NextResponse.json({ url });
  }

  return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
}
