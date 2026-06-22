"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import { defaultProbability, isOpenPipelineStage, weightedValue } from "@/lib/constants/deals";
import type {
  Deal,
  DealStage,
  PipelineMetrics,
  Product,
  CustomerSegment,
  RevenueEngine,
  DealSource,
  DealPriority,
  CommercialRiskType,
  CommercialRiskSeverity,
} from "@/types/pipeline";
import { validateCommercialRiskInput } from "@/lib/constants/commercial-risks";
import { revalidatePath } from "next/cache";
import { SELECT } from "@/lib/supabase/embeds";

export type DealFormData = {
  name: string;
  organization_id: string;
  segment: CustomerSegment;
  revenue_engine: RevenueEngine;
  product_id?: string;
  stage: DealStage;
  probability?: number;
  estimated_value?: number;
  expected_close_date?: string;
  source?: DealSource;
  priority?: DealPriority;
  next_step?: string;
  next_step_date?: string;
  description?: string;
  commercial_risk_flags?: CommercialRiskType[];
  commercial_risk_severity?: CommercialRiskSeverity | null;
  commercial_risk_notes?: string;
  commercial_risk_mitigation?: string;
  commercial_risk_review_date?: string;
};

export type DealFilters = {
  stage?: string;
  segment?: string;
  revenue_engine?: string;
  search?: string;
  has_risk?: string;
  risk_flag?: string;
  risk_severity?: string;
};

function buildCommercialRiskFields(
  data: Pick<
    DealFormData,
    | "commercial_risk_flags"
    | "commercial_risk_severity"
    | "commercial_risk_notes"
    | "commercial_risk_mitigation"
    | "commercial_risk_review_date"
  >,
  existing?: Deal | null
) {
  const flags = data.commercial_risk_flags ?? [];
  const validationError = validateCommercialRiskInput(
    flags,
    flags.length ? data.commercial_risk_severity : null,
    data.commercial_risk_review_date
  );
  if (validationError) throw new Error(validationError);

  const fields = {
    commercial_risk_flags: flags,
    commercial_risk_severity: flags.length ? data.commercial_risk_severity ?? null : null,
    commercial_risk_notes: flags.length ? data.commercial_risk_notes || null : null,
    commercial_risk_mitigation: flags.length ? data.commercial_risk_mitigation || null : null,
    commercial_risk_review_date: flags.length ? data.commercial_risk_review_date || null : null,
  };

  const changed =
    !existing ||
    JSON.stringify(existing.commercial_risk_flags ?? []) !== JSON.stringify(fields.commercial_risk_flags) ||
    existing.commercial_risk_severity !== fields.commercial_risk_severity ||
    existing.commercial_risk_notes !== fields.commercial_risk_notes ||
    existing.commercial_risk_mitigation !== fields.commercial_risk_mitigation ||
    existing.commercial_risk_review_date !== fields.commercial_risk_review_date;

  return { fields, changed };
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, code, name, revenue_engine")
    .eq("is_active", true)
    .order("name");
  return (data ?? []) as Product[];
}

function normalizeDeal(deal: Deal): Deal {
  return {
    ...deal,
    commercial_risk_flags: deal.commercial_risk_flags ?? [],
    commercial_risk_severity: deal.commercial_risk_severity ?? null,
    commercial_risk_notes: deal.commercial_risk_notes ?? null,
    commercial_risk_mitigation: deal.commercial_risk_mitigation ?? null,
    commercial_risk_review_date: deal.commercial_risk_review_date ?? null,
    commercial_risk_updated_at: deal.commercial_risk_updated_at ?? null,
  };
}

export async function getDeals(filters?: DealFilters): Promise<Deal[]> {
  const supabase = await createClient();

  let query = supabase
    .from("deals")
    .select(SELECT.deal)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (filters?.stage) query = query.eq("stage", filters.stage);
  if (filters?.segment) query = query.eq("segment", filters.segment);
  if (filters?.revenue_engine) query = query.eq("revenue_engine", filters.revenue_engine);
  if (filters?.search) query = query.ilike("name", `%${filters.search}%`);
  if (filters?.risk_flag) query = query.contains("commercial_risk_flags", [filters.risk_flag]);
  if (filters?.risk_severity === "HIGH_PLUS") {
    query = query.in("commercial_risk_severity", ["HIGH", "CRITICAL"]);
  } else if (filters?.risk_severity) {
    query = query.eq("commercial_risk_severity", filters.risk_severity);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let deals = (data ?? []) as Deal[];
  if (filters?.has_risk === "1") {
    deals = deals.filter((d) => (d.commercial_risk_flags?.length ?? 0) > 0);
  }

  return deals.map(normalizeDeal);
}

export async function getDeal(id: string): Promise<Deal | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select(SELECT.deal)
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return normalizeDeal(data as Deal);
}

export async function getPipelineMetrics(): Promise<PipelineMetrics> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select("stage, estimated_value, probability, created_at")
    .is("deleted_at", null);

  if (error) throw new Error(error.message);

  const deals = data ?? [];
  const openDeals = deals.filter((d) => isOpenPipelineStage(d.stage as DealStage));

  const byStage: Record<string, number> = {};
  for (const d of deals) {
    byStage[d.stage] = (byStage[d.stage] ?? 0) + 1;
  }

  const totalValue = openDeals.reduce((sum, d) => sum + (Number(d.estimated_value) || 0), 0);
  const weighted = openDeals.reduce(
    (sum, d) => sum + weightedValue({ estimated_value: Number(d.estimated_value), probability: Number(d.probability) }),
    0
  );

  const ages = openDeals.map((d) => {
    const created = new Date(d.created_at).getTime();
    return (Date.now() - created) / (1000 * 60 * 60 * 24);
  });
  const avgDealAgeDays = ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;

  return {
    totalValue,
    weightedValue: weighted,
    activeDeals: openDeals.length,
    avgDealAgeDays,
    byStage,
  };
}

async function logStageChange(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dealId: string,
  fromStage: DealStage | null,
  toStage: DealStage,
  userId: string,
  notes?: string
) {
  await supabase.from("deal_stage_history").insert({
    deal_id: dealId,
    from_stage: fromStage,
    to_stage: toStage,
    changed_by_id: userId,
    notes: notes || null,
  });
}

export async function createDeal(data: DealFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const probability = data.probability ?? defaultProbability(data.stage);
  const { fields: riskFields } = buildCommercialRiskFields(data);

  const { data: deal, error } = await supabase
    .from("deals")
    .insert({
      name: data.name,
      organization_id: data.organization_id,
      owner_id: profile.id,
      created_by: profile.id,
      segment: data.segment,
      revenue_engine: data.revenue_engine,
      product_id: data.product_id || null,
      stage: data.stage,
      probability,
      estimated_value: data.estimated_value || null,
      expected_close_date: data.expected_close_date || null,
      source: data.source || null,
      priority: data.priority || null,
      next_step: data.next_step || null,
      next_step_date: data.next_step_date || null,
      description: data.description || null,
      ...riskFields,
      commercial_risk_updated_at: riskFields.commercial_risk_flags.length
        ? new Date().toISOString()
        : null,
    })
    .select("id, stage")
    .single();

  if (error) throw new Error(error.message);

  await logStageChange(supabase, deal.id, null, deal.stage as DealStage, profile.id, "Deal created");

  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
  revalidatePath("/forecast");
  return deal.id;
}

export async function updateDeal(id: string, data: DealFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const existing = await getDeal(id);
  if (!existing) throw new Error("Deal not found");

  const stageChanged = existing.stage !== data.stage;
  const probability = data.probability ?? (stageChanged ? defaultProbability(data.stage) : existing.probability ?? defaultProbability(data.stage));
  const { fields: riskFields, changed: riskChanged } = buildCommercialRiskFields(data, existing);

  const updates: Record<string, unknown> = {
    name: data.name,
    organization_id: data.organization_id,
    segment: data.segment,
    revenue_engine: data.revenue_engine,
    product_id: data.product_id || null,
    stage: data.stage,
    probability,
    estimated_value: data.estimated_value || null,
    expected_close_date: data.expected_close_date || null,
    source: data.source || null,
    priority: data.priority || null,
    next_step: data.next_step || null,
    next_step_date: data.next_step_date || null,
    description: data.description || null,
    ...riskFields,
  };

  if (riskChanged) {
    updates.commercial_risk_updated_at = new Date().toISOString();
  }

  if (data.stage === "WON" && !existing.actual_close_date) {
    updates.actual_close_date = new Date().toISOString().slice(0, 10);
  }
  if (data.stage === "LOST" && !existing.actual_close_date) {
    updates.actual_close_date = new Date().toISOString().slice(0, 10);
  }

  const { error } = await supabase.from("deals").update(updates).eq("id", id);
  if (error) throw new Error(error.message);

  if (stageChanged) {
    await logStageChange(supabase, id, existing.stage, data.stage, profile.id);
  }

  revalidatePath("/pipeline");
  revalidatePath(`/pipeline/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/forecast");
}

export async function moveDealStage(id: string, toStage: DealStage, notes?: string) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const existing = await getDeal(id);
  if (!existing) throw new Error("Deal not found");
  if (existing.stage === toStage) return;

  const updates: Record<string, unknown> = {
    stage: toStage,
    probability: defaultProbability(toStage),
  };

  if (toStage === "WON" || toStage === "LOST") {
    updates.actual_close_date = new Date().toISOString().slice(0, 10);
  }

  const { error } = await supabase.from("deals").update(updates).eq("id", id);
  if (error) throw new Error(error.message);

  await logStageChange(supabase, id, existing.stage, toStage, profile.id, notes);

  revalidatePath("/pipeline");
  revalidatePath(`/pipeline/${id}`);
  revalidatePath("/dashboard");
}

export async function softDeleteDeal(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("deals")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
}

export async function getStageHistory(dealId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deal_stage_history")
    .select("*, changed_by:profiles(full_name)")
    .eq("deal_id", dealId)
    .order("changed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getOrganizationOptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("id, name, segment")
    .is("deleted_at", null)
    .order("name");
  return data ?? [];
}

export async function getProfileOptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("is_active", true)
    .order("full_name");
  return data ?? [];
}
