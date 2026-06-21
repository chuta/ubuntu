import Anthropic from "@anthropic-ai/sdk";
import type { DocumentType } from "@/types/documents";
import { labelFor, DOCUMENT_TYPES } from "@/lib/constants/documents";
import { UBUNTU_TRIBE } from "@/lib/branding/ubuntu-tribe";
import { aiDraftGuidelines } from "@/lib/documents/skill-guidelines";
import { isPresentationDocumentType } from "@/lib/documents/format-routing";

const DAILY_DRAFT_LIMIT = 20;

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function generateDocumentDraft(params: {
  documentType: DocumentType;
  organizationName?: string;
  dealName?: string;
  keyTerms?: string;
  additionalContext?: string;
}): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Anthropic API key not configured. Add ANTHROPIC_API_KEY to .env");
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const typeLabel = labelFor(DOCUMENT_TYPES, params.documentType);

  const formatGuide = aiDraftGuidelines(params.documentType);
  const deckHint = isPresentationDocumentType(params.documentType)
    ? "\n- This is a slide deck — use ---SLIDE--- between every slide after the title block"
    : "";

  const prompt = `You are a commercial legal drafting assistant for ${UBUNTU_TRIBE.name}, a pan-African tokenization and digital asset company.

Company context:
- Tagline: "${UBUNTU_TRIBE.tagline}"
- Products: ${UBUNTU_TRIBE.products}
- Website: ${UBUNTU_TRIBE.website}
- Contact: ${UBUNTU_TRIBE.contactEmail}
- Legal entity (when relevant): ${UBUNTU_TRIBE.legalEntity}

Draft a professional ${typeLabel} with the following context:

Organization: ${params.organizationName ?? "Not specified"}
Deal/Opportunity: ${params.dealName ?? "Not specified"}
Key terms to include: ${params.keyTerms ?? "Standard Ubuntu Tribe commercial terms"}
Additional context: ${params.additionalContext ?? "None"}

${formatGuide}${deckHint}

Requirements:
- Do NOT include a letterhead, logo block, or footer — those are added automatically on export
- Reference ${UBUNTU_TRIBE.name}'s mission and GIFT/UbuntuVerse capabilities where relevant
- Keep tone professional and suitable for B2G/B2B sovereign and institutional partners
- Output markdown only, no preamble or closing remarks`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content[0];
  if (block.type !== "text") throw new Error("Unexpected AI response format");
  return block.text;
}

export { DAILY_DRAFT_LIMIT };
