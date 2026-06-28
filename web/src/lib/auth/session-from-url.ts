import type { EmailOtpType, SupabaseClient } from "@supabase/supabase-js";

export function resolveAuthDestination(next: string | null, type: string | null): string {
  let path = next ?? "/dashboard";
  if (path === "/auth/set-password" || path === "/set-password") path = "/join";
  if (type === "invite" || type === "recovery") return "/join";
  return path;
}

export type SessionFromUrlResult =
  | { ok: true; type: string | null }
  | { ok: false; error: string };

/**
 * Establish a Supabase session from URL credentials.
 * Handles implicit-flow hash tokens (#access_token=…), PKCE ?code=, and ?token_hash=.
 */
export async function establishSessionFromUrl(
  supabase: SupabaseClient
): Promise<SessionFromUrlResult> {
  if (typeof window === "undefined") {
    return { ok: false, error: "Session exchange must run in the browser." };
  }

  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : "";
  if (hash) {
    const hashParams = new URLSearchParams(hash);
    const access_token = hashParams.get("access_token");
    const refresh_token = hashParams.get("refresh_token");
    if (access_token && refresh_token) {
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) return { ok: false, error: error.message };
      clearAuthParamsFromUrl();
      return { ok: true, type: hashParams.get("type") };
    }
  }

  const query = new URLSearchParams(window.location.search);
  const code = query.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return { ok: false, error: error.message };
    clearAuthParamsFromUrl();
    return { ok: true, type: query.get("type") };
  }

  const token_hash = query.get("token_hash");
  const type = query.get("type");
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as EmailOtpType,
    });
    if (error) return { ok: false, error: error.message };
    clearAuthParamsFromUrl();
    return { ok: true, type };
  }

  return { ok: false, error: "No auth credentials found in this link." };
}

/** Remove tokens from the address bar after a successful exchange. */
export function clearAuthParamsFromUrl() {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  const query = new URLSearchParams(window.location.search);
  query.delete("code");
  query.delete("token_hash");
  query.delete("type");
  const qs = query.toString();
  window.history.replaceState({}, "", qs ? `${path}?${qs}` : path);
}

/** True when the URL still carries implicit-flow or PKCE auth params. */
export function urlHasAuthCredentials(): boolean {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash;
  if (hash.includes("access_token=")) return true;
  const query = new URLSearchParams(window.location.search);
  return query.has("code") || (query.has("token_hash") && query.has("type"));
}
