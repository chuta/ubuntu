/**
 * Deal workflow nudges — lightweight, rule-based "you should look at this"
 * signals computed from deal state. Mirrors the commercial-risk auto-suggestion
 * pattern (pure heuristics, no persistence) but surfaces operational hygiene
 * issues rather than commercial risk categories.
 */
import type { DealStage } from "@/types/pipeline";
import { isOpenPipelineStage } from "@/lib/constants/deals";

export type DealNudgeType = "STALLED" | "OVERDUE_REVIEW" | "OVERDUE_CLOSE";
export type DealNudgeSeverity = "warning" | "critical";

export type DealNudge = {
  type: DealNudgeType;
  label: string;
  detail: string;
  severity: DealNudgeSeverity;
};

/** A deal is "stalled" after this many days with no logged activity. */
export const STALLED_DAYS = 21;
/** Escalate a stalled deal to critical after this many silent days. */
export const STALLED_CRITICAL_DAYS = 45;

export type DealNudgeInput = {
  stage: DealStage;
  created_at: string;
  last_activity_at: string | null;
  commercial_risk_review_date: string | null;
  expected_close_date: string | null;
};

function daysBetween(fromIso: string, now: Date): number {
  return Math.floor((now.getTime() - new Date(fromIso).getTime()) / (1000 * 60 * 60 * 24));
}

/** Pure: compute the active nudges for a single deal. */
export function computeDealNudges(input: DealNudgeInput, now: Date = new Date()): DealNudge[] {
  const nudges: DealNudge[] = [];
  const open = isOpenPipelineStage(input.stage);
  const today = now.toISOString().slice(0, 10);

  if (open) {
    const lastTouch = input.last_activity_at ?? input.created_at;
    const silentDays = daysBetween(lastTouch, now);
    if (silentDays >= STALLED_DAYS) {
      nudges.push({
        type: "STALLED",
        label: "Stalled",
        detail: input.last_activity_at
          ? `No activity logged in ${silentDays} days`
          : `No activity ever logged (${silentDays} days old)`,
        severity: silentDays >= STALLED_CRITICAL_DAYS ? "critical" : "warning",
      });
    }
  }

  if (input.commercial_risk_review_date && input.commercial_risk_review_date < today) {
    nudges.push({
      type: "OVERDUE_REVIEW",
      label: "Review overdue",
      detail: `Risk review was due ${input.commercial_risk_review_date}`,
      severity: "critical",
    });
  }

  if (open && input.expected_close_date && input.expected_close_date < today) {
    nudges.push({
      type: "OVERDUE_CLOSE",
      label: "Close overdue",
      detail: `Expected close ${input.expected_close_date} has passed`,
      severity: "warning",
    });
  }

  return nudges;
}

export type DealNudgeSummary = {
  stalledDeals: number;
  overdueReviews: number;
  overdueCloses: number;
  totalDeals: number;
  topDeals: {
    id: string;
    name: string;
    stage: string;
    nudges: DealNudge[];
  }[];
};

type AggregateDealInput = DealNudgeInput & { id: string; name: string };

/** Aggregate nudges across a set of deals for the executive dashboard. */
export function aggregateDealNudges(
  deals: AggregateDealInput[],
  now: Date = new Date()
): DealNudgeSummary {
  let stalledDeals = 0;
  let overdueReviews = 0;
  let overdueCloses = 0;
  const flagged: { id: string; name: string; stage: string; nudges: DealNudge[] }[] = [];

  for (const deal of deals) {
    const nudges = computeDealNudges(deal, now);
    if (nudges.length === 0) continue;
    for (const n of nudges) {
      if (n.type === "STALLED") stalledDeals += 1;
      else if (n.type === "OVERDUE_REVIEW") overdueReviews += 1;
      else if (n.type === "OVERDUE_CLOSE") overdueCloses += 1;
    }
    flagged.push({ id: deal.id, name: deal.name, stage: deal.stage, nudges });
  }

  const rank = (d: { nudges: DealNudge[] }) => {
    const hasCritical = d.nudges.some((n) => n.severity === "critical");
    return hasCritical ? d.nudges.length + 100 : d.nudges.length;
  };
  const topDeals = flagged.sort((a, b) => rank(b) - rank(a)).slice(0, 6);

  return {
    stalledDeals,
    overdueReviews,
    overdueCloses,
    totalDeals: flagged.length,
    topDeals,
  };
}
