import type {
  AccountSubtype,
  EngagementPriority,
  GiftAdoptionStatus,
  GovernmentLevel,
  GovernmentSubtype,
  InfluenceLevel,
  ContactRole,
  OrganizationStatus,
  OrganizationTier,
  TreasuryInterest,
  WalletIntegrationStatus,
} from "@/types/crm";

export const ORGANIZATION_STATUSES: { value: OrganizationStatus; label: string }[] = [
  { value: "PROSPECT", label: "Prospect" },
  { value: "ACTIVE", label: "Active" },
  { value: "DORMANT", label: "Dormant" },
  { value: "CHURNED", label: "Churned" },
];

export const ORGANIZATION_TIERS: { value: OrganizationTier; label: string }[] = [
  { value: "STRATEGIC", label: "Strategic" },
  { value: "TIER_1", label: "Tier 1" },
  { value: "TIER_2", label: "Tier 2" },
  { value: "TIER_3", label: "Tier 3" },
];

export const GOVERNMENT_LEVELS: { value: GovernmentLevel; label: string }[] = [
  { value: "NATIONAL", label: "National" },
  { value: "STATE", label: "State" },
  { value: "REGIONAL", label: "Regional" },
  { value: "LOCAL", label: "Local" },
  { value: "SOVEREIGN_INSTITUTION", label: "Sovereign Institution" },
  { value: "TRADITIONAL_KINGDOM", label: "Traditional Kingdom" },
];

export const GOVERNMENT_SUBTYPES: { value: GovernmentSubtype; label: string }[] = [
  { value: "MINISTRY", label: "Ministry" },
  { value: "AGENCY", label: "Agency" },
  { value: "REGULATORY_BODY", label: "Regulatory Body" },
  { value: "DEVELOPMENT_AUTHORITY", label: "Development Authority" },
  { value: "SOVEREIGN_WEALTH_FUND", label: "Sovereign Wealth Fund" },
];

export const ENGAGEMENT_PRIORITIES: { value: EngagementPriority; label: string }[] = [
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

export const ACCOUNT_SUBTYPES: { value: AccountSubtype; label: string }[] = [
  { value: "BANK", label: "Bank" },
  { value: "FINTECH", label: "Fintech" },
  { value: "PSP", label: "Payment Service Provider" },
  { value: "EXCHANGE", label: "Exchange" },
  { value: "OTC_DESK", label: "OTC Desk" },
  { value: "MINING", label: "Mining Company" },
  { value: "COMMODITY_TRADER", label: "Commodity Trader" },
  { value: "FAMILY_OFFICE", label: "Family Office" },
  { value: "ASSET_MANAGER", label: "Asset Manager" },
  { value: "CORPORATE_TREASURY", label: "Corporate Treasury" },
  { value: "OTHER", label: "Other" },
];

export const TREASURY_INTEREST: { value: TreasuryInterest; label: string }[] = [
  { value: "NONE", label: "None" },
  { value: "EXPLORING", label: "Exploring" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMMITTED", label: "Committed" },
];

export const GIFT_ADOPTION: { value: GiftAdoptionStatus; label: string }[] = [
  { value: "NONE", label: "None" },
  { value: "EVALUATING", label: "Evaluating" },
  { value: "PILOT", label: "Pilot" },
  { value: "LIVE", label: "Live" },
];

export const WALLET_INTEGRATION: { value: WalletIntegrationStatus; label: string }[] = [
  { value: "NONE", label: "None" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "LIVE", label: "Live" },
];

export const CONTACT_ROLES: { value: ContactRole; label: string }[] = [
  { value: "DECISION_MAKER", label: "Decision Maker" },
  { value: "INFLUENCER", label: "Influencer" },
  { value: "CHAMPION", label: "Champion" },
  { value: "GATEKEEPER", label: "Gatekeeper" },
  { value: "LEGAL", label: "Legal" },
  { value: "TECHNICAL", label: "Technical" },
  { value: "OTHER", label: "Other" },
];

export const INFLUENCE_LEVELS: { value: InfluenceLevel; label: string }[] = [
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

export function labelFor<T extends string>(
  options: { value: T; label: string }[],
  value: string | null | undefined
): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}
