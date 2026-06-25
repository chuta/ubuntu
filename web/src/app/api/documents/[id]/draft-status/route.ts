import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: doc, error } = await supabase
    .from("documents")
    .select("id, ai_generation_status, ai_generation_error, current_version_id")
    .eq("id", id)
    .single();

  if (error || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const { count } = await supabase
    .from("document_versions")
    .select("id", { count: "exact", head: true })
    .eq("document_id", id);

  const hasVersion = (count ?? 0) > 0;
  const rawStatus = doc.ai_generation_status as string | null;

  let status: "ready" | "pending" | "error";
  if (hasVersion || rawStatus === "READY") {
    status = "ready";
  } else if (rawStatus === "ERROR") {
    status = "error";
  } else {
    status = "pending";
  }

  return NextResponse.json({
    status,
    ready: status === "ready",
    error: status === "error" ? doc.ai_generation_error ?? "Generation failed" : null,
  });
}
