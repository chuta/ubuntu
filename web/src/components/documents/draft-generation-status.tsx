"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Sparkles } from "lucide-react";

/**
 * Recovery panel for an AI document that has no content version yet
 * (e.g. a generation that errored or was interrupted). Generation runs
 * synchronously on click — no polling.
 */
export function DraftGenerationStatus({
  documentId,
  initialStatus,
  initialError,
}: {
  documentId: string;
  initialStatus?: string | null;
  initialError?: string | null;
}) {
  const router = useRouter();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(
    initialStatus === "ERROR" ? initialError ?? "Generation failed" : null
  );

  async function generate() {
    setWorking(true);
    setError(null);
    try {
      const res = await fetch("/api/documents/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: "retry", documentId }),
        signal: AbortSignal.timeout(70_000),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.status === "error") {
        setError(data.error ?? "Generation failed");
        return;
      }
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error && err.name === "TimeoutError"
          ? "Generation took too long. Please try again."
          : "Generation failed. Please try again."
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-800">Draft not generated yet</h3>
          <p className="mt-1 text-sm text-amber-700">
            {error
              ? error
              : "This AI document has no content version. Generate the draft now."}
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => void generate()}
            disabled={working}
          >
            {working ? (
              <>
                <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="mr-1.5 h-4 w-4" />
                Generate draft
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
