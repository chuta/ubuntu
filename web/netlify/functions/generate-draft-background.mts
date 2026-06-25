/**
 * Long-running AI draft generation as a Netlify background function.
 *
 * Background functions return 202 immediately and may run up to 15 minutes,
 * which avoids the synchronous-function timeout (504) that Claude generation
 * exceeds. Results are written to the database; the client polls
 * `/api/documents/:id/draft-status` for completion.
 *
 * Triggered server-to-server from `POST /api/documents/ai-draft` (start phase).
 */
import { createClient } from "@supabase/supabase-js";
import { generateBrandedDraft } from "../../src/lib/documents/draft-core";

type DraftParams = {
  title: string;
  document_type: string;
  organization_id?: string;
  deal_id?: string;
  partnership_id?: string;
  key_terms?: string;
  additional_context?: string;
};

type Payload = {
  documentId?: string;
  profileId?: string;
  token?: string;
  params?: DraftParams;
};

const STATUS = { ready: "READY", error: "ERROR" } as const;

function internalSecret(): string | undefined {
  return process.env.DRAFT_FUNCTION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service credentials are not configured");
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const expected = internalSecret();
  if (!expected || body.token !== expected) {
    return new Response("Forbidden", { status: 403 });
  }

  const { documentId, profileId, params } = body;
  if (!documentId || !params) {
    return new Response("documentId and params required", { status: 400 });
  }

  try {
    const supabase = serviceClient();

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("id, owner_id")
      .eq("id", documentId)
      .single();
    if (docError || !doc) throw new Error("Document not found");
    if (profileId && doc.owner_id !== profileId) throw new Error("Not authorized");

    const { data: existing } = await supabase
      .from("document_versions")
      .select("id")
      .eq("document_id", documentId)
      .limit(1);

    if ((existing?.length ?? 0) === 0) {
      let organizationName: string | undefined;
      let dealName: string | undefined;
      if (params.organization_id) {
        const { data } = await supabase
          .from("organizations")
          .select("name")
          .eq("id", params.organization_id)
          .single();
        organizationName = data?.name ?? undefined;
      }
      if (params.deal_id) {
        const { data } = await supabase
          .from("deals")
          .select("name")
          .eq("id", params.deal_id)
          .single();
        dealName = data?.name ?? undefined;
      }

      const branded = await generateBrandedDraft({
        documentType: params.document_type,
        title: params.title,
        organizationName,
        dealName,
        keyTerms: params.key_terms,
        additionalContext: params.additional_context,
      });

      const { data: version, error: versionError } = await supabase
        .from("document_versions")
        .insert({
          document_id: documentId,
          version_number: 1,
          storage_url: `inline://${documentId}/v1`,
          change_summary: branded,
          created_by_id: doc.owner_id,
        })
        .select("id")
        .single();
      if (versionError) throw new Error(versionError.message);

      await supabase
        .from("documents")
        .update({ current_version_id: version.id })
        .eq("id", documentId);
    }

    await supabase
      .from("documents")
      .update({ ai_generation_status: STATUS.ready, ai_generation_error: null })
      .eq("id", documentId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI draft generation failed";
    // Best-effort: record the failure so the client stops polling and can retry.
    try {
      await serviceClient()
        .from("documents")
        .update({ ai_generation_status: STATUS.error, ai_generation_error: message.slice(0, 500) })
        .eq("id", documentId);
    } catch {
      // No DB access (e.g. missing service credentials) — the client-side
      // polling cap and synchronous fallback will surface/handle this.
    }
  }

  // Background functions ignore the return value; client polls for status.
  return new Response("ok");
};
