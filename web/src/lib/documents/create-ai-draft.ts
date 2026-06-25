import { generateBrandedDraft, isAiConfigured } from "@/lib/documents/draft-core";
import { inlineStorageUrl } from "@/lib/s3/storage";
import type { AiDraftParams } from "@/lib/actions/documents";
import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export const AI_GENERATION_STATUS = {
  pending: "PENDING",
  ready: "READY",
  error: "ERROR",
} as const;

/** Resolve linked org/deal names for richer prompt context. */
async function resolveContext(supabase: Supabase, params: AiDraftParams) {
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

  return { organizationName, dealName };
}

async function storeDraftVersion(
  supabase: Supabase,
  documentId: string,
  userId: string,
  content: string
) {
  const { data: existing } = await supabase
    .from("document_versions")
    .select("version_number")
    .eq("document_id", documentId)
    .order("version_number", { ascending: false })
    .limit(1);

  const versionNumber = (existing?.[0]?.version_number ?? 0) + 1;

  // AI drafts are markdown — store inline so generation never depends on S3.
  const { data: version, error } = await supabase
    .from("document_versions")
    .insert({
      document_id: documentId,
      version_number: versionNumber,
      storage_url: inlineStorageUrl(documentId, versionNumber),
      change_summary: content,
      created_by_id: userId,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await supabase
    .from("documents")
    .update({ current_version_id: version.id })
    .eq("id", documentId);
}

export async function createAiDocumentShell(
  supabase: Supabase,
  profileId: string,
  params: AiDraftParams
): Promise<string> {
  const { data: doc, error } = await supabase
    .from("documents")
    .insert({
      title: params.title,
      document_type: params.document_type,
      status: "DRAFT",
      organization_id: params.organization_id || null,
      deal_id: params.deal_id || null,
      partnership_id: params.partnership_id || null,
      owner_id: profileId,
      created_by: profileId,
      ai_generated: true,
      ai_generation_status: AI_GENERATION_STATUS.pending,
      ai_generation_error: null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return doc.id;
}

export async function generateAiDocumentVersion(
  supabase: Supabase,
  profileId: string,
  documentId: string,
  params: AiDraftParams
): Promise<string> {
  if (!isAiConfigured()) {
    throw new Error("Anthropic API key not configured. Add ANTHROPIC_API_KEY to .env");
  }

  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("id, owner_id")
    .eq("id", documentId)
    .single();

  if (docError || !doc) throw new Error("Document not found");
  if (profileId && doc.owner_id !== profileId) throw new Error("Not authorized");

  const { data: existingVersions } = await supabase
    .from("document_versions")
    .select("id")
    .eq("document_id", documentId)
    .limit(1);

  if ((existingVersions?.length ?? 0) > 0) {
    await supabase
      .from("documents")
      .update({ ai_generation_status: AI_GENERATION_STATUS.ready, ai_generation_error: null })
      .eq("id", documentId);
    return documentId;
  }

  try {
    const { organizationName, dealName } = await resolveContext(supabase, params);

    const brandedContent = await generateBrandedDraft({
      documentType: params.document_type,
      title: params.title,
      organizationName,
      dealName,
      keyTerms: params.key_terms,
      additionalContext: params.additional_context,
    });

    await storeDraftVersion(supabase, documentId, doc.owner_id, brandedContent);

    await supabase
      .from("documents")
      .update({ ai_generation_status: AI_GENERATION_STATUS.ready, ai_generation_error: null })
      .eq("id", documentId);

    return documentId;
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI draft generation failed";
    await supabase
      .from("documents")
      .update({
        ai_generation_status: AI_GENERATION_STATUS.error,
        ai_generation_error: message.slice(0, 500),
      })
      .eq("id", documentId);
    throw err;
  }
}

export async function createAiDocumentDraft(
  supabase: Supabase,
  profileId: string,
  params: AiDraftParams
): Promise<string> {
  const documentId = await createAiDocumentShell(supabase, profileId, params);
  await generateAiDocumentVersion(supabase, profileId, documentId, params);
  return documentId;
}
