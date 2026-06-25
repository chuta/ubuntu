"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";

type Status = "pending" | "error" | "ready";

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
  const [status, setStatus] = useState<Status>(
    initialStatus === "ERROR" ? "error" : "pending"
  );
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [retrying, setRetrying] = useState(false);
  const stopped = useRef(false);

  const check = useCallback(async () => {
    const res = await fetch(`/api/documents/${documentId}/draft-status`, {
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = await res.json().catch(() => ({}));
    if (data.status === "ready") {
      setStatus("ready");
      stopped.current = true;
      router.refresh();
    } else if (data.status === "error") {
      setStatus("error");
      setError(data.error ?? "Generation failed");
    } else {
      setStatus("pending");
    }
  }, [documentId, router]);

  useEffect(() => {
    if (status === "error") return;
    stopped.current = false;
    void check();
    const timer = setInterval(() => {
      if (stopped.current) return;
      void check();
    }, 4_000);
    return () => clearInterval(timer);
  }, [check, status]);

  async function handleRetry() {
    setRetrying(true);
    setError(null);
    setStatus("pending");
    try {
      const res = await fetch("/api/documents/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: "retry", documentId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Retry failed");
        return;
      }
      if (data.status === "ready") {
        router.refresh();
      }
    } catch {
      setStatus("error");
      setError("Retry failed");
    } finally {
      setRetrying(false);
    }
  }

  if (status === "ready") return null;

  if (status === "error") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800">AI draft generation failed</h3>
            <p className="mt-1 text-sm text-red-700">{error ?? "Something went wrong."}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => void handleRetry()}
              disabled={retrying}
            >
              <RefreshCw className={`mr-1.5 h-4 w-4 ${retrying ? "animate-spin" : ""}`} />
              {retrying ? "Retrying…" : "Retry generation"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-brand-purple/20 bg-brand-purple/5 p-6">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-brand-purple" />
        <div>
          <h3 className="text-sm font-semibold text-brand-purple">Generating draft…</h3>
          <p className="mt-0.5 text-sm text-gray-600">
            Claude is drafting this document. This page updates automatically when it is ready.
          </p>
        </div>
      </div>
    </div>
  );
}
