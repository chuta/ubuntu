"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import type {
  B2GProjectPhase,
  DiscoveryStatus,
  PhaseHistory,
  ProjectStatus,
  ResourceAsset,
  TokenizationAssetType,
  TokenizationProject,
} from "@/types/tokenization";
import { revalidatePath } from "next/cache";
import { SELECT } from "@/lib/supabase/embeds";

export type TokenizationProjectFormData = {
  name: string;
  organization_id: string;
  government_profile_id?: string;
  asset_type: TokenizationAssetType;
  current_phase?: B2GProjectPhase;
  estimated_asset_value?: number;
  tokenization_readiness_score?: number;
  opportunity_score?: number;
  jurisdiction?: string;
  status?: ProjectStatus;
  description?: string;
  deal_id?: string;
};

export async function getTokenizationProjects(filters?: {
  status?: string;
  asset_type?: string;
  phase?: string;
  search?: string;
}): Promise<TokenizationProject[]> {
  const supabase = await createClient();

  let query = supabase
    .from("tokenization_projects")
    .select(SELECT.tokenizationProject)
    .order("updated_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.asset_type) query = query.eq("asset_type", filters.asset_type);
  if (filters?.phase) query = query.eq("current_phase", filters.phase);
  if (filters?.search) query = query.ilike("name", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as TokenizationProject[];
}

export async function getTokenizationProject(id: string): Promise<TokenizationProject | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tokenization_projects")
    .select(SELECT.tokenizationProject)
    .eq("id", id)
    .single();

  if (error) return null;
  return data as TokenizationProject;
}

export async function getTokenizationProjectCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("tokenization_projects")
    .select("*", { count: "exact", head: true })
    .neq("status", "COMPLETED");

  return count ?? 0;
}

export async function getProjectsByPhase(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase.from("tokenization_projects").select("current_phase");

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.current_phase] = (counts[row.current_phase] ?? 0) + 1;
  }
  return counts;
}

async function syncDealTokenizationLink(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  newDealId: string | null,
  previousDealId: string | null
) {
  if (previousDealId && previousDealId !== newDealId) {
    await supabase
      .from("deals")
      .update({ tokenization_project_id: null })
      .eq("id", previousDealId)
      .eq("tokenization_project_id", projectId);
  }

  if (newDealId) {
    const { data: other } = await supabase
      .from("tokenization_projects")
      .select("id")
      .eq("deal_id", newDealId)
      .neq("id", projectId)
      .maybeSingle();

    if (other) {
      await supabase.from("tokenization_projects").update({ deal_id: null }).eq("id", other.id);
      await supabase.from("deals").update({ tokenization_project_id: null }).eq("id", newDealId);
    }

    await supabase
      .from("deals")
      .update({ tokenization_project_id: projectId })
      .eq("id", newDealId);
  }
}

async function logPhaseEntry(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  phase: B2GProjectPhase,
  completePrevious?: boolean
) {
  if (completePrevious) {
    const { data: open } = await supabase
      .from("project_phase_history")
      .select("id")
      .eq("tokenization_project_id", projectId)
      .is("completed_at", null)
      .order("entered_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (open) {
      await supabase
        .from("project_phase_history")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", open.id);
    }
  }

  await supabase.from("project_phase_history").insert({
    tokenization_project_id: projectId,
    phase,
  });
}

export async function createTokenizationProject(data: TokenizationProjectFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const phase = data.current_phase ?? "RESOURCE_DISCOVERY";

  const { data: project, error } = await supabase
    .from("tokenization_projects")
    .insert({
      name: data.name,
      organization_id: data.organization_id,
      government_profile_id: data.government_profile_id || null,
      asset_type: data.asset_type,
      current_phase: phase,
      estimated_asset_value: data.estimated_asset_value ?? null,
      tokenization_readiness_score: data.tokenization_readiness_score ?? null,
      opportunity_score: data.opportunity_score ?? null,
      jurisdiction: data.jurisdiction || null,
      status: data.status ?? "PROSPECT",
      description: data.description || null,
      deal_id: data.deal_id || null,
      owner_id: profile.id,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await logPhaseEntry(supabase, project.id, phase, false);

  if (data.deal_id) {
    await syncDealTokenizationLink(supabase, project.id, data.deal_id, null);
  }

  revalidatePath("/tokenization");
  revalidatePath("/dashboard");
  return project.id;
}

export async function updateTokenizationProject(id: string, data: TokenizationProjectFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const existing = await getTokenizationProject(id);
  if (!existing) throw new Error("Project not found");

  const phaseChanged = data.current_phase && data.current_phase !== existing.current_phase;

  const { error } = await supabase
    .from("tokenization_projects")
    .update({
      name: data.name,
      organization_id: data.organization_id,
      government_profile_id: data.government_profile_id || null,
      asset_type: data.asset_type,
      current_phase: data.current_phase ?? existing.current_phase,
      estimated_asset_value: data.estimated_asset_value ?? null,
      tokenization_readiness_score: data.tokenization_readiness_score ?? null,
      opportunity_score: data.opportunity_score ?? null,
      jurisdiction: data.jurisdiction || null,
      status: data.status ?? existing.status,
      description: data.description || null,
      deal_id: data.deal_id || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  if (phaseChanged && data.current_phase) {
    await logPhaseEntry(supabase, id, data.current_phase, true);
  }

  await syncDealTokenizationLink(supabase, id, data.deal_id || null, existing.deal_id);

  revalidatePath("/tokenization");
  revalidatePath(`/tokenization/${id}`);
  revalidatePath("/dashboard");
}

export async function moveProjectPhase(id: string, toPhase: B2GProjectPhase) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const existing = await getTokenizationProject(id);
  if (!existing) throw new Error("Project not found");
  if (existing.current_phase === toPhase) return;

  const { error } = await supabase
    .from("tokenization_projects")
    .update({ current_phase: toPhase })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logPhaseEntry(supabase, id, toPhase, true);

  revalidatePath("/tokenization");
  revalidatePath(`/tokenization/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteTokenizationProject(id: string) {
  const supabase = await createClient();
  const existing = await getTokenizationProject(id);

  if (existing?.deal_id) {
    await supabase
      .from("deals")
      .update({ tokenization_project_id: null })
      .eq("id", existing.deal_id);
  }

  const { error } = await supabase.from("tokenization_projects").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/tokenization");
  revalidatePath("/dashboard");
}

export async function getPhaseHistory(projectId: string): Promise<PhaseHistory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_phase_history")
    .select("*")
    .eq("tokenization_project_id", projectId)
    .order("entered_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as PhaseHistory[];
}

export type ResourceAssetFormData = {
  asset_name: string;
  asset_type: TokenizationAssetType;
  estimated_reserves?: string;
  valuation_amount?: number;
  valuation_date?: string;
  valuation_source?: string;
  location?: string;
  discovery_status?: DiscoveryStatus;
};

export async function getResourceAssets(projectId: string): Promise<ResourceAsset[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resource_assets")
    .select("*")
    .eq("tokenization_project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ResourceAsset[];
}

export async function createResourceAsset(projectId: string, data: ResourceAssetFormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("resource_assets").insert({
    tokenization_project_id: projectId,
    asset_name: data.asset_name,
    asset_type: data.asset_type,
    estimated_reserves: data.estimated_reserves || null,
    valuation_amount: data.valuation_amount ?? null,
    valuation_date: data.valuation_date || null,
    valuation_source: data.valuation_source || null,
    location: data.location || null,
    discovery_status: data.discovery_status || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/tokenization/${projectId}`);
}

export async function deleteResourceAsset(assetId: string, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("resource_assets").delete().eq("id", assetId);
  if (error) throw new Error(error.message);
  revalidatePath(`/tokenization/${projectId}`);
}

export async function getGovernmentOrganizationOptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("organization_type", "GOVERNMENT")
    .is("deleted_at", null)
    .order("name");
  return data ?? [];
}

export async function linkProjectToDeal(projectId: string, dealId: string | null) {
  const supabase = await createClient();
  const existing = await getTokenizationProject(projectId);
  if (!existing) throw new Error("Project not found");

  const { error } = await supabase
    .from("tokenization_projects")
    .update({ deal_id: dealId })
    .eq("id", projectId);

  if (error) throw new Error(error.message);

  await syncDealTokenizationLink(supabase, projectId, dealId, existing.deal_id);

  revalidatePath(`/tokenization/${projectId}`);
  revalidatePath("/pipeline");
}

export async function getTokenizationProjectByDeal(dealId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tokenization_projects")
    .select(SELECT.tokenizationProject)
    .eq("deal_id", dealId)
    .maybeSingle();

  return data as TokenizationProject | null;
}

export async function linkDealTokenization(dealId: string, projectId: string | null) {
  if (!projectId) {
    const existing = await getTokenizationProjectByDeal(dealId);
    if (existing) await linkProjectToDeal(existing.id, null);
    return;
  }
  await linkProjectToDeal(projectId, dealId);
}

export async function getTokenizationProjectOptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tokenization_projects")
    .select("id, name")
    .order("name");
  return data ?? [];
}
