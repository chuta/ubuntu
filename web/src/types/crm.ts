export type OrganizationStatus = "PROSPECT" | "ACTIVE" | "DORMANT" | "CHURNED";
export type OrganizationTier = "STRATEGIC" | "TIER_1" | "TIER_2" | "TIER_3";
export type EngagementPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type GovernmentLevel =
  | "NATIONAL"
  | "STATE"
  | "REGIONAL"
  | "LOCAL"
  | "SOVEREIGN_INSTITUTION"
  | "TRADITIONAL_KINGDOM";

export type GovernmentSubtype =
  | "MINISTRY"
  | "AGENCY"
  | "REGULATORY_BODY"
  | "DEVELOPMENT_AUTHORITY"
  | "SOVEREIGN_WEALTH_FUND";

export type AccountSubtype =
  | "BANK"
  | "FINTECH"
  | "PSP"
  | "EXCHANGE"
  | "OTC_DESK"
  | "MINING"
  | "COMMODITY_TRADER"
  | "FAMILY_OFFICE"
  | "ASSET_MANAGER"
  | "CORPORATE_TREASURY"
  | "OTHER";

export type ContactRole =
  | "DECISION_MAKER"
  | "INFLUENCER"
  | "CHAMPION"
  | "GATEKEEPER"
  | "LEGAL"
  | "TECHNICAL"
  | "OTHER";

export type InfluenceLevel = "HIGH" | "MEDIUM" | "LOW";

export type TreasuryInterest = "NONE" | "EXPLORING" | "ACTIVE" | "COMMITTED";
export type GiftAdoptionStatus = "NONE" | "EVALUATING" | "PILOT" | "LIVE";
export type WalletIntegrationStatus = "NONE" | "IN_PROGRESS" | "LIVE";

export type Territory = {
  id: string;
  name: string;
  region: string | null;
  country_code: string | null;
};

export type GovernmentProfile = {
  id: string;
  organization_id: string;
  government_level: GovernmentLevel;
  entity_subtype: GovernmentSubtype | null;
  jurisdiction: string | null;
  parent_government_id: string | null;
  resource_endowment: string | null;
  engagement_priority: EngagementPriority | null;
  regulatory_environment_notes: string | null;
};

export type AccountProfile = {
  id: string;
  organization_id: string;
  account_subtype: AccountSubtype;
  aum_range: string | null;
  treasury_interest_level: TreasuryInterest | null;
  gift_adoption_status: GiftAdoptionStatus | null;
  wallet_integration_status: WalletIntegrationStatus | null;
  annual_revenue_potential: number | null;
  decision_cycle_months: number | null;
};

export type Organization = {
  id: string;
  name: string;
  legal_name: string | null;
  organization_type: string;
  segment: string;
  website: string | null;
  headquarters_country: string | null;
  headquarters_city: string | null;
  territory_id: string | null;
  owner_id: string;
  status: OrganizationStatus;
  tier: OrganizationTier | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  territory?: Territory | null;
  government_profile?: GovernmentProfile | null;
  account_profile?: AccountProfile | null;
};

export type Contact = {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  department: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  contact_role: ContactRole | null;
  influence_level: InfluenceLevel | null;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
  current_influence_score: number | null;
};

export type OrganizationListItem = Organization & {
  contact_count?: number;
};
