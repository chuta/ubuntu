"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { initSession } from "@/lib/session/client";
import {
  establishSessionFromUrl,
  resolveAuthDestination,
  urlHasAuthCredentials,
} from "@/lib/auth/session-from-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <p className="text-sm text-gray-500">Loading sign in…</p>
    </div>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionNotice =
    searchParams.get("setup") === "complete"
      ? "Password saved. Sign in with your email and new password to access GrowthOS."
      : searchParams.get("reason") === "idle_timeout"
      ? "You were signed out after being inactive."
      : searchParams.get("reason") === "session_expired"
        ? "Your session reached its time limit. Please sign in again."
        : searchParams.get("reason") === "session_refresh_failed"
          ? "We could not restore your session. Please sign in again."
          : null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);

  // Recover when a server-side callback dropped hash tokens onto /login
  useEffect(() => {
    if (!urlHasAuthCredentials()) return;
    setRecovering(true);
    const supabase = createClient();
    establishSessionFromUrl(supabase).then((result) => {
      if (result.ok) {
        router.replace(resolveAuthDestination(null, result.type));
      } else {
        setRecovering(false);
      }
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Activate invited users on first sign-in (no-op for everyone else).
    try {
      await fetch("/api/auth/complete-login", { method: "POST" });
    } catch {
      // Non-fatal: an admin can still activate manually if this fails.
    }

    initSession();
    // Hard navigation so the new session cookies are read by the server.
    window.location.assign("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <div className="brand-gradient relative hidden w-1/2 flex-col justify-between p-12 text-white lg:flex">
        <Image src="/logo.svg" alt="Ubuntu Tribe" width={160} height={34} priority style={{ height: "auto" }} />
        <div className="max-w-md">
          <h1 className="text-3xl font-bold leading-tight">Ubuntu GrowthOS</h1>
          <p className="mt-4 text-lg text-white/80">
            Commercial Intelligence, Deals, &amp; Growth Operations Platform
          </p>
          <p className="mt-6 text-sm text-white/60">
            Real value. Digital access. Shared opportunity.
          </p>
        </div>
        <p className="text-xs text-white/40">Built by Chimezie Chuta - Commercial Director of Sales and Partnerships</p>
      </div>

      {/* Form panel — vertically centered */}
      <div className="flex min-h-screen w-full items-center justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <div className="brand-gradient rounded-xl px-6 py-4">
              <Image src="/logo.svg" alt="Ubuntu Tribe" width={140} height={30} priority style={{ height: "auto" }} />
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-semibold text-gray-900">Sign in</h2>
            <p className="mt-1 text-sm text-gray-500">Access your commercial operating system</p>
          </div>

          {recovering ? (
            <p className="mt-8 text-sm text-gray-500">Opening your invitation…</p>
          ) : (
          <>
          {sessionNotice && (
            <p className={`mt-6 rounded-lg px-3 py-2 text-sm ${
              searchParams.get("setup") === "complete"
                ? "bg-green-50 text-green-800"
                : "bg-amber-50 text-amber-800"
            }`}>{sessionNotice}</p>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 lg:text-left">
            No account?{" "}
            <Link href="/register" className="font-medium text-brand-purple hover:underline">
              Register
            </Link>
          </p>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
