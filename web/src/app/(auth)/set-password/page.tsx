"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { initSession } from "@/lib/session/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SetPasswordPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setHasSession(!!data.user);
      setEmail(data.user?.email ?? null);
      setChecking(false);
    });
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

    initSession();
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <div className="brand-gradient relative hidden w-1/2 flex-col justify-between p-12 text-white lg:flex">
        <Image src="/logo.svg" alt="Ubuntu Tribe" width={160} height={34} priority style={{ height: "auto" }} />
        <div className="max-w-md">
          <h1 className="text-3xl font-bold">Welcome to GrowthOS</h1>
          <p className="mt-4 text-white/80">
            Set a password to finish joining your team&apos;s commercial operating system.
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
            <p className="text-sm text-gray-500">Verifying your invitation…</p>
          ) : !hasSession ? (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Invitation link expired</h2>
              <p className="mt-2 text-sm text-gray-500">
                This invitation link is no longer valid. Ask an admin to resend your invite, then open
                the new link.
              </p>
              <Link href="/login" className="mt-6 inline-block text-brand-purple hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-semibold text-gray-900">Set your password</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {email ? <>Finishing setup for <strong>{email}</strong></> : "Choose a password to access your account"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                    New password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
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
                  {loading ? "Saving…" : "Set password & continue"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
