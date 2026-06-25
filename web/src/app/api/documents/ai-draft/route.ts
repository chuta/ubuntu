import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient, getProfile } from "@/lib/supabase/server";
import type { AiDraftParams } from "@/lib/actions/documents";
import {
  AI_GENERATION_STATUS,
  createAiDocumentShell,
  generateAiDocumentVersion,
} from "@/lib/documents/create-ai-draft";
import { isAiConfigured } from "@/lib/documents/draft-core";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

type Supabase = Awaited<ReturnType<typeof createClient>>;

function internalSecret(): string | undefined {
  return process.env.DRAFT_FUNCTION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function str(v: unknown) {
  return typeof v === "string" && v ? v : undefined;
}

/** Resolve the public origin that fronts this deploy's Netlify functions. */
function resolveOrigin(request: Request): string {
  return (
    process.env.DEPLOY_URL ||
    process.env.URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    new URL(request.url).origin
  );
}

function parseParams(body: Record<string, unknown>): AiDraftParams {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const document_type = body.document_type;
  if (!title) throw new Error("Title is required");
  if (typeof document_type !== "string") throw new Error("Document type is required");

  return {
    title,
    document_type: document_type as AiDraftParams["document_type"],
    organization_id: str(body.organization_id),
    deal_id: str(body.deal_id),
    partnership_id: str(body.partnership_id),
    key_terms: str(body.key_terms),
    additional_context: str(body.additional_context),
  };
}

/** Fire the background function; resolves true if it accepted the job (202). */
async function triggerBackground(
  origin: string,
  payload: { documentId: string; profileId: string; params: AiDraftParams }
): Promise<boolean> {
  const token = internalSecret();
  if (!token) return false;

  try {
    const res = await fetch(`${origin}/.netlify/functions/generate-draft-background`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, token }),
      signal: AbortSignal.timeout(8_000),
    });
    return res.status === 202 || res.ok;
  } catch {
    return false;
  }
}

/**
 * Offload generation to the background function; if that is unavailable
 * (e.g. local `next dev`), generate inline as a fallback.
 */
async function offloadOrInline(
  supabase: Supabase,
  origin: string,
  profileId: string,
  documentId: string,
  params: AiDraftParams
): Promise<"pending" | "ready"> {
  const offloaded = await triggerBackground(origin, { documentId, profileId, params });
  if (offloaded) return "pending";

  await generateAiDocumentVersion(supabase, profileId, documentId, params);
  revalidatePath(`/documents/${documentId}`);
  revalidatePath("/dashboard");
  return "ready";
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

  const phase =
    body.phase === "generate" || body.phase === "retry" ? body.phase : "start";

  try {
    const supabase = await createClient();
    const origin = resolveOrigin(request);

    // Synchronous (in-request) generation for an existing shell — used as a
    // local/dev path and as a last-resort retry.
    if (phase === "generate") {
      const documentId = str(body.documentId);
      if (!documentId) {
        return NextResponse.json({ error: "documentId is required" }, { status: 400 });
      }
      const params = parseParams(body);
      const id = await generateAiDocumentVersion(supabase, profile.id, documentId, params);
      revalidatePath("/documents");
      revalidatePath(`/documents/${id}`);
      revalidatePath("/dashboard");
      return NextResponse.json({ documentId: id, status: "ready" });
    }

    // Retry generation for an existing document, reconstructing params from the row.
    if (phase === "retry") {
      const documentId = str(body.documentId);
      if (!documentId) {
        return NextResponse.json({ error: "documentId is required" }, { status: 400 });
      }

      const { data: doc, error } = await supabase
        .from("documents")
        .select("id, title, document_type, organization_id, deal_id, partnership_id, owner_id")
        .eq("id", documentId)
        .single();
      if (error || !doc) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }
      if (doc.owner_id !== profile.id) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      }

      await supabase
        .from("documents")
        .update({ ai_generation_status: AI_GENERATION_STATUS.pending, ai_generation_error: null })
        .eq("id", documentId);

      const params: AiDraftParams = {
        title: doc.title,
        document_type: doc.document_type as AiDraftParams["document_type"],
        organization_id: doc.organization_id ?? undefined,
        deal_id: doc.deal_id ?? undefined,
        partnership_id: doc.partnership_id ?? undefined,
        key_terms: str(body.key_terms),
        additional_context: str(body.additional_context),
      };

      const status = await offloadOrInline(supabase, origin, profile.id, documentId, params);
      return NextResponse.json({ documentId, status });
    }

    // Start: create the shell quickly, then offload generation.
    const params = parseParams(body);
    const documentId = await createAiDocumentShell(supabase, profile.id, params);
    revalidatePath("/documents");

    const status = await offloadOrInline(supabase, origin, profile.id, documentId, params);
    return NextResponse.json({ documentId, status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI draft failed";
    const status =
      message === "Not authorized" ? 403 : message === "Document not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
