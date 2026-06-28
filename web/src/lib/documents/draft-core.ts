/**
 * AI draft generation core — Claude prompt building, branding, and
 * non-AI template skeletons. Runs synchronously inside the Next.js runtime.
 */
import Anthropic from "@anthropic-ai/sdk";

/** Model is overridable via env so a bad/renamed model is a one-line fix. */
export const AI_DRAFT_MODEL = process.env.ANTHROPIC_DRAFT_MODEL ?? "claude-sonnet-4-5";
/**
 * Token cap drives generation time. 4096 tokens did not finish inside the 60s
 * serverless budget; ~2600 keeps a quality first draft well under it. Tunable
 * via env without a redeploy.
 */
export const AI_DRAFT_MAX_TOKENS = Number(process.env.ANTHROPIC_DRAFT_MAX_TOKENS) || 2600;
/** Keep under the 60s serverless budget so we return a clean error, not a 504. */
export const AI_DRAFT_TIMEOUT_MS = 55_000;

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
  LOI: "Letter of Intent",
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

  if (documentType === "LOI") {
    return `Document format (Word document — Letter of Intent):
- Use # for the title and ## for sections
- Open with a short preamble naming both parties and the purpose/intent of the engagement
- Include these sections in order: Purpose & Intent; Proposed Scope of Collaboration; Key Commercial Terms; Exclusivity (if any); Confidentiality; Binding vs. Non-Binding Provisions; Indicative Timeline & Next Steps; Conditions to a Definitive Agreement; Signatures
- Make clear which provisions are binding (typically confidentiality and exclusivity) and which are non-binding expressions of intent
- Use markdown tables for proposed terms or timelines; use **bold** for defined terms and [BRACKET PLACEHOLDERS] for party-specific details
- Do NOT use unicode bullet characters; do NOT include letterhead, logo block, or footer — those are added on export`;
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

  const client = new Anthropic({ apiKey, timeout: AI_DRAFT_TIMEOUT_MS, maxRetries: 0 });

  // Stream the completion: keeps the connection active (avoids long single-poll
  // timeouts) and lets us assemble text as it arrives within the budget.
  let message;
  try {
    message = await client.messages
      .stream({
        model: AI_DRAFT_MODEL,
        max_tokens: AI_DRAFT_MAX_TOKENS,
        messages: [{ role: "user", content: buildPrompt(input) }],
      })
      .finalMessage();
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      throw new Error(
        `Claude request failed (${err.status ?? "network"}): ${err.message}. Model: ${AI_DRAFT_MODEL}`
      );
    }
    if (err instanceof Error && /timeout/i.test(err.name + err.message)) {
      throw new Error("Claude timed out. Try a shorter brief or reduce ANTHROPIC_DRAFT_MAX_TOKENS.");
    }
    throw err;
  }

  const text = message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");
  if (!text.trim()) throw new Error("Claude returned an empty draft");
  return text;
}

/** Calls Claude and returns the branded, ready-to-store markdown draft. */
export async function generateBrandedDraft(input: DraftInput): Promise<string> {
  const body = await generateDraftBody(input);
  return brandDraft(body, { title: input.title, documentType: input.documentType });
}

/**
 * Non-AI starter body for a document type — used for manual creation and as a
 * deterministic fallback. Decks use ---SLIDE--- so the PPTX exporter parses them.
 */
export function buildTemplateBody(input: DraftInput): string {
  const org = input.organizationName?.trim() || "[Counterparty]";
  const deal = input.dealName?.trim();
  const terms = input.keyTerms?.trim();
  const context = input.additionalContext?.trim();

  if (isPresentationType(input.documentType)) {
    const isGov = input.documentType === "GOVERNMENT_BRIEF";
    return [
      `# ${input.title}`,
      isGov
        ? "Sovereign tokenization partnership briefing"
        : "Investor opportunity overview",
      "",
      "---SLIDE---",
      "## The Opportunity",
      `- Partner: ${org}`,
      deal ? `- Engagement: ${deal}` : "- Engagement: [Deal / programme]",
      "- Ubuntu Tribe connects trusted physical gold with modern digital tools",
      "**STAT:** $300M+",
      "**LABEL:** GIFT trading volume to date",
      "",
      "---SLIDE---",
      "## Why Ubuntu Tribe",
      "- GIFT: gold-backed digital access",
      "- UbuntuVerse: ecosystem for value and opportunity",
      "- Ubuntu Capital & Academy: financing and capability building",
      terms ? `- Proposed terms: ${terms}` : "- Proposed terms: [revenue share, exclusivity]",
      "",
      "---SLIDE---",
      "## Proposed Partnership Model",
      "- Phase 1: Framework & regulatory alignment",
      "- Phase 2: Pilot deployment",
      "- Phase 3: Scale across territory",
      context ? `- Context: ${context}` : "",
      "",
      "---SLIDE---",
      "## Next Steps",
      "- Align on scope and timeline",
      "- Confirm regulatory pathway",
      "- Schedule working session",
      "**Speaker notes:** Tailor figures and commitments before sharing externally.",
    ]
      .filter((l) => l !== "")
      .join("\n");
  }

  const typeLabel = documentTypeLabel(input.documentType);
  const lines = [
    `# ${input.title}`,
    "",
    "## Parties",
    `- **Ubuntu Tribe** (Ophir Ubuntu International Ltd)`,
    `- **${org}**`,
    "",
    "## Purpose",
    `This ${typeLabel} sets out the understanding between the parties regarding ${
      deal ? `the ${deal} engagement` : "the proposed engagement"
    }.`,
    "",
    "## Scope",
    "- [Describe the scope of work, products, or collaboration]",
    "- Ubuntu Tribe capabilities: GIFT, Utribe Wallet, UbuntuVerse",
    "",
    "## Key Terms",
    terms ? `- ${terms.split("\n").join("\n- ")}` : "- [List the key commercial terms]",
    "",
    "## Term & Termination",
    "- Effective date: [DATE]",
    "- Duration: [TERM]",
    "",
  ];

  if (context) {
    lines.push("## Additional Context", context, "");
  }

  lines.push(
    "## Signatures",
    "| Ubuntu Tribe | " + org + " |",
    "|--------------|" + "-".repeat(Math.max(org.length, 10)) + "|",
    "| Name: ________ | Name: ________ |",
    "| Title: ________ | Title: ________ |",
    "| Date: ________ | Date: ________ |"
  );

  return lines.join("\n");
}

/** Branded starter document (letterhead + template body + footer). */
export function buildBrandedTemplate(input: DraftInput): string {
  return brandDraft(buildTemplateBody(input), {
    title: input.title,
    documentType: input.documentType,
  });
}
