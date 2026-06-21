"use client";

import { UBUNTU_TRIBE } from "@/lib/branding/ubuntu-tribe";

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export function BrandedDocumentPreview({ content }: { content: string }) {
  const lines = content.split("\n");
  let inLetterhead = false;
  let letterheadDone = false;

  return (
    <div className="max-h-[32rem] overflow-auto rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-800 shadow-inner">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (idx === 0 && trimmed.startsWith("---")) {
          inLetterhead = true;
          return null;
        }
        if (inLetterhead && trimmed === "---") {
          inLetterhead = false;
          letterheadDone = true;
          return <hr key={idx} className="my-4 border-brand-purple/30" />;
        }
        if (inLetterhead) {
          if (trimmed.startsWith("**") && trimmed.endsWith("**") && !trimmed.slice(2, -2).includes("*")) {
            return (
              <p key={idx} className="text-lg font-bold text-brand-purple">
                {trimmed.slice(2, -2)}
              </p>
            );
          }
          if (trimmed.startsWith("*") && trimmed.endsWith("*") && !trimmed.slice(1, -1).includes("*")) {
            return (
              <p key={idx} className="text-brand-gold italic">
                {trimmed.slice(1, -1)}
              </p>
            );
          }
          if (!trimmed) return <div key={idx} className="h-2" />;
          return (
            <p key={idx} className="text-xs text-gray-500">
              {renderInline(trimmed)}
            </p>
          );
        }

        if (trimmed === "---") {
          return <hr key={idx} className="my-4 border-gray-200" />;
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={idx} className="mb-3 mt-4 text-xl font-bold text-brand-purple">
              {trimmed.slice(2)}
            </h1>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={idx} className="mb-2 mt-4 text-base font-semibold text-brand-purple">
              {trimmed.slice(3)}
            </h2>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={idx} className="mb-1 mt-3 text-sm font-semibold text-gray-900">
              {trimmed.slice(4)}
            </h3>
          );
        }
        if (/^[-*]\s/.test(trimmed)) {
          return (
            <li key={idx} className="ml-4 list-disc text-gray-700">
              {renderInline(trimmed.replace(/^[-*]\s/, ""))}
            </li>
          );
        }
        if (!trimmed) return <div key={idx} className="h-2" />;

        const isFooter =
          letterheadDone &&
          (trimmed.includes(UBUNTU_TRIBE.legalEntity) ||
            trimmed.includes(UBUNTU_TRIBE.websiteDisplay) ||
            trimmed.includes(UBUNTU_TRIBE.products));

        return (
          <p key={idx} className={`mb-2 ${isFooter ? "text-xs text-gray-500" : "text-gray-700"}`}>
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
