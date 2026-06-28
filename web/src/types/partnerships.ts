import type { DealStage } from "@/types/pipeline";

export type PartnershipType =
  | "DISTRIBUTION"
  | "STRATEGIC_ALLIANCE"
  | "JOINT_VENTURE"
  | "TECHNOLOGY"
  | "LISTING"
  | "CUSTODY"
  | "REVENUE_SHARE"
  | "REFERRAL"
  | "OTHER";

export type PartnershipStatus = "DISCUSSION" | "MOU" | "ACTIVE" | "PAUSED" | "TERMINATED";

export type PartnershipPartner = {
  id: string;
  name: string;
  organization_type: string;
};

export type PartnershipDeal = {
  id: string;
  name: string;
  stage: DealStage;
  estimated_value: number | null;
};

export type Partnership = {
  id: string;
  name: string;
  partnership_type: PartnershipType;
  status: PartnershipStatus;
  primary_partner_id: string;
  owner_id: string;
  start_date: string | null;
  end_date: string | null;
  revenue_share_terms: string | null;
  strategic_objectives: string | null;
  deal_id: string | null;
  created_at: string;
  updated_at: string;
  primary_partner?: PartnershipPartner | null;
  deal?: PartnershipDeal | null;
};

export type PartnershipMember = {
  id: string;
  partnership_id: string;
  organization_id: string;
  role_in_partnership: string | null;
  created_at: string;
  organization?: PartnershipPartner | null;
};

export type MilestoneStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "BLOCKED"
  | "CANCELLED";

export type PartnershipMilestone = {
  id: string;
  partnership_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: MilestoneStatus;
  assignee_id: string | null;
  sort_order: number;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  assignee?: { full_name: string } | null;
};
