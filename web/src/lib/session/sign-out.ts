"use client";

import { createClient } from "@/lib/supabase/client";
import { clearSessionStorage } from "@/lib/session/client";

export async function signOutUser(options?: { redirectTo?: string }) {
  clearSessionStorage();
  const supabase = createClient();
  await supabase.auth.signOut();
  const target = options?.redirectTo ?? "/login";
  window.location.assign(target);
}
