"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  SESSION_POLICY,
  SESSION_STORAGE_KEYS,
  ensureSessionTimestamps,
  evaluateSessionPrompt,
  formatCountdown,
  initSession,
  touchSessionActivity,
  type SessionPromptReason,
} from "@/lib/session/client";
import { signOutUser } from "@/lib/session/sign-out";
import { Clock, LogOut, ShieldAlert } from "lucide-react";

const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart", "click"] as const;

export function SessionManager() {
  const router = useRouter();
  const [prompt, setPrompt] = useState<SessionPromptReason | null>(null);
  const [graceRemainingMs, setGraceRemainingMs] = useState(SESSION_POLICY.promptGraceMs);
  const [continuing, setContinuing] = useState(false);
  const promptShownAt = useRef<number | null>(null);
  const lastActivityWrite = useRef(0);

  const openPrompt = useCallback((reason: SessionPromptReason) => {
    setPrompt((current) => {
      if (current === "expired") return current;
      if (reason === "expired") {
        promptShownAt.current = Date.now();
        return "expired";
      }
      if (current) return current;
      promptShownAt.current = Date.now();
      return reason;
    });
  }, []);

  const runCheck = useCallback(() => {
    const reason = evaluateSessionPrompt();
    if (reason) {
      openPrompt(reason);
      return;
    }
    setPrompt((current) => (current === "idle" ? null : current));
  }, [openPrompt]);

  useEffect(() => {
    ensureSessionTimestamps();
    runCheck();

    const onActivity = () => {
      if (prompt) return;
      const ts = Date.now();
      if (ts - lastActivityWrite.current < SESSION_POLICY.activityThrottleMs) return;
      lastActivityWrite.current = ts;
      touchSessionActivity(ts);
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true });
    }

    const checkTimer = window.setInterval(runCheck, SESSION_POLICY.checkIntervalMs);

    const onStorage = (event: StorageEvent) => {
      if (
        event.key === SESSION_STORAGE_KEYS.startedAt &&
        event.newValue == null &&
        event.oldValue != null
      ) {
        router.push("/login");
        router.refresh();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, onActivity);
      }
      window.clearInterval(checkTimer);
      window.removeEventListener("storage", onStorage);
    };
  }, [prompt, runCheck, router]);

  useEffect(() => {
    if (prompt !== "idle" || promptShownAt.current == null) return;

    const tick = () => {
      const elapsed = Date.now() - promptShownAt.current!;
      const remaining = SESSION_POLICY.promptGraceMs - elapsed;
      setGraceRemainingMs(Math.max(0, remaining));
      if (remaining <= 0) {
        void signOutUser({ redirectTo: "/login?reason=idle_timeout" });
      }
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [prompt]);

  async function handleContinueSession() {
    setContinuing(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        await signOutUser({ redirectTo: "/login?reason=session_refresh_failed" });
        return;
      }
      touchSessionActivity();
      promptShownAt.current = null;
      setPrompt(null);
      router.refresh();
    } finally {
      setContinuing(false);
    }
  }

  async function handleSignInAgain() {
    await signOutUser({ redirectTo: "/login?reason=session_expired" });
  }

  async function handleLogOut() {
    await signOutUser();
  }

  if (!prompt) return null;

  const isExpired = prompt === "expired";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-prompt-title"
      aria-describedby="session-prompt-description"
    >
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          {isExpired ? <ShieldAlert className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
        </div>

        <h2 id="session-prompt-title" className="text-lg font-semibold text-gray-900">
          {isExpired ? "Session limit reached" : "Still there?"}
        </h2>

        <p id="session-prompt-description" className="mt-2 text-sm leading-relaxed text-gray-600">
          {isExpired ? (
            <>
              For your security, sessions are limited to{" "}
              {Math.round(SESSION_POLICY.maxSessionMs / (60 * 60 * 1000))} hours. Please sign in
              again to continue using GrowthOS.
            </>
          ) : (
            <>
              You have been inactive for {Math.round(SESSION_POLICY.idleMs / (60 * 1000))} minutes.
              Would you like to continue your session?
            </>
          )}
        </p>

        {!isExpired && (
          <p className="mt-3 text-sm font-medium text-red-600">
            Signing out automatically in {formatCountdown(graceRemainingMs)}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {isExpired ? (
            <>
              <Button type="button" variant="outline" onClick={() => void handleLogOut()}>
                <LogOut className="mr-1.5 h-4 w-4" />
                Sign out
              </Button>
              <Button type="button" onClick={() => void handleSignInAgain()}>
                Sign in again
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => void handleLogOut()}>
                <LogOut className="mr-1.5 h-4 w-4" />
                Sign out
              </Button>
              <Button type="button" onClick={() => void handleContinueSession()} disabled={continuing}>
                {continuing ? "Restoring…" : "Continue session"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
