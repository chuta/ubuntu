"use server";

import { createClient } from "@/lib/supabase/server";
import { isOpenPipelineStage } from "@/lib/constants/deals";
import type { CommercialRiskType, DealStage } from "@/types/pipeline";

const PRE_CAPITAL_PHASES = new Set([
  "RESOURCE_DISCOVERY",
  "RESOURCE_VALUATION",
  "DIGITAL_ASSET_STRUCTURING",
]);

const PROCUREMENT_STAGES = new Set<DealStage>(["MOU", "NEGOTIATION", "CONTRACT"]);
const INSTITUTIONAL_DD_STAGES = new Set<DealStage>(["NDA", "PROPOSAL", "DISCOVERY"]);

function dealAgeDays(createdAt: string) {
  return (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
}

export async function getCommercialRiskSuggestions(dealId: string): Promise<CommercialRiskType[]> {
  const supabase = await createClient();
  const suggestions = new Set<CommercialRiskType>();

  const { data: deal } = await supabase
    .from("deals")
    .select(
      "id, segment, stage, source, revenue_engine, created_at, tokenization_project_id, partnership_id"
    )
    .eq("id", dealId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!deal) return [];

  const [
    atRiskRequirements,
    overdueConsultations,
    tokenizationProject,
    partnership,
  ] = await Promise.all([
    supabase
      .from("regulatory_requirements")
      .select("id")
      .eq("deal_id", dealId)
      .eq("compliance_status", "AT_RISK")
      .limit(1),
    supabase
      .from("regulatory_consultations")
      .select("id, response_deadline, response_status")
      .eq("deal_id", dealId),
    deal.tokenization_project_id
      ? supabase
          .from("tokenization_projects")
          .select("current_phase")
          .eq("id", deal.tokenization_project_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    deal.partnership_id
      ? supabase
          .from("partnerships")
          .select("status")
          .eq("id", deal.partnership_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  if ((atRiskRequirements.data?.length ?? 0) > 0) {
    suggestions.add("REGULATORY_DELAY");
  }

  const today = new Date().toISOString().slice(0, 10);
  for (const c of overdueConsultations.data ?? []) {
    if (
      c.response_deadline &&
      c.response_deadline < today &&
      c.response_status !== "SUBMITTED" &&
      c.response_status !== "NOT_APPLICABLE"
    ) {
      suggestions.add("REGULATORY_DELAY");
      break;
    }
  }

  const age = dealAgeDays(deal.created_at);
  if (
    deal.segment === "B2G" &&
    PROCUREMENT_STAGES.has(deal.stage as DealStage) &&
    age > 90
  ) {
    suggestions.add("PROCUREMENT_CYCLE");
  }

  if (
    (deal.segment === "B2B" || deal.segment === "INSTITUTIONAL") &&
    INSTITUTIONAL_DD_STAGES.has(deal.stage as DealStage) &&
    age > 60
  ) {
    suggestions.add("INSTITUTIONAL_DD");
  }

  if (
    tokenizationProject.data?.current_phase &&
    PRE_CAPITAL_PHASES.has(tokenizationProject.data.current_phase)
  ) {
    suggestions.add("TOKEN_LIQUIDITY");
  }

  if (deal.revenue_engine === "CAPITAL_FORMATION") {
    suggestions.add("MARKET_VOLATILITY");
  }

  if (deal.source === "PARTNER") {
    suggestions.add("COUNTERPARTY");
  }

  const weakPartnershipStatuses = new Set(["DISCUSSION", "PAUSED", "TERMINATED"]);
  if (partnership.data && weakPartnershipStatuses.has(partnership.data.status)) {
    suggestions.add("COUNTERPARTY");
  }

  return [...suggestions];
}
