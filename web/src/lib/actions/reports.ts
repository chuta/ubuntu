"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import { isOpenPipelineStage, weightedValue } from "@/lib/constants/deals";
import { resolveDateRange } from "@/lib/constants/reports";
import { getForecastSummary } from "@/lib/actions/forecasts";
import { aggregateCommercialRisks } from "@/lib/commercial-risks/aggregate";
import { aggregatePartnershipOperations } from "@/lib/partnerships/aggregate";
import { aggregateDealNudges } from "@/lib/deal-nudges";
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
    milestonesResult,
    partnershipTasksResult,
    partnershipDocsResult,
    tokenizationResult,
    eventsResult,
    leadsResult,
    regMeetingsResult,
    regConsultationsResult,
    regRequirementsResult,
    stakeholderMapsResult,
    influenceRelationshipsResult,
    dealActivitiesResult,
    b2c,
    forecast,
  ] = await Promise.all([
    supabase
      .from("deals")
      .select(
        "id, name, stage, segment, revenue_engine, estimated_value, probability, priority, created_at, expected_close_date, actual_close_date, commercial_risk_flags, commercial_risk_severity, commercial_risk_review_date"
      )
      .is("deleted_at", null),
    supabase
      .from("organizations")
      .select(SELECT.organizationGovernment)
      .eq("organization_type", "GOVERNMENT")
      .is("deleted_at", null),
    supabase
      .from("partnerships")
      .select("id, name, status, partnership_type, end_date"),
    supabase
      .from("partnership_milestones")
      .select(
        "id, title, status, due_date, partnership_id, partnership:partnerships!partnership_milestones_partnership_id_fkey(id, name)"
      ),
    supabase
      .from("tasks")
      .select("id, title, status, due_date, partnership_id")
      .not("partnership_id", "is", null),
    supabase
      .from("documents")
      .select("id, status, partnership_id")
      .not("partnership_id", "is", null),
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
    supabase
      .from("regulatory_meetings")
      .select("id, status, territory:territories(name)"),
    supabase
      .from("regulatory_consultations")
      .select("id, response_status, response_deadline, territory:territories(name)"),
    supabase
      .from("regulatory_requirements")
      .select("id, compliance_status, due_date, territory:territories(name)"),
    supabase.from("stakeholder_maps").select("deal_id").not("deal_id", "is", null),
    supabase.from("influence_relationships").select("deal_id").not("deal_id", "is", null),
    supabase
      .from("activities")
      .select("deal_id, occurred_at")
      .not("deal_id", "is", null)
      .order("occurred_at", { ascending: false }),
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
  const partnershipOperations = aggregatePartnershipOperations({
    partnerships,
    milestones: milestonesResult.data ?? [],
    tasks: partnershipTasksResult.data ?? [],
    documents: partnershipDocsResult.data ?? [],
  });
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
  const commercialRisks = aggregateCommercialRisks(
    deals.map((d) => ({
      id: d.id,
      name: d.name,
      stage: d.stage,
      estimated_value: d.estimated_value != null ? Number(d.estimated_value) : null,
      commercial_risk_flags: d.commercial_risk_flags ?? [],
      commercial_risk_severity: d.commercial_risk_severity ?? null,
      commercial_risk_review_date: d.commercial_risk_review_date ?? null,
    }))
  );

  const todayStr = new Date().toISOString().slice(0, 10);
  const territoryName = (row: { territory?: unknown }): string => {
    const t = Array.isArray(row.territory) ? row.territory[0] : row.territory;
    return (t as { name?: string } | null)?.name ?? "Unassigned";
  };

  const regMeetings = (regMeetingsResult.data ?? []) as { status: string; territory?: unknown }[];
  const regConsultations = (regConsultationsResult.data ?? []) as {
    response_status: string;
    response_deadline: string | null;
    territory?: unknown;
  }[];
  const regRequirements = (regRequirementsResult.data ?? []) as {
    compliance_status: string;
    due_date: string | null;
    territory?: unknown;
  }[];

  const isOpenMeeting = (m: { status: string }) => m.status === "SCHEDULED";
  const isPendingConsultation = (c: { response_status: string }) =>
    c.response_status === "NOT_STARTED" || c.response_status === "IN_PROGRESS";
  const isAtRiskRequirement = (r: { compliance_status: string; due_date: string | null }) =>
    r.compliance_status === "AT_RISK" ||
    (!!r.due_date &&
      r.due_date < todayStr &&
      r.compliance_status !== "MET" &&
      r.compliance_status !== "NOT_APPLICABLE");

  const regByTerritory: Record<
    string,
    { meetings: number; consultations: number; requirements: number }
  > = {};
  const bumpTerritory = (name: string, key: "meetings" | "consultations" | "requirements") => {
    if (!regByTerritory[name]) regByTerritory[name] = { meetings: 0, consultations: 0, requirements: 0 };
    regByTerritory[name][key] += 1;
  };
  for (const m of regMeetings) if (isOpenMeeting(m)) bumpTerritory(territoryName(m), "meetings");
  for (const c of regConsultations) if (isPendingConsultation(c)) bumpTerritory(territoryName(c), "consultations");
  for (const r of regRequirements) if (isAtRiskRequirement(r)) bumpTerritory(territoryName(r), "requirements");

  const regulatory = {
    openMeetings: regMeetings.filter(isOpenMeeting).length,
    pendingConsultations: regConsultations.filter(isPendingConsultation).length,
    overdueConsultations: regConsultations.filter(
      (c) => isPendingConsultation(c) && !!c.response_deadline && c.response_deadline < todayStr
    ).length,
    atRiskRequirements: regRequirements.filter(isAtRiskRequirement).length,
    byTerritory: Object.entries(regByTerritory)
      .map(([territory, v]) => ({ territory, ...v }))
      .sort(
        (a, b) =>
          b.meetings + b.consultations + b.requirements -
          (a.meetings + a.consultations + a.requirements)
      ),
  };

  const mappedDealIds = new Set<string>();
  for (const m of (stakeholderMapsResult.data ?? []) as { deal_id: string | null }[]) {
    if (m.deal_id) mappedDealIds.add(m.deal_id);
  }
  for (const r of (influenceRelationshipsResult.data ?? []) as { deal_id: string | null }[]) {
    if (r.deal_id) mappedDealIds.add(r.deal_id);
  }
  const lastActivityByDeal: Record<string, string> = {};
  for (const a of (dealActivitiesResult.data ?? []) as {
    deal_id: string | null;
    occurred_at: string;
  }[]) {
    if (a.deal_id && !lastActivityByDeal[a.deal_id]) {
      lastActivityByDeal[a.deal_id] = a.occurred_at;
    }
  }
  const nudges = aggregateDealNudges(
    openDeals.map((d) => ({
      id: d.id,
      name: d.name,
      stage: d.stage as DealStage,
      created_at: d.created_at,
      last_activity_at: lastActivityByDeal[d.id] ?? null,
      commercial_risk_review_date: d.commercial_risk_review_date ?? null,
      expected_close_date: (d as { expected_close_date?: string | null }).expected_close_date ?? null,
    }))
  );

  const activeB2GDeals = openDeals.filter((d) => d.segment === "B2G");
  const mappedB2GDeals = activeB2GDeals.filter((d) => mappedDealIds.has(d.id));
  const influenceCoverage = {
    totalB2GDeals: activeB2GDeals.length,
    mappedB2GDeals: mappedB2GDeals.length,
    coveragePct: activeB2GDeals.length
      ? Math.round((mappedB2GDeals.length / activeB2GDeals.length) * 100)
      : 0,
    unmappedDeals: activeB2GDeals
      .filter((d) => !mappedDealIds.has(d.id))
      .slice(0, 5)
      .map((d) => ({ id: d.id, name: d.name, stage: d.stage })),
  };

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
    partnerships: partnershipOperations,
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
    regulatory,
    influenceCoverage,
    nudges,
    commercialRisks,
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
