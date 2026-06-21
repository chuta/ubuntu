#!/usr/bin/env node
/**
 * QA pipeline for exported .docx / .pptx (docx-SKILL + pptx-SKILL).
 *
 * Usage:
 *   npm run qa:office -- path/to/export.docx
 *   npm run qa:office -- path/to/deck.pptx
 *
 * Requires: Python 3, pip deps (npm run qa:office:setup), optional LibreOffice (soffice)
 */
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { resolve, dirname, extname, basename } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const officeDir = resolve(__dirname, "office");
const venvPython = resolve(officeDir, ".venv", "bin", "python3");
const python = existsSync(venvPython) ? venvPython : "python3";
const file = process.argv[2];

if (!file) {
  console.error("Usage: npm run qa:office -- <file.docx|file.pptx>");
  process.exit(1);
}

const abs = resolve(process.cwd(), file);
if (!existsSync(abs)) {
  console.error("File not found:", abs);
  process.exit(1);
}

const ext = extname(abs).toLowerCase();
if (ext !== ".docx" && ext !== ".pptx") {
  console.error("Expected .docx or .pptx, got", ext);
  process.exit(1);
}

function run(cmd, args, opts = {}) {
  console.log("\n→", cmd, args.join(" "));
  const r = spawnSync(cmd, args, { stdio: "inherit", cwd: officeDir, ...opts });
  if (r.status !== 0) {
    console.error(`Command failed (${r.status}): ${cmd}`);
    process.exit(r.status ?? 1);
  }
}

const pyEnv = {
  ...process.env,
  PYTHONPATH: officeDir,
};

console.log("=== Office export QA ===");
console.log("File:", abs);

run(python, ["office/validate.py", abs], { env: pyEnv });

const soffice = spawnSync("which", ["soffice"], { encoding: "utf8" });
if (soffice.status === 0 && soffice.stdout.trim()) {
  run(
    python,
    [
      "-c",
      `from office.soffice import run_soffice; import sys; run_soffice(["--headless","--convert-to","pdf",sys.argv[1]], check=True); print("PDF OK")`,
      abs,
    ],
    { env: pyEnv }
  );
  const pdfName = basename(abs, ext) + ".pdf";
  console.log("PDF:", resolve(dirname(abs), pdfName));
} else {
  console.warn("\n⚠ LibreOffice (soffice) not found — skipping PDF conversion.");
  console.warn("  Install: brew install --cask libreoffice");
}

if (ext === ".pptx") {
  const thumb = spawnSync(
    python,
    ["thumbnail.py", abs, resolve(dirname(abs), "qa-thumbnails")],
    { env: pyEnv, stdio: "inherit", cwd: officeDir }
  );
  if (thumb.status === 0) {
    console.log("Thumbnail grid written next to source file (qa-thumbnails*.jpg)");
  } else {
    console.warn("\n⚠ thumbnail.py skipped (requires LibreOffice soffice).");
  }
}

console.log("\n✓ QA complete");
