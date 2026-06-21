"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

type ExportFormat = "pdf" | "docx";

export function ExportReportButtons({
  preset,
  from,
  to,
}: {
  preset?: string;
  from?: string;
  to?: string;
}) {
  const [loading, setLoading] = useState<ExportFormat | null>(null);

  async function handleExport(format: ExportFormat) {
    setLoading(format);
    try {
      const endpoint =
        format === "pdf" ? "/api/reports/executive-pdf" : "/api/reports/executive-docx";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset, from, to }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Export failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `executive-report-${from ?? preset ?? "week"}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Export failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => handleExport("pdf")} disabled={loading !== null}>
        <Download className="mr-2 h-4 w-4" />
        {loading === "pdf" ? "Generating PDF…" : "Export PDF"}
      </Button>
      <Button variant="outline" onClick={() => handleExport("docx")} disabled={loading !== null}>
        <FileText className="mr-2 h-4 w-4" />
        {loading === "docx" ? "Generating DOCX…" : "Export DOCX"}
      </Button>
    </div>
  );
}

/** @deprecated Use ExportReportButtons */
export function ExportPdfButton(props: { preset?: string; from?: string; to?: string }) {
  return <ExportReportButtons {...props} />;
}
