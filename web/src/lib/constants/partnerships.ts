import type { MilestoneStatus, PartnershipStatus, PartnershipType } from "@/types/partnerships";

export const PARTNERSHIP_TYPES: { value: PartnershipType; label: string }[] = [
  { value: "DISTRIBUTION", label: "Distribution" },
  { value: "STRATEGIC_ALLIANCE", label: "Strategic Alliance" },
  { value: "JOINT_VENTURE", label: "Joint Venture" },
  { value: "TECHNOLOGY", label: "Technology" },
  { value: "LISTING", label: "Listing" },
  { value: "CUSTODY", label: "Custody" },
  { value: "REVENUE_SHARE", label: "Revenue Share" },
  { value: "REFERRAL", label: "Referral" },
  { value: "OTHER", label: "Other" },
];

export const PARTNERSHIP_STATUSES: { value: PartnershipStatus; label: string }[] = [
  { value: "DISCUSSION", label: "Discussion" },
  { value: "MOU", label: "MOU" },
  { value: "ACTIVE", label: "Active" },
  { value: "PAUSED", label: "Paused" },
  { value: "TERMINATED", label: "Terminated" },
];

export const MILESTONE_STATUSES: { value: MilestoneStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function milestoneStatusVariant(status: MilestoneStatus) {
  switch (status) {
    case "COMPLETED":
      return "green" as const;
    case "IN_PROGRESS":
      return "purple" as const;
    case "BLOCKED":
      return "red" as const;
    case "CANCELLED":
      return "default" as const;
    default:
      return "gold" as const;
  }
}

export function partnershipStatusVariant(status: PartnershipStatus) {
  switch (status) {
    case "ACTIVE":
      return "green" as const;
    case "MOU":
      return "purple" as const;
    case "DISCUSSION":
      return "blue" as const;
    case "PAUSED":
      return "gold" as const;
    case "TERMINATED":
      return "red" as const;
    default:
      return "default" as const;
  }
}

export function labelFor<T extends string>(
  options: { value: T; label: string }[],
  value: string | null | undefined
): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}
