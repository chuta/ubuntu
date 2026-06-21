import { NextResponse } from "next/server";
import {
  getGoogleCalendarIntegration,
  isGoogleCalendarConfigured,
  requireAuthenticatedProfile,
} from "@/lib/google/calendar";

export async function GET() {
  try {
    const profile = await requireAuthenticatedProfile();
    const configured = isGoogleCalendarConfigured();
    const integration = configured
      ? await getGoogleCalendarIntegration(profile.id)
      : null;

    return NextResponse.json({
      configured,
      connected: Boolean(integration?.google_refresh_token),
      connectedAt: integration?.google_calendar_connected_at ?? null,
    });
  } catch {
    return NextResponse.json({ configured: false, connected: false }, { status: 401 });
  }
}
