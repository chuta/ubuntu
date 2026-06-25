/**
 * Document generation service — the single source of truth for creating
 * documents and their content versions.
 *
 * Design goals (rebuild):
 * - Synchronous + observable: every path logs and ends in a terminal state.
 * - Storage-independent: content is stored inline in the DB (no S3 dependency
 *   for generation), so generation never fails because S3 is misconfigured.
 * - One code path for manual + AI + retry.
 */
import {
  applyDocumentBranding,
} from "@/lib/documents/branded-markdown";
import {
  AI_DRAFT_MODEL,
  AI_DRAFT_MAX_TOKENS,
  buildBrandedTemplate,
  generateBrandedDraft,
  isAiConfigured,
} from "@/lib/documents/draft-core";
import { labelFor, DOCUMENT_TYPES } from "@/lib/constants/documents";
import { inlineStorageUrl } from "@/lib/s3/storage";
import type { DocumentType, DocumentStatus } from "@/types/documents";
import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export const AI_GENERATION_STATUS = {
  pending: "PENDING",
  ready: "READY",
  error: "ERROR",
} as const;

function log(stage: string, detail: Record<string, unknown>) {
  // Prefixed so it is easy to find in Netlify function logs.
  console.info(`[doc-gen] ${stage}`, JSON.stringify(detail));
}

function logError(stage: string, err: unknown, detail: Record<string, unknown> = {}) {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  console.error(`[doc-gen] ${stage} FAILED`, JSON.stringify({ ...detail, message }), stack ?? "");
}

export type ManualDocumentInput = {
  title: string;
  document_type: DocumentType;
  status: DocumentStatus;
  organization_id?: string;
  deal_id?: string;
  partnership_id?: string;
  effective_date?: string;
  expiration_date?: string;
  content?: string;
};

export type AiDocumentInput = {
  title: string;
  document_type: DocumentType;
  organization_id?: string;
  deal_id?: string;
  partnership_id?: string;
  key_terms?: string;
  additional_context?: string;
};

async function resolveContext(supabase: Supabase, input: { organization_id?: string; deal_id?: string }) {
  let organizationName: string | undefined;
  let dealName: string | undefined;

  if (input.organization_id) {
    const { data } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", input.organization_id)
      .single();
    organizationName = data?.name ?? undefined;
  }
  if (input.deal_id) {
    const { data } = await supabase
      .from("deals")
      .select("name")
      .eq("id", input.deal_id)
      .single();
    dealName = data?.name ?? undefined;
  }

  return { organizationName, dealName };
}

/** Insert a new inline content version and point the document at it. */
async function insertVersion(
  supabase: Supabase,
  args: { documentId: string; userId: string; content: string }
): Promise<string> {
  const { data: existing } = await supabase
    .from("document_versions")
    .select("version_number")
    .eq("document_id", args.documentId)
    .order("version_number", { ascending: false })
    .limit(1);

  const versionNumber = (existing?.[0]?.version_number ?? 0) + 1;

  const { data: version, error } = await supabase
    .from("document_versions")
    .insert({
      document_id: args.documentId,
      version_number: versionNumber,
      storage_url: inlineStorageUrl(args.documentId, versionNumber),
      change_summary: args.content,
      created_by_id: args.userId,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Could not save version: ${error.message}`);

  const { error: updateError } = await supabase
    .from("documents")
    .update({ current_version_id: version.id })
    .eq("id", args.documentId);
  if (updateError) throw new Error(`Could not link version: ${updateError.message}`);

  return version.id;
}

/**
 * Manual document: create the row AND a real branded content version
 * (from the user's content, or a template skeleton when left blank).
 */
export async function createManualDocument(
  supabase: Supabase,
  profileId: string,
  input: ManualDocumentInput
): Promise<string> {
  log("manual:start", { profileId, type: input.document_type });

  const { data: doc, error } = await supabase
    .from("documents")
    .insert({
      title: input.title,
      document_type: input.document_type,
      status: input.status,
      organization_id: input.organization_id || null,
      deal_id: input.deal_id || null,
      partnership_id: input.partnership_id || null,
      effective_date: input.effective_date || null,
      expiration_date: input.expiration_date || null,
      owner_id: profileId,
      created_by: profileId,
      ai_generated: false,
    })
    .select("id")
    .single();

  if (error || !doc) throw new Error(`Could not create document: ${error?.message ?? "unknown"}`);

  try {
    const { organizationName, dealName } = await resolveContext(supabase, input);
    const provided = input.content?.trim();

    const branded = provided
      ? applyDocumentBranding(provided, {
          title: input.title,
          documentTypeLabel: labelFor(DOCUMENT_TYPES, input.document_type),
        })
      : buildBrandedTemplate({
          documentType: input.document_type,
          title: input.title,
          organizationName,
          dealName,
        });

    await insertVersion(supabase, { documentId: doc.id, userId: profileId, content: branded });
    log("manual:done", { documentId: doc.id });
    return doc.id;
  } catch (err) {
    logError("manual:version", err, { documentId: doc.id });
    // The document row exists; surface a clear error so the user can retry
    // adding content rather than silently shipping an empty document.
    throw err instanceof Error ? err : new Error("Could not generate document content");
  }
}

/** Create the AI document shell (PENDING) without generating content yet. */
export async function createAiDocumentShell(
  supabase: Supabase,
  profileId: string,
  input: AiDocumentInput
): Promise<string> {
  const { data: doc, error } = await supabase
    .from("documents")
    .insert({
      title: input.title,
      document_type: input.document_type,
      status: "DRAFT",
      organization_id: input.organization_id || null,
      deal_id: input.deal_id || null,
      partnership_id: input.partnership_id || null,
      owner_id: profileId,
      created_by: profileId,
      ai_generated: true,
      ai_generation_status: AI_GENERATION_STATUS.pending,
      ai_generation_error: null,
    })
    .select("id")
    .single();

  if (error || !doc) throw new Error(`Could not create document: ${error?.message ?? "unknown"}`);
  return doc.id;
}

async function setStatus(
  supabase: Supabase,
  documentId: string,
  status: string,
  errorMessage: string | null
) {
  await supabase
    .from("documents")
    .update({ ai_generation_status: status, ai_generation_error: errorMessage })
    .eq("id", documentId);
}

/**
 * Generate content for an existing AI shell synchronously. Always ends in
 * READY (with a version) or ERROR (with a message). Idempotent: if a version
 * already exists it just marks READY.
 */
export async function generateAiContent(
  supabase: Supabase,
  profileId: string,
  documentId: string,
  input: AiDocumentInput
): Promise<void> {
  log("ai:start", {
    documentId,
    type: input.document_type,
    model: AI_DRAFT_MODEL,
    maxTokens: AI_DRAFT_MAX_TOKENS,
  });

  if (!isAiConfigured()) {
    await setStatus(supabase, documentId, AI_GENERATION_STATUS.error, "AI is not configured");
    throw new Error("Anthropic API key not configured. Add ANTHROPIC_API_KEY to .env");
  }

  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("id, owner_id")
    .eq("id", documentId)
    .single();
  if (docError || !doc) throw new Error("Document not found");
  if (doc.owner_id !== profileId) throw new Error("Not authorized");

  const { data: existing } = await supabase
    .from("document_versions")
    .select("id")
    .eq("document_id", documentId)
    .limit(1);

  if ((existing?.length ?? 0) > 0) {
    await setStatus(supabase, documentId, AI_GENERATION_STATUS.ready, null);
    log("ai:already-generated", { documentId });
    return;
  }

  try {
    const { organizationName, dealName } = await resolveContext(supabase, input);
    const started = Date.now();

    const branded = await generateBrandedDraft({
      documentType: input.document_type,
      title: input.title,
      organizationName,
      dealName,
      keyTerms: input.key_terms,
      additionalContext: input.additional_context,
    });

    log("ai:generated", { documentId, ms: Date.now() - started, chars: branded.length });

    await insertVersion(supabase, { documentId, userId: doc.owner_id, content: branded });
    await setStatus(supabase, documentId, AI_GENERATION_STATUS.ready, null);
    log("ai:done", { documentId });
  } catch (err) {
    logError("ai:generate", err, { documentId });
    const message = err instanceof Error ? err.message : "AI draft generation failed";
    await setStatus(supabase, documentId, AI_GENERATION_STATUS.error, message.slice(0, 500));
    throw err instanceof Error ? err : new Error(message);
  }
}

/** Create shell + generate in one synchronous call. Returns the document id. */
export async function createAiDocument(
  supabase: Supabase,
  profileId: string,
  input: AiDocumentInput
): Promise<string> {
  const documentId = await createAiDocumentShell(supabase, profileId, input);
  await generateAiContent(supabase, profileId, documentId, input);
  return documentId;
}

/** Regenerate content for an existing document, reconstructing params from the row. */
export async function regenerateAiDocument(
  supabase: Supabase,
  profileId: string,
  documentId: string,
  extra?: { key_terms?: string; additional_context?: string }
): Promise<void> {
  const { data: doc, error } = await supabase
    .from("documents")
    .select("id, title, document_type, organization_id, deal_id, partnership_id, owner_id")
    .eq("id", documentId)
    .single();
  if (error || !doc) throw new Error("Document not found");
  if (doc.owner_id !== profileId) throw new Error("Not authorized");

  await setStatus(supabase, documentId, AI_GENERATION_STATUS.pending, null);

  await generateAiContent(supabase, profileId, documentId, {
    title: doc.title,
    document_type: doc.document_type as DocumentType,
    organization_id: doc.organization_id ?? undefined,
    deal_id: doc.deal_id ?? undefined,
    partnership_id: doc.partnership_id ?? undefined,
    key_terms: extra?.key_terms,
    additional_context: extra?.additional_context,
  });
}
