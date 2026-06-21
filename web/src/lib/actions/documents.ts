"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import { SELECT } from "@/lib/supabase/embeds";
import { generateDocumentDraft } from "@/lib/ai/draft-document";
import { applyDocumentBranding } from "@/lib/documents/branded-markdown";
import { labelFor, DOCUMENT_TYPES } from "@/lib/constants/documents";
import {
  documentKey,
  inlineStorageUrl,
  isStorageConfigured,
  uploadText,
} from "@/lib/s3/storage";
import type { Document, DocumentStatus, DocumentType, DocumentVersion } from "@/types/documents";
import { revalidatePath } from "next/cache";

export type DocumentFormData = {
  title: string;
  document_type: DocumentType;
  status: DocumentStatus;
  organization_id?: string;
  deal_id?: string;
  partnership_id?: string;
  effective_date?: string;
  expiration_date?: string;
};

export type AiDraftParams = {
  title: string;
  document_type: DocumentType;
  organization_id?: string;
  deal_id?: string;
  partnership_id?: string;
  key_terms?: string;
  additional_context?: string;
};

async function createVersion(
  supabase: Awaited<ReturnType<typeof createClient>>,
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

export async function getDocuments(filters?: {
  document_type?: string;
  status?: string;
  search?: string;
}): Promise<Document[]> {
  const supabase = await createClient();
  let query = supabase
    .from("documents")
    .select(SELECT.document)
    .order("updated_at", { ascending: false });

  if (filters?.document_type) query = query.eq("document_type", filters.document_type);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.search) query = query.ilike("title", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Document[];
}

export async function getDocument(id: string): Promise<Document | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select(SELECT.document)
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Document;
}

export async function getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("document_versions")
    .select("*, created_by:profiles(full_name)")
    .eq("document_id", documentId)
    .order("version_number", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as DocumentVersion[];
}

export async function getDocumentCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase.from("documents").select("*", { count: "exact", head: true });
  return count ?? 0;
}

export async function createDocument(data: DocumentFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { data: doc, error } = await supabase
    .from("documents")
    .insert({
      title: data.title,
      document_type: data.document_type,
      status: data.status,
      organization_id: data.organization_id || null,
      deal_id: data.deal_id || null,
      partnership_id: data.partnership_id || null,
      effective_date: data.effective_date || null,
      expiration_date: data.expiration_date || null,
      owner_id: profile.id,
      created_by: profile.id,
      ai_generated: false,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/documents");
  revalidatePath("/dashboard");
  return doc.id;
}

export async function createDocumentWithAiDraft(params: AiDraftParams) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  let orgName: string | undefined;
  let dealName: string | undefined;

  if (params.organization_id) {
    const { data } = await supabase.from("organizations").select("name").eq("id", params.organization_id).single();
    orgName = data?.name;
  }
  if (params.deal_id) {
    const { data } = await supabase.from("deals").select("name").eq("id", params.deal_id).single();
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

  const { data: doc, error } = await supabase
    .from("documents")
    .insert({
      title: params.title,
      document_type: params.document_type,
      status: "DRAFT",
      organization_id: params.organization_id || null,
      deal_id: params.deal_id || null,
      partnership_id: params.partnership_id || null,
      owner_id: profile.id,
      created_by: profile.id,
      ai_generated: true,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await createVersion(
    supabase,
    doc.id,
    profile.id,
    brandedContent,
    "AI-generated draft (Claude)",
    "draft.md"
  );

  revalidatePath("/documents");
  revalidatePath("/dashboard");
  return doc.id;
}

export async function updateDocument(id: string, data: DocumentFormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("documents")
    .update({
      title: data.title,
      document_type: data.document_type,
      status: data.status,
      organization_id: data.organization_id || null,
      deal_id: data.deal_id || null,
      partnership_id: data.partnership_id || null,
      effective_date: data.effective_date || null,
      expiration_date: data.expiration_date || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/documents");
  revalidatePath(`/documents/${id}`);
}

export async function addDocumentVersion(
  documentId: string,
  storageUrl: string,
  changeSummary: string
) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("document_versions")
    .select("version_number")
    .eq("document_id", documentId)
    .order("version_number", { ascending: false })
    .limit(1);

  const versionNumber = (existing?.[0]?.version_number ?? 0) + 1;

  const { data: version, error } = await supabase
    .from("document_versions")
    .insert({
      document_id: documentId,
      version_number: versionNumber,
      storage_url: storageUrl,
      change_summary: changeSummary,
      created_by_id: profile.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("documents").update({ current_version_id: version.id }).eq("id", documentId);

  revalidatePath(`/documents/${documentId}`);
}

export async function deleteDocument(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/documents");
  revalidatePath("/dashboard");
}

export async function getLinkOptions() {
  const supabase = await createClient();
  const [orgs, deals, partnerships] = await Promise.all([
    supabase.from("organizations").select("id, name").is("deleted_at", null).order("name"),
    supabase.from("deals").select("id, name").is("deleted_at", null).order("name"),
    supabase.from("partnerships").select("id, name").order("name"),
  ]);
  return {
    organizations: orgs.data ?? [],
    deals: deals.data ?? [],
    partnerships: partnerships.data ?? [],
  };
}

export async function getVersionContent(version: DocumentVersion): Promise<string | null> {
  if (!version.storage_url.startsWith("inline://")) return null;
  return version.change_summary;
}
