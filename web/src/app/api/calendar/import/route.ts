import { NextResponse } from "next/server";
import { importGoogleCalendarEvents } from "@/lib/actions/events";
import {
  getGoogleRefreshToken,
  isGoogleCalendarConfigured,
  requireAuthenticatedProfile,
} from "@/lib/google/calendar";

type ImportEventPayload = {
  google_event_id: string;
  name: string;
  start_date: string;
  end_date?: string | null;
  location?: string | null;
  description?: string | null;
};

export async function POST(request: Request) {
  if (!isGoogleCalendarConfigured()) {
    return NextResponse.json(
      {
        error:
          "Google Calendar OAuth is not configured. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI to .env",
      },
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

    const body = (await request.json()) as { events?: ImportEventPayload[] };
    const events = body.events?.filter((e) => e.google_event_id) ?? [];

    if (events.length === 0) {
      return NextResponse.json({ error: "Select at least one event to import." }, { status: 400 });
    }

    const { imported, updated, total } = await importGoogleCalendarEvents(events);

    return NextResponse.json({ imported, updated, total });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Import failed" },
      { status: 500 }
    );
  }
}
