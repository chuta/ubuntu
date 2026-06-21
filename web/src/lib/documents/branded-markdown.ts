import {
  documentFooterMarkdown,
  documentLetterheadMarkdown,
} from "@/lib/branding/ubuntu-tribe";

export function applyDocumentBranding(
  body: string,
  meta: { title: string; documentTypeLabel: string }
): string {
  const trimmed = body.trim();
  const letterhead = documentLetterheadMarkdown(meta.title, meta.documentTypeLabel);
  const footer = documentFooterMarkdown();
  return `${letterhead}${trimmed}${footer}`;
}
