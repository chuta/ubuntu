"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function KnowledgeDownloadButton({ storageUrl }: { storageUrl: string }) {
  async function handleDownload() {
    const res = await fetch("/api/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: "download", storageUrl }),
    });
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank");
    else alert(data.error ?? "Download unavailable — configure AWS S3 in .env");
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownload}>
      <Download className="mr-1.5 h-4 w-4" />
      Download
    </Button>
  );
}
