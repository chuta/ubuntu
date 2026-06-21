import type { InfluenceRelationshipType, UbuntuStance } from "@/types/influence";

export const RELATIONSHIP_TYPES: { value: InfluenceRelationshipType; label: string }[] = [
  { value: "REPORTS_TO", label: "Reports To" },
  { value: "INFLUENCES", label: "Influences" },
  { value: "MENTORS", label: "Mentors" },
  { value: "COLLEAGUE", label: "Colleague" },
  { value: "ADVISES", label: "Advises" },
  { value: "INTRODUCED_BY", label: "Introduced By" },
  { value: "OTHER", label: "Other" },
];

export const UBUNTU_STANCES: { value: UbuntuStance; label: string }[] = [
  { value: "CHAMPION", label: "Champion" },
  { value: "SUPPORTER", label: "Supporter" },
  { value: "NEUTRAL", label: "Neutral" },
  { value: "SKEPTIC", label: "Skeptic" },
  { value: "BLOCKER", label: "Blocker" },
];

export const STRENGTH_OPTIONS = [1, 2, 3, 4, 5] as const;

export function labelFor<T extends string>(
  options: { value: T; label: string }[],
  value: string | null | undefined
): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}

export function ubuntuStanceVariant(stance: string | null | undefined) {
  switch (stance) {
    case "CHAMPION":
      return "green" as const;
    case "SUPPORTER":
      return "blue" as const;
    case "SKEPTIC":
      return "gold" as const;
    case "BLOCKER":
      return "red" as const;
    default:
      return "default" as const;
  }
}

export function isRelationshipStale(lastVerified: string | null | undefined): boolean {
  if (!lastVerified) return true;
  const verified = new Date(lastVerified);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  return verified < cutoff;
}

export function strengthColor(strength: number): string {
  if (strength >= 4) return "#9035F4";
  if (strength >= 3) return "#C9932A";
  return "#9CA3AF";
}
