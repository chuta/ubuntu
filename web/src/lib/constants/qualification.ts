import type { Deal, QualificationDimension } from "@/types/pipeline";

export type QualificationDimensionMeta = {
  key: QualificationDimension;
  label: string;
  description: string;
  // "positive" → higher is better; "cost" → higher is worse (inverted in scoring)
  direction: "positive" | "cost";
  // labels for the 1..5 scale, index 0 = score 1
  scale: [string, string, string, string, string];
};

export const QUALIFICATION_DIMENSIONS: QualificationDimensionMeta[] = [
  {
    key: "qual_mutual_value",
    label: "Mutual Value",
    description: "How much value the partnership creates for both sides",
    direction: "positive",
    scale: ["Minimal", "Limited", "Moderate", "Strong", "Exceptional"],
  },
  {
    key: "qual_technical_fit",
    label: "Technical Fit",
    description: "Alignment with our products, infrastructure and capabilities",
    direction: "positive",
    scale: ["Poor", "Weak", "Workable", "Good", "Native"],
  },
  {
    key: "qual_strategic_alignment",
    label: "Strategic Alignment",
    description: "Fit with our revenue engines and long-term strategy",
    direction: "positive",
    scale: ["Off-strategy", "Tangential", "Relevant", "Aligned", "Core"],
  },
  {
    key: "qual_legal_complexity",
    label: "Legal Complexity",
    description: "Regulatory, contractual and compliance burden (higher = harder)",
    direction: "cost",
    scale: ["Trivial", "Light", "Moderate", "Heavy", "Severe"],
  },
  {
    key: "qual_cost_to_test",
    label: "Cost to Test",
    description: "Effort and spend to validate the opportunity (higher = costlier)",
    direction: "cost",
    scale: ["Negligible", "Low", "Moderate", "High", "Prohibitive"],
  },
];

export type QualificationInput = Partial<Record<QualificationDimension, number | null>>;

// Normalize a single dimension's 1..5 value to 0..100, inverting cost dimensions
// so a higher normalized value always means "more attractive".
function normalizeDimension(meta: QualificationDimensionMeta, value: number): number {
  const v = Math.min(5, Math.max(1, value));
  const effective = meta.direction === "cost" ? 6 - v : v;
  return ((effective - 1) / 4) * 100;
}

// Composite is the average of normalized dimensions that have been scored.
// Returns null when no dimension is set yet.
export function computeQualificationScore(input: QualificationInput): number | null {
  const scored = QUALIFICATION_DIMENSIONS.map((meta) => {
    const value = input[meta.key];
    return value == null ? null : normalizeDimension(meta, value);
  }).filter((n): n is number => n != null);

  if (scored.length === 0) return null;
  const avg = scored.reduce((a, b) => a + b, 0) / scored.length;
  return Math.round(avg);
}

export function qualificationCompleteness(input: QualificationInput): number {
  return QUALIFICATION_DIMENSIONS.filter((m) => input[m.key] != null).length;
}

export function qualificationScoreVariant(score: number | null | undefined) {
  if (score == null) return "default" as const;
  if (score >= 70) return "green" as const;
  if (score >= 45) return "gold" as const;
  return "red" as const;
}

export function qualificationScoreLabel(score: number | null | undefined): string {
  if (score == null) return "Unscored";
  if (score >= 70) return "Strong";
  if (score >= 45) return "Moderate";
  return "Weak";
}

export function dealQualificationInput(deal: Pick<Deal, QualificationDimension>): QualificationInput {
  return {
    qual_mutual_value: deal.qual_mutual_value,
    qual_technical_fit: deal.qual_technical_fit,
    qual_legal_complexity: deal.qual_legal_complexity,
    qual_cost_to_test: deal.qual_cost_to_test,
    qual_strategic_alignment: deal.qual_strategic_alignment,
  };
}
