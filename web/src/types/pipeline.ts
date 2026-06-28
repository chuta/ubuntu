export type DealStage =
  | "LEAD"
  | "QUALIFIED"
  | "DISCOVERY"
  | "STAKEHOLDER_MAPPING"
  | "NDA"
  | "PROPOSAL"
  | "MOU"
  | "NEGOTIATION"
  | "CONTRACT"
  | "WON"
  | "IMPLEMENTATION"
  | "REVENUE_REALIZATION"
  | "EXPANSION"
  | "LOST"
  | "ON_HOLD";

export type CustomerSegment = "B2G" | "B2B" | "B2C" | "INSTITUTIONAL" | "ECOSYSTEM";

export type RevenueEngine =
  | "GIFT_ADOPTION"
  | "TOKENIZATION_TaaS"
  | "CAPITAL_FORMATION"
  | "STRATEGIC_PARTNERSHIP"
  | "FINANCIAL_INFRASTRUCTURE";

export type DealSource =
  | "INBOUND"
  | "OUTBOUND"
  | "EVENT"
  | "REFERRAL"
  | "PARTNER"
  | "GOVERNMENT"
  | "OTHER";

export type DealPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type CommercialRiskType =
  | "REGULATORY_DELAY"
  | "PROCUREMENT_CYCLE"
  | "INSTITUTIONAL_DD"
  | "TOKEN_LIQUIDITY"
  | "MARKET_VOLATILITY"
  | "COUNTERPARTY";

export type CommercialRiskSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ActivityType =
  | "CALL"
  | "MEETING"
  | "EMAIL"
  | "SITE_VISIT"
  | "DEMO"
  | "PRESENTATION"
  | "OTHER";

export type TaskStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type ForecastPeriod = "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUAL";

export type Product = {
  id: string;
  code: string;
  name: string;
  revenue_engine: RevenueEngine;
};

export type DealOrganization = {
  id: string;
  name: string;
  segment: CustomerSegment;
  territory_id: string | null;
  territory?: { id: string; name: string } | null;
};

export type Deal = {
  id: string;
  name: string;
  organization_id: string;
  owner_id: string;
  segment: CustomerSegment;
  revenue_engine: RevenueEngine;
  product_id: string | null;
  stage: DealStage;
  probability: number | null;
  estimated_value: number | null;
  currency: string;
  expected_close_date: string | null;
  actual_close_date: string | null;
  source: DealSource | null;
  priority: DealPriority | null;
  loss_reason: string | null;
  next_step: string | null;
  next_step_date: string | null;
  description: string | null;
  commercial_risk_flags: CommercialRiskType[];
  commercial_risk_severity: CommercialRiskSeverity | null;
  commercial_risk_notes: string | null;
  commercial_risk_mitigation: string | null;
  commercial_risk_review_date: string | null;
  commercial_risk_updated_at: string | null;
  qual_mutual_value: number | null;
  qual_technical_fit: number | null;
  qual_legal_complexity: number | null;
  qual_cost_to_test: number | null;
  qual_strategic_alignment: number | null;
  qual_success_criteria: string | null;
  qual_score: number | null;
  qual_updated_at: string | null;
  created_at: string;
  updated_at: string;
  organization?: DealOrganization | null;
  product?: Product | null;
};

export type QualificationDimension =
  | "qual_mutual_value"
  | "qual_technical_fit"
  | "qual_legal_complexity"
  | "qual_cost_to_test"
  | "qual_strategic_alignment";

export type DealStageHistory = {
  id: string;
  deal_id: string;
  from_stage: DealStage | null;
  to_stage: DealStage;
  changed_by_id: string;
  changed_at: string;
  notes: string | null;
  changed_by?: { full_name: string } | null;
};

export type Activity = {
  id: string;
  activity_type: ActivityType;
  subject: string;
  description: string | null;
  occurred_at: string;
  duration_minutes: number | null;
  outcome: string | null;
  deal_id: string | null;
  partnership_id: string | null;
  logged_by_id: string;
  logged_by?: { full_name: string } | null;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  assignee_id: string;
  due_date: string | null;
  status: TaskStatus;
  priority: DealPriority | null;
  deal_id: string | null;
  partnership_id: string | null;
  assignee?: { full_name: string } | null;
};

export type Note = {
  id: string;
  body: string;
  author_id: string;
  is_pinned: boolean;
  created_at: string;
  author?: { full_name: string } | null;
};

export type Forecast = {
  id: string;
  period_type: ForecastPeriod;
  period_start: string;
  period_end: string;
  segment: CustomerSegment | null;
  revenue_engine: RevenueEngine | null;
  forecast_amount: number;
  commit_amount: number | null;
  best_case_amount: number | null;
  submitted_by_id: string;
  submitted_at: string;
  notes: string | null;
  submitted_by?: { full_name: string } | null;
};

export type PipelineMetrics = {
  totalValue: number;
  weightedValue: number;
  activeDeals: number;
  avgDealAgeDays: number;
  byStage: Record<string, number>;
};

export type ProfileOption = {
  id: string;
  full_name: string;
};
