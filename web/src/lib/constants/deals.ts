import type {
  ActivityType,
  CustomerSegment,
  DealPriority,
  DealSource,
  DealStage,
  ForecastPeriod,
  RevenueEngine,
  TaskStatus,
} from "@/types/pipeline";

export type StageMeta = {
  value: DealStage;
  label: string;
  shortLabel: string;
  defaultProbability: number;
  columnColor: string;
};

export const DEAL_STAGES: StageMeta[] = [
  { value: "LEAD", label: "Lead", shortLabel: "Lead", defaultProbability: 5, columnColor: "bg-gray-50" },
  { value: "QUALIFIED", label: "Qualified", shortLabel: "Qual", defaultProbability: 10, columnColor: "bg-slate-50" },
  { value: "DISCOVERY", label: "Discovery", shortLabel: "Disc", defaultProbability: 15, columnColor: "bg-blue-50" },
  { value: "STAKEHOLDER_MAPPING", label: "Stakeholder Mapping", shortLabel: "Stake", defaultProbability: 20, columnColor: "bg-indigo-50" },
  { value: "NDA", label: "NDA", shortLabel: "NDA", defaultProbability: 25, columnColor: "bg-violet-50" },
  { value: "PROPOSAL", label: "Proposal", shortLabel: "Prop", defaultProbability: 35, columnColor: "bg-purple-50" },
  { value: "MOU", label: "MOU", shortLabel: "MOU", defaultProbability: 45, columnColor: "bg-fuchsia-50" },
  { value: "NEGOTIATION", label: "Negotiation", shortLabel: "Neg", defaultProbability: 60, columnColor: "bg-pink-50" },
  { value: "CONTRACT", label: "Contract", shortLabel: "Ctr", defaultProbability: 75, columnColor: "bg-rose-50" },
  { value: "WON", label: "Won", shortLabel: "Won", defaultProbability: 100, columnColor: "bg-green-50" },
  { value: "IMPLEMENTATION", label: "Implementation", shortLabel: "Impl", defaultProbability: 100, columnColor: "bg-emerald-50" },
  { value: "REVENUE_REALIZATION", label: "Revenue Realization", shortLabel: "Rev", defaultProbability: 100, columnColor: "bg-teal-50" },
  { value: "EXPANSION", label: "Expansion", shortLabel: "Exp", defaultProbability: 90, columnColor: "bg-cyan-50" },
  { value: "ON_HOLD", label: "On Hold", shortLabel: "Hold", defaultProbability: 10, columnColor: "bg-amber-50" },
  { value: "LOST", label: "Lost", shortLabel: "Lost", defaultProbability: 0, columnColor: "bg-red-50" },
];

export const OPEN_PIPELINE_STAGES: DealStage[] = [
  "LEAD", "QUALIFIED", "DISCOVERY", "STAKEHOLDER_MAPPING", "NDA", "PROPOSAL",
  "MOU", "NEGOTIATION", "CONTRACT", "ON_HOLD",
];

export const CUSTOMER_SEGMENTS: { value: CustomerSegment; label: string }[] = [
  { value: "B2G", label: "B2G — Government" },
  { value: "B2B", label: "B2B — Business" },
  { value: "B2C", label: "B2C — Consumer" },
  { value: "INSTITUTIONAL", label: "Institutional" },
  { value: "ECOSYSTEM", label: "Ecosystem" },
];

export const REVENUE_ENGINES: { value: RevenueEngine; label: string }[] = [
  { value: "GIFT_ADOPTION", label: "GIFT Adoption" },
  { value: "TOKENIZATION_TaaS", label: "Tokenization (TaaS)" },
  { value: "CAPITAL_FORMATION", label: "Capital Formation" },
  { value: "STRATEGIC_PARTNERSHIP", label: "Strategic Partnership" },
  { value: "FINANCIAL_INFRASTRUCTURE", label: "Financial Infrastructure" },
];

export const DEAL_SOURCES: { value: DealSource; label: string }[] = [
  { value: "INBOUND", label: "Inbound" },
  { value: "OUTBOUND", label: "Outbound" },
  { value: "EVENT", label: "Event" },
  { value: "REFERRAL", label: "Referral" },
  { value: "PARTNER", label: "Partner" },
  { value: "GOVERNMENT", label: "Government" },
  { value: "OTHER", label: "Other" },
];

export const DEAL_PRIORITIES: { value: DealPriority; label: string }[] = [
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

export const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: "CALL", label: "Call" },
  { value: "MEETING", label: "Meeting" },
  { value: "EMAIL", label: "Email" },
  { value: "SITE_VISIT", label: "Site Visit" },
  { value: "DEMO", label: "Demo" },
  { value: "PRESENTATION", label: "Presentation" },
  { value: "OTHER", label: "Other" },
];

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const FORECAST_PERIODS: { value: ForecastPeriod; label: string }[] = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "ANNUAL", label: "Annual" },
];

export function stageLabel(stage: DealStage | string): string {
  return DEAL_STAGES.find((s) => s.value === stage)?.label ?? stage;
}

export function stageMeta(stage: DealStage): StageMeta {
  return DEAL_STAGES.find((s) => s.value === stage) ?? DEAL_STAGES[0];
}

export function defaultProbability(stage: DealStage): number {
  return stageMeta(stage).defaultProbability;
}

export function labelFor<T extends string>(
  options: { value: T; label: string }[],
  value: string | null | undefined
): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}

export function weightedValue(deal: { estimated_value: number | null; probability: number | null }): number {
  if (!deal.estimated_value) return 0;
  return deal.estimated_value * ((deal.probability ?? 0) / 100);
}

export function isOpenPipelineStage(stage: DealStage): boolean {
  return OPEN_PIPELINE_STAGES.includes(stage);
}
