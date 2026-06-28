/**
 * Branded PDF export for commercial documents (FR-DOC-09).
 * Reuses the @react-pdf/renderer stack proven by the executive report, and the
 * same letterhead/footer branding + markdown body as the DOCX/PPTX exporters.
 */
import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { extractDocumentBody } from "@/lib/docx/branded-document";
import { UBUNTU_TRIBE, documentFooterLine } from "@/lib/branding/ubuntu-tribe";

const C = UBUNTU_TRIBE.colors;

const styles = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 56, paddingHorizontal: 48, fontSize: 10, fontFamily: "Helvetica", color: "#1f2937", lineHeight: 1.4 },
  letterhead: { marginBottom: 16, borderBottomWidth: 2, borderBottomColor: C.purple, paddingBottom: 10 },
  brand: { fontSize: 16, fontWeight: "bold", color: C.purple },
  tagline: { fontSize: 9, color: C.gold, marginTop: 2 },
  contact: { fontSize: 8, color: "#6b7280", marginTop: 4 },
  metaBlock: { marginBottom: 14 },
  metaLine: { fontSize: 9, color: "#4b5563" },
  metaLabel: { fontWeight: "bold", color: "#374151" },
  h1: { fontSize: 18, fontWeight: "bold", color: C.purple, marginTop: 14, marginBottom: 8 },
  h2: { fontSize: 14, fontWeight: "bold", color: C.purple, marginTop: 12, marginBottom: 6 },
  h3: { fontSize: 11, fontWeight: "bold", color: "#374151", marginTop: 10, marginBottom: 4 },
  paragraph: { marginBottom: 6 },
  bullet: { flexDirection: "row", marginBottom: 3, paddingLeft: 8 },
  bulletDot: { width: 12 },
  bulletText: { flex: 1 },
  bold: { fontWeight: "bold" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 10 },
  tableRow: { flexDirection: "row" },
  tableCell: { flex: 1, borderWidth: 0.5, borderColor: "#d1d5db", padding: 4, fontSize: 9 },
  tableHeadCell: { backgroundColor: "#f3e8ff", fontWeight: "bold", color: C.purple },
  footer: { position: "absolute", bottom: 28, left: 48, right: 48, fontSize: 8, color: "#9ca3af", textAlign: "center", borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 6 },
});

type Inline = { text: string; bold: boolean };

function parseInline(text: string): Inline[] {
  const parts: Inline[] = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index), bold: false });
    parts.push({ text: m[1], bold: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), bold: false });
  return parts.length ? parts : [{ text, bold: false }];
}

function InlineText({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((part, i) => (
        <Text key={i} style={part.bold ? styles.bold : undefined}>
          {part.text}
        </Text>
      ))}
    </>
  );
}

function isTableLine(line: string): boolean {
  return line.trim().startsWith("|");
}

function isSeparatorRow(line: string): boolean {
  return /^\|?[\s:|-]+\|?$/.test(line.trim()) && line.includes("-");
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function renderBlocks(markdown: string): React.ReactNode[] {
  const lines = markdown.split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const t = raw.trim();

    if (!t) {
      i++;
      continue;
    }

    if (t === "---" || t === "---SLIDE---") {
      out.push(<View key={key++} style={styles.divider} />);
      i++;
      continue;
    }

    if (isTableLine(raw)) {
      const tableLines: string[] = [];
      while (i < lines.length && isTableLine(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines.filter((l) => !isSeparatorRow(l)).map(splitRow);
      out.push(
        <View key={key++} style={{ marginBottom: 8 }}>
          {rows.map((cells, r) => (
            <View key={r} style={styles.tableRow}>
              {cells.map((cell, c) => (
                <Text
                  key={c}
                  style={[styles.tableCell, r === 0 ? styles.tableHeadCell : {}]}
                >
                  {cell.replace(/\*\*/g, "")}
                </Text>
              ))}
            </View>
          ))}
        </View>
      );
      continue;
    }

    if (t.startsWith("### ")) {
      out.push(<Text key={key++} style={styles.h3}>{t.slice(4)}</Text>);
    } else if (t.startsWith("## ")) {
      out.push(<Text key={key++} style={styles.h2}>{t.slice(3)}</Text>);
    } else if (t.startsWith("# ")) {
      out.push(<Text key={key++} style={styles.h1}>{t.slice(2)}</Text>);
    } else if (/^[-*]\s/.test(t)) {
      out.push(
        <View key={key++} style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            <InlineText text={t.replace(/^[-*]\s/, "")} />
          </Text>
        </View>
      );
    } else if (/^\d+\.\s/.test(t)) {
      const num = t.match(/^(\d+)\./)?.[1] ?? "";
      out.push(
        <View key={key++} style={styles.bullet}>
          <Text style={styles.bulletDot}>{num}.</Text>
          <Text style={styles.bulletText}>
            <InlineText text={t.replace(/^\d+\.\s/, "")} />
          </Text>
        </View>
      );
    } else {
      out.push(
        <Text key={key++} style={styles.paragraph}>
          <InlineText text={t} />
        </Text>
      );
    }
    i++;
  }

  return out;
}

function BrandedDocumentPdf({
  title,
  documentTypeLabel,
  bodyMarkdown,
}: {
  title: string;
  documentTypeLabel: string;
  bodyMarkdown: string;
}) {
  const body = extractDocumentBody(bodyMarkdown);
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <Document title={`${title} — ${documentTypeLabel}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.letterhead}>
          <Text style={styles.brand}>{UBUNTU_TRIBE.name}</Text>
          <Text style={styles.tagline}>{UBUNTU_TRIBE.tagline}</Text>
          <Text style={styles.contact}>
            {UBUNTU_TRIBE.websiteDisplay} · {UBUNTU_TRIBE.giftPortalDisplay} · {UBUNTU_TRIBE.contactEmail}
          </Text>
        </View>

        <View style={styles.metaBlock}>
          <Text style={styles.metaLine}><Text style={styles.metaLabel}>Document: </Text>{title}</Text>
          <Text style={styles.metaLine}><Text style={styles.metaLabel}>Type: </Text>{documentTypeLabel}</Text>
          <Text style={styles.metaLine}><Text style={styles.metaLabel}>Date: </Text>{date}</Text>
          <Text style={styles.metaLine}><Text style={styles.metaLabel}>Classification: </Text>{UBUNTU_TRIBE.classification}</Text>
        </View>

        {renderBlocks(body)}

        <View style={styles.footer} fixed>
          <Text>{documentFooterLine()}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function buildBrandedDocumentPdf(params: {
  title: string;
  documentTypeLabel: string;
  bodyMarkdown: string;
}): Promise<Buffer> {
  const buffer = await renderToBuffer(<BrandedDocumentPdf {...params} />);
  return Buffer.from(buffer);
}
