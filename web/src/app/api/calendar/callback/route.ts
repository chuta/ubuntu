import { NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  isGoogleCalendarConfigured,
  requireAuthenticatedProfile,
  saveGoogleRefreshToken,
} from "@/lib/google/calendar";

export async function GET(request: Request) {
  if (!isGoogleCalendarConfigured()) {
    return NextResponse.redirect(new URL("/events?calendar=not_configured", request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/events?calendar=denied", request.url));
  }

  try {
    const profile = await requireAuthenticatedProfile();
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.refresh_token) {
      return NextResponse.redirect(new URL("/events?calendar=no_refresh", request.url));
    }

    await saveGoogleRefreshToken(profile.id, tokens.refresh_token);
    return NextResponse.redirect(new URL("/events?calendar=connected", request.url));
  } catch {
    return NextResponse.redirect(new URL("/events?calendar=error", request.url));
  }
}
