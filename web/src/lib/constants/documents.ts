import type { DocumentStatus, DocumentType } from "@/types/documents";

export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: "NDA", label: "NDA" },
  { value: "MOU", label: "MOU" },
  { value: "LOI", label: "Letter of Intent" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "GOVERNMENT_BRIEF", label: "Government Brief" },
  { value: "PARTNERSHIP_AGREEMENT", label: "Partnership Agreement" },
  { value: "INVESTOR_DECK", label: "Investor Deck" },
  { value: "CONTRACT", label: "Contract" },
  { value: "SOW", label: "Statement of Work" },
  { value: "OTHER", label: "Other" },
];

export const DOCUMENT_STATUSES: { value: DocumentStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "PENDING_APPROVAL", label: "Pending Approval" },
  { value: "APPROVED", label: "Approved" },
  { value: "SENT", label: "Sent" },
  { value: "SIGNED", label: "Signed" },
  { value: "EXECUTED", label: "Executed" },
  { value: "EXPIRED", label: "Expired" },
  { value: "TERMINATED", label: "Terminated" },
];

export function documentStatusVariant(status: DocumentStatus) {
  switch (status) {
    case "EXECUTED":
    case "SIGNED":
      return "green" as const;
    case "APPROVED":
    case "SENT":
      return "purple" as const;
    case "IN_REVIEW":
    case "PENDING_APPROVAL":
      return "gold" as const;
    case "EXPIRED":
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
