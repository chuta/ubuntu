import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient, getProfile } from "@/lib/supabase/server";
import type { AiDraftParams } from "@/lib/actions/documents";
import {
  createAiDocumentDraft,
  createAiDocumentShell,
  generateAiDocumentVersion,
} from "@/lib/documents/create-ai-draft";
import { isAiConfigured } from "@/lib/ai/draft-document";

/** Allow long Claude generations on hosts that honor Next route limits (Netlify max is 60s on Pro). */
export const maxDuration = 60;
export const dynamic = "force-dynamic";

function parseParams(body: Record<string, unknown>): AiDraftParams {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const document_type = body.document_type;
  if (!title) throw new Error("Title is required");
  if (typeof document_type !== "string") throw new Error("Document type is required");

  return {
    title,
    document_type: document_type as AiDraftParams["document_type"],
    organization_id:
      typeof body.organization_id === "string" && body.organization_id
        ? body.organization_id
        : undefined,
    deal_id:
      typeof body.deal_id === "string" && body.deal_id ? body.deal_id : undefined,
    partnership_id:
      typeof body.partnership_id === "string" && body.partnership_id
        ? body.partnership_id
        : undefined,
    key_terms:
      typeof body.key_terms === "string" && body.key_terms ? body.key_terms : undefined,
    additional_context:
      typeof body.additional_context === "string" && body.additional_context
        ? body.additional_context
        : undefined,
  };
}

export async function POST(request: Request) {
  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: "Anthropic API key not configured. Add ANTHROPIC_API_KEY to .env" },
      { status: 503 }
    );
  }

  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const phase = body.phase === "start" || body.phase === "generate" ? body.phase : "full";

  try {
    const params = parseParams(body);
    const supabase = await createClient();

    if (phase === "start") {
      const documentId = await createAiDocumentShell(supabase, profile.id, params);
      revalidatePath("/documents");
      return NextResponse.json({ documentId, phase: "start" });
    }

    if (phase === "generate") {
      const documentId =
        typeof body.documentId === "string" ? body.documentId : undefined;
      if (!documentId) {
        return NextResponse.json({ error: "documentId is required" }, { status: 400 });
      }

      const id = await generateAiDocumentVersion(
        supabase,
        profile.id,
        documentId,
        params
      );
      revalidatePath("/documents");
      revalidatePath(`/documents/${id}`);
      revalidatePath("/dashboard");
      return NextResponse.json({ documentId: id, phase: "generate" });
    }

    const documentId = await createAiDocumentDraft(supabase, profile.id, params);
    revalidatePath("/documents");
    revalidatePath(`/documents/${documentId}`);
    revalidatePath("/dashboard");
    return NextResponse.json({ documentId, phase: "full" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI draft failed";
    const status = message === "Not authorized" ? 403 : message === "Document not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
