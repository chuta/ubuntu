import type { DocumentType } from "@/types/documents";

/** Document types exported as PowerPoint (pptx-SKILL.md). */
export const PRESENTATION_DOCUMENT_TYPES: DocumentType[] = ["INVESTOR_DECK", "GOVERNMENT_BRIEF"];

export function isPresentationDocumentType(type: DocumentType | string): boolean {
  return PRESENTATION_DOCUMENT_TYPES.includes(type as DocumentType);
}

export function preferredExportFormat(type: DocumentType | string): "pptx" | "docx" {
  return isPresentationDocumentType(type) ? "pptx" : "docx";
}

export type OfficeExportFormat = "docx" | "pptx" | "pdf" | "md";
