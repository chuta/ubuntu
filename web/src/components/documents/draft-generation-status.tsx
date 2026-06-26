"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Sparkles } from "lucide-react";

/**
 * Recovery panel for an AI document that has no content version yet
 * (e.g. a generation that errored or was interrupted). Clicking kicks off
 * generation and then polls backend status — the poll is the source of truth,
 * so a gateway-severed generation request never shows a false failure.
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
      // Kick off generation without depending on its (possibly severed) response.
      fetch("/api/documents/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: "generate", documentId }),
      }).catch(() => {});

      const deadline = Date.now() + 150_000;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 3000));
        const status = await fetch(`/api/documents/${documentId}/draft-status`, {
          cache: "no-store",
        })
          .then((r) => r.json())
          .catch(() => null);
        if (!status) continue;
        if (status.status === "ready") {
          router.refresh();
          return;
        }
        if (status.status === "error") {
          setError(status.error ?? "Generation failed");
          return;
        }
      }
      setError("Generation is taking longer than expected. Please try again.");
    } catch {
      setError("Generation failed. Please try again.");
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
