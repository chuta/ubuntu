/**
 * Self-contained AI draft generation core.
 *
 * IMPORTANT: This module must use ONLY npm imports (no `@/` path aliases) so it
 * can be bundled by both the Next.js runtime and the standalone Netlify
 * background function (`netlify/functions/generate-draft-background.mts`),
 * which imports it via a relative path and cannot resolve TS path aliases.
 */
import Anthropic from "@anthropic-ai/sdk";

export const AI_DRAFT_MODEL = "claude-sonnet-4-6";
export const AI_DRAFT_MAX_TOKENS = 4096;

const BRAND = {
  name: "Ubuntu Tribe",
  legalEntity: "Ophir Ubuntu International Ltd",
  tagline: "Real value. Digital access. Shared opportunity.",
  website: "https://utribe.one",
  websiteDisplay: "utribe.one",
  giftPortal: "https://gift.utribe.app",
  giftPortalDisplay: "gift.utribe.app",
  contactEmail: "info@utribe.one",
  products: "GIFT · Utribe Wallet · UbuntuVerse · Ubuntu Capital · Ubuntu Academy",
  classification: "STRICTLY PRIVATE AND CONFIDENTIAL — Ubuntu Tribe",
} as const;

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  NDA: "NDA",
  MOU: "MOU",
  PROPOSAL: "Proposal",
  GOVERNMENT_BRIEF: "Government Brief",
  PARTNERSHIP_AGREEMENT: "Partnership Agreement",
  INVESTOR_DECK: "Investor Deck",
  CONTRACT: "Contract",
  SOW: "Statement of Work",
  OTHER: "Other",
};

const PRESENTATION_TYPES = new Set(["INVESTOR_DECK", "GOVERNMENT_BRIEF"]);

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function documentTypeLabel(type: string): string {
  return DOCUMENT_TYPE_LABELS[type] ?? type;
}

export function isPresentationType(type: string): boolean {
  return PRESENTATION_TYPES.has(type);
}

export type DraftInput = {
  documentType: string;
  title: string;
  organizationName?: string;
  dealName?: string;
  keyTerms?: string;
  additionalContext?: string;
};

function draftGuidelines(documentType: string): string {
  if (isPresentationType(documentType)) {
    const slideTarget =
      documentType === "GOVERNMENT_BRIEF"
        ? "Target 8–12 slides for sovereign/government briefings (B2G tokenization, resource economy, partnership model)"
        : "Target 10–14 slides for investor decks (traction, entity structure, tokenomics, roadmap)";

    return `Presentation format (slide deck):
- Structure content as a slide deck using ---SLIDE--- between slides
- First block: # Deck Title plus one subtitle line (no ---SLIDE--- before first slide)
- Each slide starts with ## Slide Title
- Use bullet lists (- item) for slide body; left-align content concepts (not centered body)
- Include a visual hook per slide: stat callout, comparison, or process step
- For key metrics use lines: **STAT:** value and **LABEL:** description (e.g. STAT: $300M / LABEL: Trading volume)
- Vary layouts across slides (bullets, stats, two-column concepts) — do not repeat the same layout
- Optional **Speaker notes:** line at end of a slide
- ${slideTarget}
- Do NOT use accent bars, decorative stripes, or lorem ipsum placeholders
- Do NOT include letterhead or footer — branding is applied on export`;
  }

  return `Document format (Word document):
- Use # for document title, ## and ### for sections
- Use proper markdown bullet lists (- item) and numbered lists (1. item)
- Use markdown tables when comparing terms, parties, or timelines:
  | Column A | Column B |
  |----------|----------|
  | Value    | Value    |
- Include structured sections: parties, scope, terms, signatures placeholder
- Use **bold** for defined terms; use [BRACKET PLACEHOLDERS] for party-specific details
- Do NOT use unicode bullet characters (•) — use markdown dashes only
- Do NOT include letterhead, logo block, or footer — those are added on export`;
}

function buildPrompt(input: DraftInput): string {
  const typeLabel = documentTypeLabel(input.documentType);
  const formatGuide = draftGuidelines(input.documentType);
  const deckHint = isPresentationType(input.documentType)
    ? "\n- This is a slide deck — use ---SLIDE--- between every slide after the title block"
    : "";

  return `You are a commercial legal drafting assistant for ${BRAND.name}, a pan-African tokenization and digital asset company.

Company context:
- Tagline: "${BRAND.tagline}"
- Products: ${BRAND.products}
- Website: ${BRAND.website}
- Contact: ${BRAND.contactEmail}
- Legal entity (when relevant): ${BRAND.legalEntity}

Draft a professional ${typeLabel} with the following context:

Organization: ${input.organizationName ?? "Not specified"}
Deal/Opportunity: ${input.dealName ?? "Not specified"}
Key terms to include: ${input.keyTerms ?? "Standard Ubuntu Tribe commercial terms"}
Additional context: ${input.additionalContext ?? "None"}

${formatGuide}${deckHint}

Requirements:
- Do NOT include a letterhead, logo block, or footer — those are added automatically on export
- Reference ${BRAND.name}'s mission and GIFT/UbuntuVerse capabilities where relevant
- Keep tone professional and suitable for B2G/B2B sovereign and institutional partners
- Output markdown only, no preamble or closing remarks`;
}

function letterhead(title: string, typeLabel: string): string {
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `---
**${BRAND.name}**
*${BRAND.tagline}*

${BRAND.websiteDisplay} · ${BRAND.giftPortalDisplay} · ${BRAND.contactEmail}

---

**Document:** ${title}
**Type:** ${typeLabel}
**Date:** ${date}
**Classification:** ${BRAND.classification}

---

`;
}

function footer(): string {
  return `

---

**${BRAND.name}**
${BRAND.legalEntity}
${BRAND.tagline}

${BRAND.website} · ${BRAND.giftPortal} · ${BRAND.contactEmail}

*${BRAND.products}*
`;
}

export function brandDraft(body: string, meta: { title: string; documentType: string }): string {
  const typeLabel = documentTypeLabel(meta.documentType);
  return `${letterhead(meta.title, typeLabel)}${body.trim()}${footer()}`;
}

/** Calls Claude and returns the raw (unbranded) markdown draft. */
export async function generateDraftBody(input: DraftInput): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Anthropic API key not configured. Add ANTHROPIC_API_KEY to .env");
  }

  const client = new Anthropic({ apiKey, timeout: 120_000, maxRetries: 1 });
  const message = await client.messages.create({
    model: AI_DRAFT_MODEL,
    max_tokens: AI_DRAFT_MAX_TOKENS,
    messages: [{ role: "user", content: buildPrompt(input) }],
  });

  const block = message.content[0];
  if (!block || block.type !== "text") throw new Error("Unexpected AI response format");
  return block.text;
}

/** Calls Claude and returns the branded, ready-to-store markdown draft. */
export async function generateBrandedDraft(input: DraftInput): Promise<string> {
  const body = await generateDraftBody(input);
  return brandDraft(body, { title: input.title, documentType: input.documentType });
}
