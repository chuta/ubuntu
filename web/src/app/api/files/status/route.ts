import { NextResponse } from "next/server";

/** @deprecated Use GET /api/files */
export async function GET() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/files`, { cache: "no-store" }).catch(() => null);
  if (res?.ok) return NextResponse.json(await res.json());
  return NextResponse.json({
    configured: Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
    ai: Boolean(process.env.ANTHROPIC_API_KEY),
  });
}
