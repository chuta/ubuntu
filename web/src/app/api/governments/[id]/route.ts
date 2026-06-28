import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateGovernment, type GovernmentFormData } from "@/lib/actions/governments";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const data = (await request.json()) as GovernmentFormData;
    await updateGovernment(id, data);
    return NextResponse.json({ id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update government";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
