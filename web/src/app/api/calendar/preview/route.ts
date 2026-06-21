import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchGoogleCalendarEvents,
  getGoogleRefreshToken,
  isGoogleCalendarConfigured,
  parseGoogleEventDates,
  refreshAccessToken,
  requireAuthenticatedProfile,
} from "@/lib/google/calendar";

export async function GET() {
  if (!isGoogleCalendarConfigured()) {
    return NextResponse.json(
      { error: "Google Calendar OAuth is not configured." },
      { status: 503 }
    );
  }

  try {
    const profile = await requireAuthenticatedProfile();
    const refreshToken = await getGoogleRefreshToken(profile.id);

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Google Calendar not connected. Click Connect Google first." },
        { status: 400 }
      );
    }

    const { access_token } = await refreshAccessToken(refreshToken);
    const googleEvents = await fetchGoogleCalendarEvents(access_token);

    const events = googleEvents
      .filter((ge) => ge.id)
      .map((ge) => {
        const { start_date, end_date } = parseGoogleEventDates(ge);
        return {
          google_event_id: ge.id,
          name: ge.summary ?? "Untitled event",
          start_date,
          end_date,
          location: ge.location ?? null,
          description: ge.description ?? null,
        };
      });

    const googleIds = events.map((e) => e.google_event_id);
    const supabase = await createClient();
    const { data: existingRows } = googleIds.length
      ? await supabase.from("events").select("google_event_id").in("google_event_id", googleIds)
      : { data: [] };

    const importedIds = new Set(existingRows?.map((r) => r.google_event_id) ?? []);

    return NextResponse.json({
      events: events.map((e) => ({
        ...e,
        alreadyImported: importedIds.has(e.google_event_id),
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load calendar events" },
      { status: 500 }
    );
  }
}
