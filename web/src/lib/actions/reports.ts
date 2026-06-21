"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import { isOpenPipelineStage, weightedValue } from "@/lib/constants/deals";
import { resolveDateRange } from "@/lib/constants/reports";
import { getForecastSummary } from "@/lib/actions/forecasts";
import type { DealStage } from "@/types/pipeline";
import type { B2cCampaignMetric, ExecutiveReportData } from "@/types/reports";
import { SELECT } from "@/lib/supabase/embeds";
import { revalidatePath } from "next/cache";

export async function getExecutiveReportData(params?: {
  preset?: string;
  from?: string;
  to?: string;
}): Promise<ExecutiveReportData> {
  const supabase = await createClient();
  const profile = await getProfile();
  const period = resolveDateRange(params);

  const [
    dealsResult,
    govResult,
    partnershipsResult,
    tokenizationResult,
    eventsResult,
    leadsResult,
    b2c,
    forecast,
  ] = await Promise.all([
    supabase
      .from("deals")
      .select("id, name, stage, segment, revenue_engine, estimated_value, probability, priority, created_at, actual_close_date")
      .is("deleted_at", null),
    supabase
      .from("organizations")
      .select(SELECT.organizationGovernment)
      .eq("organization_type", "GOVERNMENT")
      .is("deleted_at", null),
    supabase.from("partnerships").select("id, status"),
    supabase.from("tokenization_projects").select("current_phase, estimated_asset_value, status"),
    supabase
      .from("events")
      .select("id, budget, actual_cost")
      .gte("start_date", period.from)
      .lte("start_date", period.to),
    supabase
      .from("event_leads")
      .select("id, follow_up_status, created_at")
      .gte("created_at", `${period.from}T00:00:00`)
      .lte("created_at", `${period.to}T23:59:59`),
    getB2cMetricsForPeriod(period.from, period.to),
    getForecastSummary(),
  ]);

  const deals = dealsResult.data ?? [];
  const openDeals = deals.filter((d) => isOpenPipelineStage(d.stage as DealStage));

  const byStage: Record<string, number> = {};
  const bySegment: Record<string, { count: number; value: number }> = {};
  const byRevenueEngine: Record<string, { count: number; value: number }> = {};

  for (const d of openDeals) {
    byStage[d.stage] = (byStage[d.stage] ?? 0) + 1;

    if (!bySegment[d.segment]) bySegment[d.segment] = { count: 0, value: 0 };
    bySegment[d.segment].count += 1;
    bySegment[d.segment].value += Number(d.estimated_value) || 0;

    if (!byRevenueEngine[d.revenue_engine]) byRevenueEngine[d.revenue_engine] = { count: 0, value: 0 };
    byRevenueEngine[d.revenue_engine].count += 1;
    byRevenueEngine[d.revenue_engine].value += Number(d.estimated_value) || 0;
  }

  const totalValue = openDeals.reduce((sum, d) => sum + (Number(d.estimated_value) || 0), 0);
  const weightedTotal = openDeals.reduce(
    (sum, d) => sum + weightedValue({ estimated_value: Number(d.estimated_value), probability: Number(d.probability) }),
    0
  );

  const priorityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const topDeals = [...openDeals]
    .sort((a, b) => {
      const pa = priorityOrder[a.priority ?? "LOW"] ?? 4;
      const pb = priorityOrder[b.priority ?? "LOW"] ?? 4;
      if (pa !== pb) return pa - pb;
      return (Number(b.estimated_value) || 0) - (Number(a.estimated_value) || 0);
    })
    .slice(0, 5)
    .map((d) => ({
      id: d.id,
      name: d.name,
      stage: d.stage,
      estimated_value: d.estimated_value != null ? Number(d.estimated_value) : null,
      priority: d.priority,
      segment: d.segment,
    }));

  const newDeals = deals.filter(
    (d) => d.created_at >= `${period.from}T00:00:00` && d.created_at <= `${period.to}T23:59:59`
  ).length;

  const wonDeals = deals.filter(
    (d) =>
      d.stage === "WON" &&
      d.actual_close_date &&
      d.actual_close_date >= period.from &&
      d.actual_close_date <= period.to
  ).length;

  const governments = govResult.data ?? [];
  const activeGovs = governments.filter((g) => g.status === "ACTIVE");
  const byTerritory: Record<string, number> = {};
  const byPriority: Record<string, number> = {};

  for (const g of activeGovs) {
    const territory = Array.isArray(g.territory) ? g.territory[0] : g.territory;
    const govProfile = Array.isArray(g.government_profile) ? g.government_profile[0] : g.government_profile;
    const tName = territory?.name ?? "Unassigned";
    byTerritory[tName] = (byTerritory[tName] ?? 0) + 1;
    const pri = govProfile?.engagement_priority ?? "MEDIUM";
    byPriority[pri] = (byPriority[pri] ?? 0) + 1;
  }

  const partnerships = partnershipsResult.data ?? [];
  const tokenization = tokenizationResult.data ?? [];
  const byPhase: Record<string, { count: number; value: number }> = {};
  let tokenizationTotalValue = 0;

  for (const p of tokenization) {
    if (p.status === "COMPLETED") continue;
    tokenizationTotalValue += Number(p.estimated_asset_value) || 0;
    if (!byPhase[p.current_phase]) byPhase[p.current_phase] = { count: 0, value: 0 };
    byPhase[p.current_phase].count += 1;
    byPhase[p.current_phase].value += Number(p.estimated_asset_value) || 0;
  }

  const events = eventsResult.data ?? [];
  const leads = leadsResult.data ?? [];

  return {
    period,
    generatedAt: new Date().toISOString(),
    generatedBy: profile?.full_name ?? "GrowthOS User",
    pipeline: {
      totalValue,
      weightedValue: weightedTotal,
      activeDeals: openDeals.length,
      byStage,
      bySegment,
      byRevenueEngine,
      topDeals,
      newDeals,
      wonDeals,
    },
    governments: {
      activeCount: activeGovs.length,
      totalCount: governments.length,
      byTerritory,
      byPriority,
    },
    partnerships: {
      activeCount: partnerships.filter((p) => p.status === "ACTIVE").length,
      totalCount: partnerships.length,
    },
    tokenization: {
      totalProjects: tokenization.filter((p) => p.status !== "COMPLETED").length,
      totalValue: tokenizationTotalValue,
      byPhase,
    },
    events: {
      count: events.length,
      leadsCaptured: leads.length,
      leadsConverted: leads.filter((l) => l.follow_up_status === "CONVERTED").length,
      totalBudget: events.reduce((s, e) => s + (Number(e.budget) || 0), 0),
      totalActualCost: events.reduce((s, e) => s + (Number(e.actual_cost) || 0), 0),
    },
    forecast: {
      pipelineTotal: forecast.pipelineTotal,
      pipelineWeighted: forecast.pipelineWeighted,
      totalForecast: forecast.totalForecast,
      totalCommit: forecast.totalCommit,
      totalBestCase: forecast.totalBestCase,
    },
    b2c,
  };
}

export async function getB2cMetricsForPeriod(from: string, to: string): Promise<B2cCampaignMetric | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("b2c_campaign_metrics")
    .select("*")
    .lte("period_start", to)
    .gte("period_end", from)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data as B2cCampaignMetric | null;
}

export type B2cMetricsFormData = {
  period_start: string;
  period_end: string;
  campaign_name?: string;
  new_users?: number;
  wallet_downloads?: number;
  gift_purchases_usd?: number;
  notes?: string;
};

export async function upsertB2cMetrics(data: B2cMetricsFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");
  if (profile.role === "EXECUTIVE") throw new Error("Executive role is read-only");

  const { error } = await supabase.from("b2c_campaign_metrics").upsert(
    {
      period_start: data.period_start,
      period_end: data.period_end,
      campaign_name: data.campaign_name ?? "B2C GIFT Adoption",
      new_users: data.new_users ?? null,
      wallet_downloads: data.wallet_downloads ?? null,
      gift_purchases_usd: data.gift_purchases_usd ?? null,
      notes: data.notes || null,
      updated_by_id: profile.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "period_start,period_end" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}
