import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";
import type { ExecutiveReportData } from "@/types/reports";
import { B2G_PHASES, phaseLabel } from "@/lib/constants/tokenization";
import {
  CUSTOMER_SEGMENTS,
  DEAL_STAGES,
  REVENUE_ENGINES,
  labelFor,
  stageLabel,
} from "@/lib/constants/deals";

function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function heading(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [
      new TextRun({ text, bold: true, color: "9035F4", size: 24 }),
    ],
  });
}

function kvRow(label: string, value: string) {
  return new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({ text: `${label}: `, color: "4B5563" }),
      new TextRun({ text: value, bold: true }),
    ],
  });
}

function bullet(text: string) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 40 },
    children: [new TextRun({ text })],
  });
}

export async function buildExecutiveReportDocx(data: ExecutiveReportData): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.LEFT,
      spacing: { after: 80 },
      children: [
        new TextRun({ text: "Ubuntu GrowthOS", bold: true, color: "9035F4", size: 36 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: "Executive Commercial Report",
          bold: true,
          color: "C9932A",
          size: 26,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: `Period: ${data.period.label} (${data.period.from} – ${data.period.to})`,
          color: "6B7280",
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "9035F4" } },
      children: [
        new TextRun({
          text: `Generated ${new Date(data.generatedAt).toLocaleString()} by ${data.generatedBy}`,
          color: "6B7280",
          size: 18,
        }),
      ],
    }),

    heading("Pipeline Summary"),
    kvRow("Total Pipeline", money(data.pipeline.totalValue)),
    kvRow("Weighted Pipeline", money(data.pipeline.weightedValue)),
    kvRow("Active Deals", String(data.pipeline.activeDeals)),
    kvRow("New deals in period", String(data.pipeline.newDeals)),
    kvRow("Deals won in period", String(data.pipeline.wonDeals)),

    heading("Pipeline by Stage"),
    ...DEAL_STAGES.filter((s) => (data.pipeline.byStage[s.value] ?? 0) > 0).map((s) =>
      bullet(`${stageLabel(s.value)}: ${data.pipeline.byStage[s.value]}`)
    ),

    heading("Top Opportunities"),
    ...(data.pipeline.topDeals.length === 0
      ? [new Paragraph({ children: [new TextRun({ text: "No open deals", italics: true })] })]
      : data.pipeline.topDeals.map(
          (d) =>
            bullet(
              `${d.name} — ${d.estimated_value != null ? money(d.estimated_value) : "—"} · ${stageLabel(d.stage)}${d.priority ? ` · ${d.priority}` : ""}`
            )
        )),

    heading("Government Engagements"),
    kvRow("Active B2G organizations", `${data.governments.activeCount} / ${data.governments.totalCount}`),
    ...Object.entries(data.governments.byTerritory).map(([t, c]) => bullet(`${t}: ${c}`)),

    heading("Tokenization Projects"),
    kvRow("Active projects", String(data.tokenization.totalProjects)),
    kvRow("Est. asset value", money(data.tokenization.totalValue)),
    ...B2G_PHASES.flatMap((p) => {
      const row = data.tokenization.byPhase[p.value];
      if (!row?.count) return [];
      return [bullet(`${phaseLabel(p.value)}: ${row.count} projects · ${money(row.value)}`)];
    }),

    heading("Events & Lead ROI"),
    kvRow("Events in period", String(data.events.count)),
    kvRow("Leads captured / converted", `${data.events.leadsCaptured} / ${data.events.leadsConverted}`),
    kvRow("Budget / actual spend", `${money(data.events.totalBudget)} / ${money(data.events.totalActualCost)}`),

    heading("Forecast vs Pipeline"),
    kvRow("Open pipeline", money(data.forecast.pipelineTotal)),
    kvRow("Weighted pipeline", money(data.forecast.pipelineWeighted)),
    kvRow("Total forecast / commit", `${money(data.forecast.totalForecast)} / ${money(data.forecast.totalCommit)}`),
    kvRow("Best case", money(data.forecast.totalBestCase)),

    heading("Pipeline by Segment"),
    ...Object.entries(data.pipeline.bySegment).map(([seg, v]) =>
      bullet(`${labelFor(CUSTOMER_SEGMENTS, seg)}: ${v.count} deals · ${money(v.value)}`)
    ),

    heading("Pipeline by Revenue Engine"),
    ...Object.entries(data.pipeline.byRevenueEngine).map(([eng, v]) =>
      bullet(`${labelFor(REVENUE_ENGINES, eng)}: ${v.count} deals · ${money(v.value)}`)
    ),
  ];

  if (data.b2c) {
    children.push(
      heading(`B2C Campaign — ${data.b2c.campaign_name}`),
      kvRow("New users", data.b2c.new_users != null ? String(data.b2c.new_users) : "—"),
      kvRow("Wallet downloads", data.b2c.wallet_downloads != null ? String(data.b2c.wallet_downloads) : "—"),
      kvRow(
        "GIFT purchases (USD)",
        data.b2c.gift_purchases_usd != null ? money(Number(data.b2c.gift_purchases_usd)) : "—"
      ),
      ...(data.b2c.notes
        ? [new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: data.b2c.notes })] })]
        : [])
    );
  }

  children.push(
    new Paragraph({ spacing: { before: 400 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" } },
      spacing: { before: 120 },
      children: [
        new TextRun({
          text: "Ubuntu Tribe — Real value. Digital access. Shared opportunity. · utribe.one",
          color: "9CA3AF",
          size: 16,
          italics: true,
        }),
      ],
    })
  );

  const doc = new Document({
    creator: "Ubuntu GrowthOS",
    title: `Executive Report — ${data.period.label}`,
    description: "Executive commercial report export",
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}
