import type { B2GProjectPhase, DiscoveryStatus, ProjectStatus, TokenizationAssetType } from "@/types/tokenization";

export type PhaseMeta = {
  value: B2GProjectPhase;
  label: string;
  shortLabel: string;
  columnColor: string;
};

export const B2G_PHASES: PhaseMeta[] = [
  { value: "RESOURCE_DISCOVERY", label: "Resource Discovery", shortLabel: "Discovery", columnColor: "bg-slate-50" },
  { value: "RESOURCE_VALUATION", label: "Resource Valuation", shortLabel: "Valuation", columnColor: "bg-blue-50" },
  { value: "DIGITAL_ASSET_STRUCTURING", label: "Digital Asset Structuring", shortLabel: "Structuring", columnColor: "bg-purple-50" },
  { value: "CAPITAL_FORMATION", label: "Capital Formation", shortLabel: "Capital", columnColor: "bg-amber-50" },
  { value: "DEVELOPMENT_DEPLOYMENT", label: "Development & Deployment", shortLabel: "Deploy", columnColor: "bg-green-50" },
];

export const ASSET_TYPES: { value: TokenizationAssetType; label: string }[] = [
  { value: "GOLD", label: "Gold" },
  { value: "SILVER", label: "Silver" },
  { value: "LITHIUM", label: "Lithium" },
  { value: "COPPER", label: "Copper" },
  { value: "RARE_EARTH", label: "Rare Earth" },
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "INFRASTRUCTURE", label: "Infrastructure" },
  { value: "CARBON", label: "Carbon" },
  { value: "COMMUNITY_DEVELOPMENT", label: "Community Development" },
  { value: "OTHER", label: "Other" },
];

export const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "PROSPECT", label: "Prospect" },
  { value: "ACTIVE", label: "Active" },
  { value: "STRUCTURING", label: "Structuring" },
  { value: "LIVE", label: "Live" },
  { value: "PAUSED", label: "Paused" },
  { value: "COMPLETED", label: "Completed" },
];

export const DISCOVERY_STATUSES: { value: DiscoveryStatus; label: string }[] = [
  { value: "IDENTIFIED", label: "Identified" },
  { value: "MAPPED", label: "Mapped" },
  { value: "ASSESSED", label: "Assessed" },
  { value: "VERIFIED", label: "Verified" },
];

export function phaseLabel(phase: B2GProjectPhase | string): string {
  return B2G_PHASES.find((p) => p.value === phase)?.label ?? phase;
}

export function projectStatusVariant(status: ProjectStatus) {
  switch (status) {
    case "LIVE": return "green" as const;
    case "ACTIVE":
    case "STRUCTURING": return "purple" as const;
    case "COMPLETED": return "gold" as const;
    case "PAUSED": return "default" as const;
    default: return "blue" as const;
  }
}

export function labelFor<T extends string>(
  options: { value: T; label: string }[],
  value: string | null | undefined
): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}
