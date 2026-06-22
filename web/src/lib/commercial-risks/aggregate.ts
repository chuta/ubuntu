import { isOpenPipelineStage } from "@/lib/constants/deals";
import type { CommercialRiskType, DealStage } from "@/types/pipeline";

export function aggregateCommercialRisks(
  deals: Array<{
    id: string;
    name: string;
    stage: string;
    estimated_value: number | null;
    commercial_risk_flags: CommercialRiskType[] | null;
    commercial_risk_severity: string | null;
    commercial_risk_review_date: string | null;
  }>
) {
  const openDeals = deals.filter((d) => isOpenPipelineStage(d.stage as DealStage));
  const flagged = openDeals.filter((d) => (d.commercial_risk_flags?.length ?? 0) > 0);

  const byCategory: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  const today = new Date().toISOString().slice(0, 10);

  for (const deal of flagged) {
    for (const flag of deal.commercial_risk_flags ?? []) {
      byCategory[flag] = (byCategory[flag] ?? 0) + 1;
    }
    if (deal.commercial_risk_severity) {
      bySeverity[deal.commercial_risk_severity] =
        (bySeverity[deal.commercial_risk_severity] ?? 0) + 1;
    }
  }

  const overdueReviews = flagged.filter(
    (d) => d.commercial_risk_review_date && d.commercial_risk_review_date < today
  ).length;

  const criticalCount = flagged.filter((d) => d.commercial_risk_severity === "CRITICAL").length;

  const severityOrder: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };

  const topAtRiskDeals = [...flagged]
    .sort((a, b) => {
      const sa = severityOrder[a.commercial_risk_severity ?? "LOW"] ?? 4;
      const sb = severityOrder[b.commercial_risk_severity ?? "LOW"] ?? 4;
      if (sa !== sb) return sa - sb;
      return (Number(b.estimated_value) || 0) - (Number(a.estimated_value) || 0);
    })
    .slice(0, 5)
    .map((d) => ({
      id: d.id,
      name: d.name,
      stage: d.stage,
      estimated_value: d.estimated_value != null ? Number(d.estimated_value) : null,
      flags: d.commercial_risk_flags ?? [],
      severity: d.commercial_risk_severity,
      review_date: d.commercial_risk_review_date,
    }));

  return {
    flaggedDeals: flagged.length,
    byCategory,
    bySeverity,
    overdueReviews,
    criticalCount,
    topAtRiskDeals,
  };
}
