import type {
  LicenseType,
  LicensingConversationStatus,
  RegSection,
  RegulatoryAttendanceRole,
  RegulatoryComplianceStatus,
  RegulatoryConsultationResponseStatus,
  RegulatoryMeetingStatus,
  RegulatoryMeetingType,
  RegulatoryRequirementCategory,
  RegulatorySubmissionStatus,
  RegulatorySubmissionType,
} from "@/types/regulatory";

export const REG_SECTIONS: {
  key: RegSection;
  label: string;
  href: string;
  description: string;
}[] = [
  {
    key: "meetings",
    label: "Meetings",
    href: "/regulatory/meetings",
    description: "Regulatory meetings with authorities",
  },
  {
    key: "submissions",
    label: "Submissions",
    href: "/regulatory/submissions",
    description: "Policy submissions and filings",
  },
  {
    key: "consultations",
    label: "Consultations",
    href: "/regulatory/consultations",
    description: "Consultation papers and responses",
  },
  {
    key: "licensing",
    label: "Licensing",
    href: "/regulatory/licensing",
    description: "Licensing conversations and applications",
  },
  {
    key: "requirements",
    label: "Requirements",
    href: "/regulatory/requirements",
    description: "Jurisdiction compliance requirements",
  },
];

export const MEETING_TYPES: { value: RegulatoryMeetingType; label: string }[] = [
  { value: "IN_PERSON", label: "In Person" },
  { value: "VIRTUAL", label: "Virtual" },
  { value: "WRITTEN", label: "Written" },
];

export const MEETING_STATUSES: { value: RegulatoryMeetingStatus; label: string }[] = [
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const ATTENDANCE_ROLES: { value: RegulatoryAttendanceRole; label: string }[] = [
  { value: "REGULATOR", label: "Regulator" },
  { value: "UBUNTU", label: "Ubuntu" },
  { value: "ADVISOR", label: "Advisor" },
  { value: "OTHER", label: "Other" },
];

export const SUBMISSION_TYPES: { value: RegulatorySubmissionType; label: string }[] = [
  { value: "POLICY_PROPOSAL", label: "Policy Proposal" },
  { value: "WHITEPAPER", label: "Whitepaper" },
  { value: "COMMENT_LETTER", label: "Comment Letter" },
  { value: "REGULATORY_FILING", label: "Regulatory Filing" },
  { value: "OTHER", label: "Other" },
];

export const SUBMISSION_STATUSES: { value: RegulatorySubmissionStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
];

export const CONSULTATION_RESPONSE_STATUSES: {
  value: RegulatoryConsultationResponseStatus;
  label: string;
}[] = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "NOT_APPLICABLE", label: "Not Applicable" },
];

export const LICENSE_TYPES: { value: LicenseType; label: string }[] = [
  { value: "VASP", label: "VASP" },
  { value: "EXCHANGE", label: "Exchange" },
  { value: "PAYMENT_SERVICE", label: "Payment Service" },
  { value: "CUSTODY", label: "Custody" },
  { value: "TOKEN_ISSUANCE", label: "Token Issuance" },
  { value: "OTHER", label: "Other" },
];

export const LICENSING_STATUSES: { value: LicensingConversationStatus; label: string }[] = [
  { value: "EXPLORING", label: "Exploring" },
  { value: "PRE_APPLICATION", label: "Pre-Application" },
  { value: "APPLICATION_SUBMITTED", label: "Application Submitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "DENIED", label: "Denied" },
  { value: "ON_HOLD", label: "On Hold" },
];

export const REQUIREMENT_CATEGORIES: { value: RegulatoryRequirementCategory; label: string }[] = [
  { value: "LICENSING", label: "Licensing" },
  { value: "AML_CFT", label: "AML/CFT" },
  { value: "CONSUMER_PROTECTION", label: "Consumer Protection" },
  { value: "CAPITAL", label: "Capital" },
  { value: "REPORTING", label: "Reporting" },
  { value: "OTHER", label: "Other" },
];

export const COMPLIANCE_STATUSES: { value: RegulatoryComplianceStatus; label: string }[] = [
  { value: "IDENTIFIED", label: "Identified" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "MET", label: "Met" },
  { value: "NOT_APPLICABLE", label: "Not Applicable" },
  { value: "AT_RISK", label: "At Risk" },
];

export function labelFor<T extends string>(
  options: { value: T; label: string }[],
  value: string | null | undefined
): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}

export function statusVariant(status: string) {
  switch (status) {
    case "COMPLETED":
    case "ACCEPTED":
    case "APPROVED":
    case "MET":
    case "SUBMITTED":
      return "green" as const;
    case "AT_RISK":
    case "REJECTED":
    case "DENIED":
    case "CANCELLED":
      return "red" as const;
    case "UNDER_REVIEW":
    case "IN_PROGRESS":
    case "SCHEDULED":
      return "gold" as const;
    default:
      return "default" as const;
  }
}
