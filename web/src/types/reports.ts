export type DateRangePreset = "week" | "month" | "quarter" | "custom";

export type ReportDateRange = {
  preset: DateRangePreset;
  from: string;
  to: string;
  label: string;
};

export type ExecutiveReportData = {
  period: ReportDateRange;
  generatedAt: string;
  generatedBy: string;
  pipeline: {
    totalValue: number;
    weightedValue: number;
    activeDeals: number;
    byStage: Record<string, number>;
    bySegment: Record<string, { count: number; value: number }>;
    byRevenueEngine: Record<string, { count: number; value: number }>;
    topDeals: {
      id: string;
      name: string;
      stage: string;
      estimated_value: number | null;
      priority: string | null;
      segment: string;
    }[];
    newDeals: number;
    wonDeals: number;
  };
  governments: {
    activeCount: number;
    totalCount: number;
    byTerritory: Record<string, number>;
    byPriority: Record<string, number>;
  };
  partnerships: { activeCount: number; totalCount: number };
  tokenization: {
    totalProjects: number;
    totalValue: number;
    byPhase: Record<string, { count: number; value: number }>;
  };
  events: {
    count: number;
    leadsCaptured: number;
    leadsConverted: number;
    totalBudget: number;
    totalActualCost: number;
  };
  forecast: {
    pipelineTotal: number;
    pipelineWeighted: number;
    totalForecast: number;
    totalCommit: number;
    totalBestCase: number;
  };
  b2c: B2cCampaignMetric | null;
  commercialRisks: {
    flaggedDeals: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    overdueReviews: number;
    criticalCount: number;
    topAtRiskDeals: {
      id: string;
      name: string;
      stage: string;
      estimated_value: number | null;
      flags: string[];
      severity: string | null;
      review_date: string | null;
    }[];
  };
};

export type B2cCampaignMetric = {
  id: string;
  period_start: string;
  period_end: string;
  campaign_name: string;
  new_users: number | null;
  wallet_downloads: number | null;
  gift_purchases_usd: number | null;
  notes: string | null;
};
