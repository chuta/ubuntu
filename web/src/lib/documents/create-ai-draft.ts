import { generateDocumentDraft, isAiConfigured } from "@/lib/ai/draft-document";
import { applyDocumentBranding } from "@/lib/documents/branded-markdown";
import { labelFor, DOCUMENT_TYPES } from "@/lib/constants/documents";
import {
  documentKey,
  inlineStorageUrl,
  isStorageConfigured,
  uploadText,
} from "@/lib/s3/storage";
import type { DocumentVersion } from "@/types/documents";
import type { AiDraftParams } from "@/lib/actions/documents";
import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

async function createVersion(
  supabase: Supabase,
  documentId: string,
  userId: string,
  content: string,
  changeSummary: string,
  filename: string
): Promise<DocumentVersion> {
  const { data: existing } = await supabase
    .from("document_versions")
    .select("version_number")
    .eq("document_id", documentId)
    .order("version_number", { ascending: false })
    .limit(1);

  const versionNumber = (existing?.[0]?.version_number ?? 0) + 1;
  let storageUrl: string;

  if (isStorageConfigured()) {
    const key = documentKey(documentId, versionNumber, filename);
    storageUrl = await uploadText(key, content);
  } else {
    storageUrl = inlineStorageUrl(documentId, versionNumber);
  }

  const { data: version, error } = await supabase
    .from("document_versions")
    .insert({
      document_id: documentId,
      version_number: versionNumber,
      storage_url: storageUrl,
      change_summary: isStorageConfigured() ? changeSummary : content,
      created_by_id: userId,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  await supabase
    .from("documents")
    .update({ current_version_id: version.id })
    .eq("id", documentId);

  return version as DocumentVersion;
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
  if (doc.owner_id !== profileId) throw new Error("Not authorized");

  const { data: existingVersions } = await supabase
    .from("document_versions")
    .select("id")
    .eq("document_id", documentId)
    .limit(1);

  if ((existingVersions?.length ?? 0) > 0) {
    return documentId;
  }

  let orgName: string | undefined;
  let dealName: string | undefined;

  if (params.organization_id) {
    const { data } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", params.organization_id)
      .single();
    orgName = data?.name;
  }
  if (params.deal_id) {
    const { data } = await supabase
      .from("deals")
      .select("name")
      .eq("id", params.deal_id)
      .single();
    dealName = data?.name;
  }

  const draftContent = await generateDocumentDraft({
    documentType: params.document_type,
    organizationName: orgName,
    dealName: dealName,
    keyTerms: params.key_terms,
    additionalContext: params.additional_context,
  });

  const brandedContent = applyDocumentBranding(draftContent, {
    title: params.title,
    documentTypeLabel: labelFor(DOCUMENT_TYPES, params.document_type),
  });

  await createVersion(
    supabase,
    documentId,
    profileId,
    brandedContent,
    "AI-generated draft (Claude)",
    "draft.md"
  );

  return documentId;
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
