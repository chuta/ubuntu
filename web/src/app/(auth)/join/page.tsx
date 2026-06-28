"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function JoinPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function bootstrapSession() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) setError(exchangeError.message);
        window.history.replaceState({}, "", "/join");
      }

      const { data } = await supabase.auth.getUser();
      setHasSession(!!data.user);
      setEmail(data.user?.email ?? null);
      setFullName(
        (data.user?.user_metadata?.full_name as string | undefined) ??
          data.user?.email?.split("@")[0] ??
          null
      );
      setChecking(false);
    }

    bootstrapSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    router.push("/login?setup=complete");
  }

  return (
    <div className="flex min-h-screen">
      <div className="brand-gradient relative hidden w-1/2 flex-col justify-between p-12 text-white lg:flex">
        <Image src="/logo.svg" alt="Ubuntu Tribe" width={160} height={34} priority style={{ height: "auto" }} />
        <div className="max-w-md">
          <h1 className="text-3xl font-bold">Join GrowthOS</h1>
          <p className="mt-4 text-white/80">
            Accept your team invitation, set a password, then sign in to access your commercial
            operating system.
          </p>
        </div>
        <p className="text-xs text-white/40">Ubuntu Tribe commercial team</p>
      </div>

      <div className="flex min-h-screen w-full items-center justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <div className="brand-gradient rounded-xl px-6 py-4">
              <Image src="/logo.svg" alt="Ubuntu Tribe" width={140} height={30} priority style={{ height: "auto" }} />
            </div>
          </div>

          {checking ? (
            <p className="text-sm text-gray-500">Opening your invitation…</p>
          ) : !hasSession ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Join GrowthOS</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Your invitation link may have expired. Choose how you&apos;d like to continue.
                </p>
              </div>
              <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
                <p className="font-medium text-gray-900">Were you invited by email?</p>
                <p className="text-gray-600">
                  Ask your admin to resend the invite, then open the new link from your inbox.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link href="/register">
                  <Button type="button" className="w-full">
                    Create a new account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button type="button" variant="outline" className="w-full">
                    Sign in with existing password
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Welcome{fullName ? `, ${fullName}` : ""}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Step 1 of 2 — set a password for{" "}
                  <strong>{email}</strong>, then sign in to activate your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                  />
                </div>
                <div>
                  <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-gray-700">
                    Confirm password
                  </label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Saving…" : "Set password & continue to sign in"}
                </Button>
              </form>

              <div className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-500 lg:text-left">
                <p className="font-medium text-gray-700">Not joining with this email?</p>
                <p className="mt-1">
                  <Link href="/register" className="text-brand-purple hover:underline">
                    Create a new account
                  </Link>
                  {" · "}
                  <Link href="/login" className="text-brand-purple hover:underline">
                    Sign in instead
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
