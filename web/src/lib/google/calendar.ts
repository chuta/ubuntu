import { createClient, getProfile } from "@/lib/supabase/server";

export function isGoogleCalendarConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REDIRECT_URI
  );
}

export async function getGoogleRefreshToken(userId: string): Promise<string | null> {
  const integration = await getGoogleCalendarIntegration(userId);
  return integration?.google_refresh_token ?? null;
}

export async function getGoogleCalendarIntegration(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_integrations")
    .select("google_refresh_token, google_calendar_connected_at")
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}

export async function saveGoogleRefreshToken(userId: string, refreshToken: string) {
  const supabase = await createClient();
  await supabase.from("user_integrations").upsert({
    user_id: userId,
    google_refresh_token: refreshToken,
    google_calendar_connected_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

export async function exchangeCodeForTokens(code: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  return res.json() as Promise<{ refresh_token?: string; access_token: string }>;
}

export async function refreshAccessToken(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) throw new Error("Failed to refresh Google access token");
  return res.json() as Promise<{ access_token: string }>;
}

export type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
};

export async function fetchGoogleCalendarEvents(accessToken: string): Promise<GoogleCalendarEvent[]> {
  const now = new Date();
  const timeMin = new Date(now);
  timeMin.setMonth(timeMin.getMonth() - 3);
  const timeMax = new Date(now);
  timeMax.setMonth(timeMax.getMonth() + 3);

  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("timeMin", timeMin.toISOString());
  url.searchParams.set("timeMax", timeMax.toISOString());
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "250");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error("Failed to fetch Google Calendar events");
  const data = await res.json();
  return (data.items ?? []) as GoogleCalendarEvent[];
}

export function parseGoogleEventDates(event: GoogleCalendarEvent) {
  const startRaw = event.start?.date ?? event.start?.dateTime?.slice(0, 10);
  const endRaw = event.end?.date ?? event.end?.dateTime?.slice(0, 10);
  return {
    start_date: startRaw ?? new Date().toISOString().slice(0, 10),
    end_date: endRaw ?? null,
  };
}

export async function requireAuthenticatedProfile() {
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");
  return profile;
}
