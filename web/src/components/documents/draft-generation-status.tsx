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
  const fallbackFired = useRef(false);

  // Poll cadence: every 3s, auto-fallback to synchronous generation after the
  // background job has had ~24s, and give up polling after ~150s.
  const POLL_MS = 3_000;
  const FALLBACK_AFTER = 8;
  const MAX_ATTEMPTS = 50;

  const runGeneration = useCallback(
    async (mode: "fallback" | "retry") => {
      if (mode === "fallback") {
        if (fallbackFired.current) return;
        fallbackFired.current = true;
      }
      try {
        const res = await fetch("/api/documents/ai-draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phase: "generate", documentId }),
          signal: AbortSignal.timeout(90_000),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          stopped.current = true;
          setStatus("error");
          setError(data.error ?? "Generation failed");
          return;
        }
        if (data.status === "ready") {
          stopped.current = true;
          setStatus("ready");
          router.refresh();
        }
      } catch {
        // A fallback timeout is non-fatal — polling continues. A manual retry
        // surfaces the failure to the user.
        if (mode === "retry") {
          setStatus("error");
          setError("Generation timed out. Please try again.");
        }
      }
    },
    [documentId, router]
  );

  const check = useCallback(
    async (attempt: number) => {
      const res = await fetch(`/api/documents/${documentId}/draft-status`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      if (data.status === "ready") {
        stopped.current = true;
        setStatus("ready");
        router.refresh();
        return;
      }
      if (data.status === "error") {
        stopped.current = true;
        setStatus("error");
        setError(data.error ?? "Generation failed");
        return;
      }
      // Still pending — kick off the synchronous fallback once the background
      // job has had a fair chance, and stop polling after the cap.
      if (attempt >= FALLBACK_AFTER) void runGeneration("fallback");
      if (attempt >= MAX_ATTEMPTS) {
        stopped.current = true;
        setStatus("error");
        setError("Generation is taking longer than expected. Please retry.");
      }
    },
    [documentId, router, runGeneration]
  );

  useEffect(() => {
    if (status === "error") return;
    stopped.current = false;
    let attempt = 0;
    void check(attempt);
    const timer = setInterval(() => {
      if (stopped.current) {
        clearInterval(timer);
        return;
      }
      attempt += 1;
      void check(attempt);
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [check, status]);

  async function handleRetry() {
    setRetrying(true);
    setError(null);
    fallbackFired.current = false;
    stopped.current = false;
    setStatus("pending");
    await runGeneration("retry");
    setRetrying(false);
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
