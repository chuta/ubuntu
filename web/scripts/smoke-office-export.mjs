#!/usr/bin/env node
/** Write sample exports to /tmp for qa:office smoke test. */
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../.tmp/office-samples");
mkdirSync(outDir, { recursive: true });

const docxMod = await import(pathToFileURL(resolve(__dirname, "../src/lib/docx/branded-document.ts")).href);
const pptxMod = await import(pathToFileURL(resolve(__dirname, "../src/lib/pptx/branded-presentation.ts")).href);

const md = `---
**Ubuntu Tribe**
---

# Test MOU

## Parties
- Ubuntu Tribe
- [Counterparty]

| Term | Value |
|------|-------|
| Duration | 24 months |
`;

const deck = `# B2G Wealth Tokenisation Brief
Sovereign partnership overview

---SLIDE---
## Resource Paradox
- **STAT:** $100T+
- **LABEL:** Africa underground mineral resources

---SLIDE---
## Tokenisation Model
- SPV structure
- NFT fractional ownership
`;

const docx = await docxMod.buildBrandedDocumentDocx({
  title: "Test MOU",
  documentTypeLabel: "MOU",
  bodyMarkdown: md,
});
const pptx = await pptxMod.buildBrandedPresentationPptx({
  title: "B2G Brief",
  bodyMarkdown: deck,
});

const docxPath = resolve(outDir, "sample.docx");
const pptxPath = resolve(outDir, "sample.pptx");
writeFileSync(docxPath, docx);
writeFileSync(pptxPath, pptx);
console.log(docxPath);
console.log(pptxPath);
