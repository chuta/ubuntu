export type SlideBlock = {
  title: string;
  bullets: string[];
  paragraphs: string[];
  stat?: { value: string; label: string };
  speakerNotes?: string;
  isTitleSlide?: boolean;
};

export type ParsedSlideDeck = {
  deckTitle: string;
  subtitle?: string;
  slides: SlideBlock[];
};

function parseSlideSection(raw: string): SlideBlock {
  const lines = raw.split("\n");
  let title = "Untitled Slide";
  const bullets: string[] = [];
  const paragraphs: string[] = [];
  let stat: SlideBlock["stat"];
  let speakerNotes: string | undefined;
  let isTitleSlide = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("# ")) {
      title = trimmed.slice(2).trim();
      isTitleSlide = true;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      title = trimmed.slice(3).trim();
      if (/title/i.test(title) && slidesLookLikeTitle(title)) isTitleSlide = true;
      continue;
    }
    if (trimmed.startsWith("**Speaker notes:**") || trimmed.startsWith("**Speaker Notes:**")) {
      speakerNotes = trimmed.replace(/^\*\*Speaker notes:\*\*/i, "").trim();
      continue;
    }
    if (trimmed.startsWith("**STAT:**")) {
      const value = trimmed.replace(/^\*\*STAT:\*\*/i, "").trim();
      stat = { value, label: stat?.label ?? "" };
      continue;
    }
    if (trimmed.startsWith("**LABEL:**")) {
      const label = trimmed.replace(/^\*\*LABEL:\*\*/i, "").trim();
      stat = { value: stat?.value ?? "", label };
      continue;
    }
    if (/^[-*]\s/.test(trimmed)) {
      bullets.push(trimmed.replace(/^[-*]\s/, ""));
      continue;
    }
    paragraphs.push(trimmed.replace(/\*\*/g, ""));
  }

  return { title, bullets, paragraphs, stat, speakerNotes, isTitleSlide };
}

function slidesLookLikeTitle(title: string): boolean {
  return /^(title|cover|intro)/i.test(title);
}

/** Parse slide-deck markdown (---SLIDE--- delimiters or ## headings). */
export function parseSlideMarkdown(markdown: string): ParsedSlideDeck {
  const body = markdown.trim();
  const slideDelimiter = /(?:^|\n)---SLIDE---\s*\n/g;

  let deckTitle = "Presentation";
  let subtitle: string | undefined;
  const slides: SlideBlock[] = [];

  if (slideDelimiter.test(body)) {
    const parts = body.split(/---SLIDE---/);
    const preamble = parts[0]?.trim() ?? "";
    const preambleLines = preamble.split("\n").filter((l) => l.trim());
    if (preambleLines[0]?.startsWith("# ")) {
      deckTitle = preambleLines[0].slice(2).trim();
      subtitle = preambleLines.slice(1).find((l) => l.trim() && !l.startsWith("#"))?.trim();
    }
    for (const part of parts.slice(1)) {
      const slide = parseSlideSection(part.trim());
      if (slide.title || slide.bullets.length || slide.paragraphs.length) slides.push(slide);
    }
  } else {
    const sections = body.split(/\n(?=## )/).filter((s) => s.trim());
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      if (i === 0 && section.startsWith("# ")) {
        const lines = section.split("\n");
        deckTitle = lines[0].slice(2).trim();
        subtitle = lines.slice(1).find((l) => l.trim() && !l.startsWith("#"))?.trim();
        if (lines.some((l) => l.startsWith("## "))) {
          slides.push(parseSlideSection(section));
        }
        continue;
      }
      slides.push(parseSlideSection(section));
    }
  }

  if (slides.length === 0) {
    slides.push({
      title: deckTitle,
      bullets: [],
      paragraphs: [body.slice(0, 500)],
      isTitleSlide: true,
    });
  }

  if (slides.length > 0 && !slides[0].isTitleSlide) {
    slides.unshift({
      title: deckTitle,
      bullets: subtitle ? [subtitle] : [],
      paragraphs: [],
      isTitleSlide: true,
    });
  }

  return { deckTitle, subtitle, slides };
}
