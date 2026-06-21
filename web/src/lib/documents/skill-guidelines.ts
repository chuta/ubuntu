import type { DocumentType } from "@/types/documents";
import { isPresentationDocumentType } from "@/lib/documents/format-routing";

/** AI drafting rules derived from docx-SKILL.md and pptx-SKILL.md. */
export function aiDraftGuidelines(documentType: DocumentType): string {
  if (isPresentationDocumentType(documentType)) {
    const slideTarget =
      documentType === "GOVERNMENT_BRIEF"
        ? "Target 8–12 slides for sovereign/government briefings (B2G tokenization, resource economy, partnership model)"
        : "Target 10–14 slides for investor decks (traction, entity structure, tokenomics, roadmap)";

    return `Presentation format (pptx-SKILL — slide deck):
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

  return `Document format (docx-SKILL — Word document):
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
