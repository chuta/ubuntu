import { readFileSync, existsSync } from "fs";
import { join } from "path";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { UBUNTU_TRIBE, documentFooterLine } from "@/lib/branding/ubuntu-tribe";

/** A4 page (docx-SKILL: set explicitly). */
const PAGE = {
  width: 11906,
  height: 16838,
  margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
};
const CONTENT_WIDTH = PAGE.width - PAGE.margin.left - PAGE.margin.right;

const FONT = "Arial";
const BULLET_REF = "doc-bullets";
const NUMBER_REF = "doc-numbers";

function loadHeaderLogo(): Buffer | null {
  const headerPath = join(process.cwd(), "public", "logo-header.png");
  if (existsSync(headerPath)) {
    return readFileSync(headerPath);
  }
  const markPath = join(process.cwd(), "public", "logo-mark.png");
  if (existsSync(markPath)) {
    return readFileSync(markPath);
  }
  return null;
}

function runningHeader(title: string): Header {
  const logo = loadHeaderLogo();
  const titleRun = new TextRun({
    text: title.slice(0, 60),
    color: "6B7280",
    size: 18,
    font: FONT,
  });

  const children: Paragraph[] = [
    new Paragraph({
      children: logo
        ? [
            new ImageRun({
              type: "png",
              data: logo,
              transformation: { width: 160, height: 28 },
              altText: {
                title: UBUNTU_TRIBE.name,
                description: UBUNTU_TRIBE.tagline,
                name: "Ubuntu Tribe logo",
              },
            }),
            new TextRun({ text: "\t" }),
            titleRun,
          ]
        : [
            new TextRun({ text: UBUNTU_TRIBE.name, bold: true, color: "9035F4", size: 20, font: FONT }),
            new TextRun({ text: "\t" }),
            titleRun,
          ],
      tabStops: [{ type: "right" as const, position: CONTENT_WIDTH }],
    }),
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "9035F4" } },
      spacing: { after: 120 },
    }),
  ];

  return new Header({ children });
}

function runningFooter(): Footer {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: `${UBUNTU_TRIBE.websiteDisplay} · ${documentFooterLine()} · Page `,
            color: "9CA3AF",
            size: 16,
          }),
          new TextRun({ children: [PageNumber.CURRENT], color: "9CA3AF", size: 16 }),
        ],
      }),
    ],
  });
}

function letterhead(title: string, documentTypeLabel: string): Paragraph[] {
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return [
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: UBUNTU_TRIBE.name, bold: true, color: "9035F4", size: 40, font: FONT }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: UBUNTU_TRIBE.tagline,
          italics: true,
          color: "C9932A",
          size: 22,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `${UBUNTU_TRIBE.websiteDisplay} · ${UBUNTU_TRIBE.giftPortalDisplay} · ${UBUNTU_TRIBE.contactEmail}`,
          color: "6B7280",
          size: 18,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: "Document: ", color: "4B5563", font: FONT }),
        new TextRun({ text: title, bold: true, font: FONT }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: "Type: ", color: "4B5563", font: FONT }),
        new TextRun({ text: documentTypeLabel, bold: true, font: FONT }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: "Date: ", color: "4B5563", font: FONT }),
        new TextRun({ text: date, bold: true, font: FONT }),
      ],
    }),
    new Paragraph({
      spacing: { after: 240 },
      children: [
        new TextRun({ text: "Classification: ", color: "4B5563", font: FONT }),
        new TextRun({
          text: UBUNTU_TRIBE.classification,
          bold: true,
          color: "C9932A",
          size: 18,
          font: FONT,
        }),
      ],
    }),
  ];
}

function closingFooter(): Paragraph[] {
  return [
    new Paragraph({ spacing: { before: 400 } }),
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" } },
      spacing: { before: 120, after: 80 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: UBUNTU_TRIBE.name, bold: true, color: "9035F4", size: 22, font: FONT }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({ text: UBUNTU_TRIBE.legalEntity, color: "6B7280", size: 18, font: FONT }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: UBUNTU_TRIBE.tagline,
          italics: true,
          color: "C9932A",
          size: 18,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: UBUNTU_TRIBE.products, color: "9CA3AF", size: 16, italics: true, font: FONT }),
      ],
    }),
  ];
}

function parseInlineRuns(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  for (const part of parts) {
    if (part.startsWith("**") && part.endsWith("**")) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true, font: FONT }));
    } else if (part.startsWith("*") && part.endsWith("*")) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true, font: FONT }));
    } else {
      runs.push(new TextRun({ text: part, font: FONT }));
    }
  }
  return runs.length ? runs : [new TextRun({ text, font: FONT })];
}

function markdownTableToDocx(lines: string[]): Table {
  const rows = lines
    .filter((l) => l.trim().startsWith("|"))
    .map((l) =>
      l
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim())
    )
    .filter((cells) => !cells.every((c) => /^[-:]+$/.test(c)));

  const colCount = rows[0]?.length ?? 1;
  const colWidth = Math.floor(CONTENT_WIDTH / colCount);
  const columnWidths = Array(colCount).fill(colWidth);
  const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  const borders = { top: border, bottom: border, left: border, right: border };

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths,
    rows: rows.map((cells, rowIdx) =>
      new TableRow({
        children: cells.map(
          (cell) =>
            new TableCell({
              borders,
              width: { size: colWidth, type: WidthType.DXA },
              shading:
                rowIdx === 0
                  ? { fill: "F3E8FF", type: ShadingType.CLEAR }
                  : { fill: "FFFFFF", type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: parseInlineRuns(cell) })],
            })
        ),
      })
    ),
  });
}

function isTableLine(line: string): boolean {
  return line.trim().startsWith("|");
}

function markdownToBlocks(markdown: string): (Paragraph | Table)[] {
  const lines = markdown.split("\n");
  const out: (Paragraph | Table)[] = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trimEnd();
    if (!trimmed.trim()) {
      out.push(new Paragraph({ spacing: { after: 80 } }));
      i++;
      continue;
    }
    if (trimmed.trim() === "---") {
      i++;
      continue;
    }

    if (isTableLine(trimmed)) {
      const tableLines: string[] = [];
      while (i < lines.length && isTableLine(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      out.push(markdownTableToDocx(tableLines));
      continue;
    }

    const t = trimmed.trim();
    if (t.startsWith("### ")) {
      out.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
          children: [new TextRun({ text: t.slice(4), bold: true, color: "9035F4", font: FONT })],
        })
      );
    } else if (t.startsWith("## ")) {
      out.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: t.slice(3), bold: true, color: "9035F4", size: 26, font: FONT })],
        })
      );
    } else if (t.startsWith("# ")) {
      out.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
          children: [new TextRun({ text: t.slice(2), bold: true, color: "9035F4", size: 30, font: FONT })],
        })
      );
    } else if (/^[-*]\s/.test(t)) {
      out.push(
        new Paragraph({
          numbering: { reference: BULLET_REF, level: 0 },
          spacing: { after: 40 },
          children: parseInlineRuns(t.replace(/^[-*]\s/, "")),
        })
      );
    } else if (/^\d+\.\s/.test(t)) {
      out.push(
        new Paragraph({
          numbering: { reference: NUMBER_REF, level: 0 },
          spacing: { after: 40 },
          children: parseInlineRuns(t.replace(/^\d+\.\s/, "")),
        })
      );
    } else {
      out.push(new Paragraph({ spacing: { after: 80 }, children: parseInlineRuns(t) }));
    }
    i++;
  }

  return out;
}

export function extractDocumentBody(brandedMarkdown: string): string {
  const parts = brandedMarkdown.split("\n---\n");
  if (parts.length >= 3) {
    return parts.slice(1, -1).join("\n---\n").trim();
  }
  return brandedMarkdown.trim();
}

export async function buildBrandedDocumentDocx(params: {
  title: string;
  documentTypeLabel: string;
  bodyMarkdown: string;
}): Promise<Buffer> {
  const body = extractDocumentBody(params.bodyMarkdown);
  const contentBlocks = markdownToBlocks(body);

  const doc = new Document({
    creator: "Ubuntu GrowthOS",
    title: params.title,
    description: `${params.documentTypeLabel} — ${UBUNTU_TRIBE.name}`,
    styles: {
      default: { document: { run: { font: FONT, size: 24 } } },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 30, bold: true, font: FONT, color: "9035F4" },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 26, bold: true, font: FONT, color: "9035F4" },
          paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 },
        },
        {
          id: "Heading3",
          name: "Heading 3",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 24, bold: true, font: FONT, color: "9035F4" },
          paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: BULLET_REF,
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
        {
          reference: NUMBER_REF,
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE.width, height: PAGE.height },
            margin: PAGE.margin,
          },
        },
        headers: { default: runningHeader(params.title) },
        footers: { default: runningFooter() },
        children: [
          ...letterhead(params.title, params.documentTypeLabel),
          ...contentBlocks,
          ...closingFooter(),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
