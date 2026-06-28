import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createGovernment, type GovernmentFormData } from "@/lib/actions/governments";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = (await request.json()) as GovernmentFormData;
    if (!data.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!data.government_level) {
      return NextResponse.json({ error: "Government level is required" }, { status: 400 });
    }
    const id = await createGovernment(data);
    return NextResponse.json({ id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create government";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
