import type { CommercialRiskSeverity, CommercialRiskType, Deal } from "@/types/pipeline";

export const COMMERCIAL_RISK_TYPES: {
  value: CommercialRiskType;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    value: "REGULATORY_DELAY",
    label: "Regulatory Delays",
    shortLabel: "Regulatory",
    description: "Licensing, filings, or consultations slipping",
  },
  {
    value: "PROCUREMENT_CYCLE",
    label: "Government Procurement Cycles",
    shortLabel: "Procurement",
    description: "Extended B2G buying or contract timelines",
  },
  {
    value: "INSTITUTIONAL_DD",
    label: "Institutional Due Diligence",
    shortLabel: "Inst. DD",
    description: "KYC, legal, or financial diligence extending pre-close",
  },
  {
    value: "TOKEN_LIQUIDITY",
    label: "Token Liquidity Constraints",
    shortLabel: "Liquidity",
    description: "Listing, market depth, or redemption friction",
  },
  {
    value: "MARKET_VOLATILITY",
    label: "Capital Market Volatility",
    shortLabel: "Volatility",
    description: "Macro or market conditions affecting close timing",
  },
  {
    value: "COUNTERPARTY",
    label: "Counterparty Risk",
    shortLabel: "Counterparty",
    description: "Partner or counterparty reliability and exposure",
  },
];

export const COMMERCIAL_RISK_SEVERITIES: { value: CommercialRiskSeverity; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

export function commercialRiskLabel(value: CommercialRiskType) {
  return COMMERCIAL_RISK_TYPES.find((r) => r.value === value)?.label ?? value;
}

export function commercialRiskShortLabel(value: CommercialRiskType) {
  return COMMERCIAL_RISK_TYPES.find((r) => r.value === value)?.shortLabel ?? value;
}

export function labelForCommercialRisk<T extends string>(
  options: { value: T; label: string }[],
  value: string | null | undefined
) {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}

export function commercialRiskSeverityVariant(severity: CommercialRiskSeverity | null | undefined) {
  switch (severity) {
    case "CRITICAL":
      return "red" as const;
    case "HIGH":
      return "gold" as const;
    case "MEDIUM":
      return "blue" as const;
    case "LOW":
      return "default" as const;
    default:
      return "default" as const;
  }
}

export function dealHasCommercialRisk(deal: Pick<Deal, "commercial_risk_flags">) {
  return (deal.commercial_risk_flags?.length ?? 0) > 0;
}

export function isDealAtRisk(deal: Pick<Deal, "commercial_risk_flags" | "commercial_risk_severity">) {
  return (
    dealHasCommercialRisk(deal) &&
    (deal.commercial_risk_severity === "HIGH" || deal.commercial_risk_severity === "CRITICAL")
  );
}

export function isCommercialRiskReviewOverdue(reviewDate: string | null | undefined) {
  if (!reviewDate) return false;
  const today = new Date().toISOString().slice(0, 10);
  return reviewDate < today;
}

export function validateCommercialRiskInput(
  flags: CommercialRiskType[],
  severity: CommercialRiskSeverity | null | undefined,
  reviewDate: string | null | undefined
): string | null {
  if (flags.length === 0) return null;
  if (!severity) return "Select overall severity when commercial risks are flagged.";
  if ((severity === "HIGH" || severity === "CRITICAL") && !reviewDate) {
    return "Review date is required for High or Critical commercial risk.";
  }
  return null;
}
