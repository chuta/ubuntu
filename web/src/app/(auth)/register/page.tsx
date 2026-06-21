"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      const message =
        authError.message ||
        (authError as { msg?: string }).msg ||
        "Registration failed. If this persists, run the signup fix SQL in Supabase.";
      setError(message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Check your email</h2>
          <p className="mt-2 text-sm text-gray-500">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <Link href="/login" className="mt-6 inline-block text-brand-purple hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="brand-gradient relative hidden w-1/2 flex-col justify-between p-12 text-white lg:flex">
        <Image src="/logo.svg" alt="Ubuntu Tribe" width={160} height={34} priority style={{ height: "auto" }} />
        <div className="max-w-md">
          <h1 className="text-3xl font-bold">Join GrowthOS</h1>
          <p className="mt-4 text-white/80">
            Built to deliver and exceed commercial expectations across B2G, B2B, and institutional partnerships.
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

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-semibold text-gray-900">Create account</h2>
            <p className="mt-1 text-sm text-gray-500">Ubuntu Tribe commercial team</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">
                Full name
              </label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                minLength={8}
              />
            </div>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 lg:text-left">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand-purple hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
