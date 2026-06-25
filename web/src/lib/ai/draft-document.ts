import type { DocumentType } from "@/types/documents";
import {
  generateBrandedDraft,
  generateDraftBody,
  isAiConfigured as isAiConfiguredCore,
} from "@/lib/documents/draft-core";

const DAILY_DRAFT_LIMIT = 20;

export function isAiConfigured(): boolean {
  return isAiConfiguredCore();
}

/** Returns the raw (unbranded) markdown draft from Claude. */
export async function generateDocumentDraft(params: {
  documentType: DocumentType;
  organizationName?: string;
  dealName?: string;
  keyTerms?: string;
  additionalContext?: string;
}): Promise<string> {
  return generateDraftBody({
    documentType: params.documentType,
    title: "",
    organizationName: params.organizationName,
    dealName: params.dealName,
    keyTerms: params.keyTerms,
    additionalContext: params.additionalContext,
  });
}

export { generateBrandedDraft, DAILY_DRAFT_LIMIT };
