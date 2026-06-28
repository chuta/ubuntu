import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Activate an invited user after their first successful password sign-in.
 * Self-registered users (no invited_at) are not affected — admins approve those.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ activated: false }, { status: 200 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("invited_at, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.invited_at || profile.is_active) {
    return NextResponse.json({ activated: false }, { status: 200 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: true, last_login_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ activated: false, error: error.message }, { status: 200 });
  }

  return NextResponse.json({ activated: true }, { status: 200 });
}
