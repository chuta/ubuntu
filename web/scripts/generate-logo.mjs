#!/usr/bin/env node
/**
 * Build PNG logo assets for DOCX headers (white wordmark needs purple background).
 * Source: public/logo.svg — run after logo updates: npm run generate:logo
 */
import sharp from "sharp";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const svgPath = resolve(root, "public", "logo.svg");
const outHeader = resolve(root, "public", "logo-header.png");
const outMark = resolve(root, "public", "logo-mark.png");

if (!existsSync(svgPath)) {
  console.error("Missing public/logo.svg");
  process.exit(1);
}

const svg = readFileSync(svgPath);

/** Header strip: purple background + full logo (white wordmark visible). */
await sharp({
  create: {
    width: 320,
    height: 56,
    channels: 4,
    background: { r: 90, g: 24, b: 154, alpha: 1 },
  },
})
  .composite([
    {
      input: await sharp(svg).resize(280, 36, { fit: "inside" }).png().toBuffer(),
      gravity: "centre",
    },
  ])
  .png()
  .toFile(outHeader);

/** Compact mark for tight layouts. */
await sharp(svg)
  .resize(140, 30, { fit: "inside" })
  .png()
  .toFile(outMark);

console.log("Wrote", outHeader);
console.log("Wrote", outMark);
