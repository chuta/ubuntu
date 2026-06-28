"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  establishSessionFromUrl,
  resolveAuthDestination,
} from "@/lib/auth/session-from-url";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}

function AuthCallbackFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <p className="text-sm text-gray-500">Completing sign-in…</p>
    </div>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Completing sign-in…");

  useEffect(() => {
    async function complete() {
      const supabase = createClient();
      const next = searchParams.get("next");
      const queryType = searchParams.get("type");

      const result = await establishSessionFromUrl(supabase);
      if (result.ok) {
        router.replace(resolveAuthDestination(next, result.type ?? queryType));
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace(resolveAuthDestination(next, queryType));
        return;
      }

      setMessage(result.error);
      router.replace("/login?error=auth_callback_failed");
    }

    complete();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
