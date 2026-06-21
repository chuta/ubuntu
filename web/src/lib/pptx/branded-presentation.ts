import pptxgen from "pptxgenjs";
import { UBUNTU_TRIBE } from "@/lib/branding/ubuntu-tribe";
import { extractDocumentBody } from "@/lib/docx/branded-document";
import { parseSlideMarkdown, type SlideBlock } from "@/lib/documents/slide-markdown";
import { repairPptxSchema } from "@/lib/pptx/repair-pptx";

/** Ubuntu Tribe palette (pptx-SKILL: dominant purple, gold accent). */
const C = {
  purple: "9035F4",
  purpleDark: "5A189A",
  gold: "C9932A",
  white: "FFFFFF",
  offWhite: "F9FAFB",
  charcoal: "1F2937",
  muted: "6B7280",
} as const;

const FONT = "Arial";

function addBrandFooter(slide: pptxgen.Slide, pptx: pptxgen) {
  slide.addText(`${UBUNTU_TRIBE.websiteDisplay} · ${UBUNTU_TRIBE.classification}`, {
    x: 0.5,
    y: 5.2,
    w: 9,
    h: 0.35,
    fontSize: 9,
    color: C.muted,
    fontFace: FONT,
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 8.85,
    y: 5.15,
    w: 0.35,
    h: 0.35,
    fill: { color: C.gold },
    line: { type: "none" },
  });
}

function addDecorShape(slide: pptxgen.Slide, pptx: pptxgen, variant: number) {
  const shapes = [
    { x: 8.2, y: 0.35, w: 1.4, h: 1.4, fill: C.gold },
    { x: 0.35, y: 4.5, w: 0.9, h: 0.9, fill: C.purple },
    { x: 8.5, y: 4.0, w: 1.0, h: 1.0, fill: C.purple },
  ];
  const s = shapes[variant % shapes.length];
  slide.addShape(pptx.ShapeType.ellipse, {
    ...s,
    fill: { color: s.fill, transparency: 15 },
    line: { type: "none" },
  });
}

function addTitleSlide(pptx: pptxgen, block: SlideBlock, deckTitle: string, subtitle?: string) {
  const slide = pptx.addSlide();
  slide.background = { color: C.purpleDark };
  addDecorShape(slide, pptx, 0);

  slide.addText(deckTitle, {
    x: 0.6,
    y: 1.8,
    w: 8.5,
    h: 1.2,
    fontSize: 40,
    bold: true,
    color: C.white,
    fontFace: FONT,
    margin: 0,
  });

  const sub = subtitle ?? block.paragraphs[0] ?? block.bullets[0];
  if (sub) {
    slide.addText(sub, {
      x: 0.6,
      y: 3.1,
      w: 8.5,
      h: 0.8,
      fontSize: 18,
      color: C.gold,
      fontFace: FONT,
      italic: true,
      margin: 0,
    });
  }

  slide.addText(UBUNTU_TRIBE.tagline, {
    x: 0.6,
    y: 4.2,
    w: 8.5,
    h: 0.5,
    fontSize: 12,
    color: C.white,
    fontFace: FONT,
    margin: 0,
  });

  slide.addText(`${UBUNTU_TRIBE.websiteDisplay} · ${UBUNTU_TRIBE.contactEmail}`, {
    x: 0.6,
    y: 5.15,
    w: 8.5,
    h: 0.35,
    fontSize: 10,
    color: C.white,
    fontFace: FONT,
    margin: 0,
  });
}

function addStatSlide(pptx: pptxgen, block: SlideBlock) {
  const slide = pptx.addSlide();
  slide.background = { color: C.offWhite };
  addDecorShape(slide, pptx, 1);

  slide.addText(block.title, {
    x: 0.5,
    y: 0.45,
    w: 9,
    h: 0.7,
    fontSize: 28,
    bold: true,
    color: C.purple,
    fontFace: FONT,
    margin: 0,
  });

  if (block.stat) {
    slide.addText(block.stat.value, {
      x: 0.5,
      y: 2.0,
      w: 9,
      h: 1.2,
      fontSize: 54,
      bold: true,
      color: C.gold,
      fontFace: FONT,
      margin: 0,
    });
    slide.addText(block.stat.label, {
      x: 0.5,
      y: 3.3,
      w: 9,
      h: 0.6,
      fontSize: 16,
      color: C.charcoal,
      fontFace: FONT,
      margin: 0,
    });
  }

  addBrandFooter(slide, pptx);
}

function addContentSlide(pptx: pptxgen, block: SlideBlock, index: number) {
  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  addDecorShape(slide, pptx, index);

  slide.addText(block.title, {
    x: 0.5,
    y: 0.45,
    w: 9,
    h: 0.75,
    fontSize: 32,
    bold: true,
    color: C.purple,
    fontFace: FONT,
    margin: 0,
  });

  if (block.bullets.length > 0) {
    const bulletText = block.bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } }));
    slide.addText(bulletText, {
      x: 0.5,
      y: 1.35,
      w: 5.5,
      h: 3.6,
      fontSize: 16,
      color: C.charcoal,
      fontFace: FONT,
      valign: "top",
      margin: 0,
      paraSpaceAfter: 8,
    });
  } else if (block.paragraphs.length > 0) {
    slide.addText(block.paragraphs.join("\n\n"), {
      x: 0.5,
      y: 1.35,
      w: 5.5,
      h: 3.6,
      fontSize: 16,
      color: C.charcoal,
      fontFace: FONT,
      valign: "top",
      margin: 0,
    });
  }

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.3,
    y: 1.35,
    w: 3.2,
    h: 3.5,
    fill: { color: C.purple, transparency: 92 },
    line: { color: C.purple, width: 0.5 },
    rectRadius: 0.08,
  });

  slide.addText(UBUNTU_TRIBE.products, {
    x: 6.55,
    y: 2.2,
    w: 2.7,
    h: 2.0,
    fontSize: 11,
    color: C.purple,
    fontFace: FONT,
    valign: "middle",
    margin: 0,
  });

  addBrandFooter(slide, pptx);

  if (block.speakerNotes) {
    slide.addNotes(block.speakerNotes);
  }
}

function addClosingSlide(pptx: pptxgen, deckTitle: string) {
  const slide = pptx.addSlide();
  slide.background = { color: C.purpleDark };

  slide.addText("Thank You", {
    x: 0.6,
    y: 2.0,
    w: 8.5,
    h: 0.9,
    fontSize: 36,
    bold: true,
    color: C.white,
    fontFace: FONT,
    margin: 0,
  });

  slide.addText(deckTitle, {
    x: 0.6,
    y: 3.0,
    w: 8.5,
    h: 0.6,
    fontSize: 16,
    color: C.gold,
    fontFace: FONT,
    margin: 0,
  });

  slide.addText(`${UBUNTU_TRIBE.websiteDisplay} · ${UBUNTU_TRIBE.giftPortalDisplay} · ${UBUNTU_TRIBE.contactEmail}`, {
    x: 0.6,
    y: 4.5,
    w: 8.5,
    h: 0.5,
    fontSize: 12,
    color: C.white,
    fontFace: FONT,
    margin: 0,
  });
}

export async function buildBrandedPresentationPptx(params: {
  title: string;
  bodyMarkdown: string;
}): Promise<Buffer> {
  const body = extractDocumentBody(params.bodyMarkdown);
  const { deckTitle, subtitle, slides } = parseSlideMarkdown(body);

  const pptx = new pptxgen();
  pptx.author = UBUNTU_TRIBE.name;
  pptx.company = UBUNTU_TRIBE.legalEntity;
  pptx.subject = params.title;
  pptx.title = deckTitle;
  pptx.layout = "LAYOUT_16x9";

  addTitleSlide(pptx, slides[0] ?? { title: deckTitle, bullets: [], paragraphs: [] }, deckTitle, subtitle);

  const contentSlides = slides.slice(1);
  for (let i = 0; i < contentSlides.length; i++) {
    const block = contentSlides[i];
    if (block.isTitleSlide) continue;
    if (block.stat?.value) {
      addStatSlide(pptx, block);
    } else {
      addContentSlide(pptx, block, i);
    }
  }

  addClosingSlide(pptx, deckTitle);

  const output = await pptx.write({ outputType: "nodebuffer" });
  return repairPptxSchema(Buffer.from(output as ArrayBuffer));
}
