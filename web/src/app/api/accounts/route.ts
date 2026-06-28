import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAccount, type AccountFormData } from "@/lib/actions/accounts";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = (await request.json()) as AccountFormData;
    if (!data.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!data.account_subtype) {
      return NextResponse.json({ error: "Account type is required" }, { status: 400 });
    }
    const id = await createAccount(data);
    return NextResponse.json({ id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create account";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
