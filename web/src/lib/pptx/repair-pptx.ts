/**
 * Reorder presentation.xml children for OOXML XSD (pptxgenjs puts notesMasterIdLst late).
 * Pure Node — safe for Netlify/serverless (no Python).
 */
import JSZip from "jszip";

const ORDER = [
  "sldMasterIdLst",
  "notesMasterIdLst",
  "handoutMasterIdLst",
  "sldIdLst",
  "sldSz",
  "notesSz",
  "smartTags",
  "embeddedFontLst",
  "custShowLst",
  "photoAlbum",
  "custDataLst",
  "defaultTextStyle",
  "modificationVerifier",
  "extLst",
];

function extractBlock(xml: string, tag: string): string | null {
  const paired = new RegExp(`<p:${tag}\\b[^>]*>[\\s\\S]*?</p:${tag}>`, "i");
  const pairedMatch = xml.match(paired);
  if (pairedMatch) return pairedMatch[0];

  const voidEl = new RegExp(`<p:${tag}\\b[^>]*/>`, "i");
  return xml.match(voidEl)?.[0] ?? null;
}

function reorderPresentationXml(xml: string): string {
  const openMatch = xml.match(/<p:presentation\b[^>]*>/);
  const closeIdx = xml.lastIndexOf("</p:presentation>");
  if (!openMatch || closeIdx < 0) return xml;

  const start = openMatch.index! + openMatch[0].length;
  const inner = xml.slice(start, closeIdx);

  const used: string[] = [];
  let remainder = inner;

  for (const tag of ORDER) {
    const block = extractBlock(remainder, tag);
    if (block) {
      used.push(block);
      remainder = remainder.replace(block, "");
    }
  }

  // Preserve any unexpected elements pptxgenjs added
  const tail = remainder.trim();
  const body = used.join("") + tail;

  return xml.slice(0, start) + body + xml.slice(closeIdx);
}

export async function repairPptxSchema(buffer: Buffer): Promise<Buffer> {
  const zip = await JSZip.loadAsync(buffer);
  const file = zip.file("ppt/presentation.xml");
  if (!file) return buffer;

  const xml = await file.async("string");
  const fixed = reorderPresentationXml(xml);
  zip.file("ppt/presentation.xml", fixed);

  const out = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  return Buffer.from(out);
}
