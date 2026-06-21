export type InfluenceRelationshipType =
  | "REPORTS_TO"
  | "INFLUENCES"
  | "MENTORS"
  | "COLLEAGUE"
  | "ADVISES"
  | "INTRODUCED_BY"
  | "OTHER";

export type UbuntuStance = "CHAMPION" | "SUPPORTER" | "NEUTRAL" | "SKEPTIC" | "BLOCKER";

export type ContactPositionHistory = {
  id: string;
  contact_id: string;
  organization_id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  notes: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  organization?: { id: string; name: string } | null;
  contact?: { id: string; first_name: string; last_name: string } | null;
};

export type InfluenceRelationship = {
  id: string;
  source_contact_id: string;
  target_contact_id: string;
  relationship_type: InfluenceRelationshipType;
  strength: number;
  relationship_to_ubuntu: UbuntuStance | null;
  notes: string | null;
  last_verified_at: string | null;
  deal_id: string | null;
  organization_id: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  source?: GraphContact | null;
  target?: GraphContact | null;
  deal?: { id: string; name: string } | null;
};

export type StakeholderMap = {
  id: string;
  deal_id: string | null;
  organization_id: string;
  contact_id: string;
  relationship_to_ubuntu: UbuntuStance | null;
  relationship_to_decision: string | null;
  reports_to_contact_id: string | null;
  engagement_score: number | null;
  created_at: string;
  updated_at: string;
  contact?: GraphContact | null;
  reports_to?: { id: string; first_name: string; last_name: string } | null;
};

export type GraphContact = {
  id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  influence_level: string | null;
  current_influence_score: number | null;
  organization_id: string;
  organization?: { id: string; name: string; territory_id: string | null } | null;
  ubuntu_stance?: UbuntuStance | null;
};

export type InfluenceGraphData = {
  nodes: GraphContact[];
  edges: InfluenceRelationship[];
  stakeholderMaps: StakeholderMap[];
};
