import { getVersionContent } from "@/lib/actions/documents";
import {
  getObjectText,
  isInlineStorage,
  isStorageConfigured,
  parseS3Location,
} from "@/lib/s3/storage";
import type { DocumentVersion } from "@/types/documents";

/** Markdown / AI drafts stored inline or as .md in S3. */
export function isTextDocumentStorage(storageUrl: string) {
  if (isInlineStorage(storageUrl)) return true;
  if (!storageUrl.startsWith("s3://") && !storageUrl.startsWith("http")) return false;
  const key = parseS3Location(storageUrl)?.key.toLowerCase() ?? "";
  return key.endsWith(".md") || key.endsWith(".markdown") || key.endsWith(".txt");
}

export async function loadDocumentVersionContent(version: DocumentVersion): Promise<string> {
  if (isInlineStorage(version.storage_url)) {
    const content = await getVersionContent(version);
    if (content) return content;
    throw new Error("Inline document content is missing");
  }

  if (isStorageConfigured() && parseS3Location(version.storage_url)) {
    return getObjectText(version.storage_url);
  }

  throw new Error("Could not load document content");
}
