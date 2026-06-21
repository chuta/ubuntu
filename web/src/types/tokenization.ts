export type TokenizationAssetType =
  | "GOLD"
  | "SILVER"
  | "LITHIUM"
  | "COPPER"
  | "RARE_EARTH"
  | "REAL_ESTATE"
  | "INFRASTRUCTURE"
  | "CARBON"
  | "COMMUNITY_DEVELOPMENT"
  | "OTHER";

export type B2GProjectPhase =
  | "RESOURCE_DISCOVERY"
  | "RESOURCE_VALUATION"
  | "DIGITAL_ASSET_STRUCTURING"
  | "CAPITAL_FORMATION"
  | "DEVELOPMENT_DEPLOYMENT";

export type ProjectStatus = "PROSPECT" | "ACTIVE" | "STRUCTURING" | "LIVE" | "PAUSED" | "COMPLETED";

export type DiscoveryStatus = "IDENTIFIED" | "MAPPED" | "ASSESSED" | "VERIFIED";

export type TokenizationProject = {
  id: string;
  name: string;
  organization_id: string;
  government_profile_id: string | null;
  asset_type: TokenizationAssetType;
  current_phase: B2GProjectPhase;
  estimated_asset_value: number | null;
  tokenization_readiness_score: number | null;
  opportunity_score: number | null;
  jurisdiction: string | null;
  status: ProjectStatus;
  owner_id: string;
  description: string | null;
  deal_id: string | null;
  created_at: string;
  updated_at: string;
  organization?: { id: string; name: string } | null;
  deal?: { id: string; name: string } | null;
};

export type ResourceAsset = {
  id: string;
  tokenization_project_id: string;
  asset_name: string;
  asset_type: TokenizationAssetType;
  estimated_reserves: string | null;
  valuation_amount: number | null;
  valuation_date: string | null;
  valuation_source: string | null;
  location: string | null;
  discovery_status: DiscoveryStatus | null;
  created_at: string;
};

export type PhaseHistory = {
  id: string;
  tokenization_project_id: string;
  phase: B2GProjectPhase;
  entered_at: string;
  completed_at: string | null;
  outcome_summary: string | null;
};
