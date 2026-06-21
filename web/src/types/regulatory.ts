export type RegulatoryMeetingType = "IN_PERSON" | "VIRTUAL" | "WRITTEN";
export type RegulatoryMeetingStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";
export type RegulatoryAttendanceRole = "REGULATOR" | "UBUNTU" | "ADVISOR" | "OTHER";
export type RegulatorySubmissionType =
  | "POLICY_PROPOSAL"
  | "WHITEPAPER"
  | "COMMENT_LETTER"
  | "REGULATORY_FILING"
  | "OTHER";
export type RegulatorySubmissionStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";
export type RegulatoryConsultationResponseStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "NOT_APPLICABLE";
export type LicenseType =
  | "VASP"
  | "EXCHANGE"
  | "PAYMENT_SERVICE"
  | "CUSTODY"
  | "TOKEN_ISSUANCE"
  | "OTHER";
export type LicensingConversationStatus =
  | "EXPLORING"
  | "PRE_APPLICATION"
  | "APPLICATION_SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "DENIED"
  | "ON_HOLD";
export type RegulatoryRequirementCategory =
  | "LICENSING"
  | "AML_CFT"
  | "CONSUMER_PROTECTION"
  | "CAPITAL"
  | "REPORTING"
  | "OTHER";
export type RegulatoryComplianceStatus =
  | "IDENTIFIED"
  | "IN_PROGRESS"
  | "MET"
  | "NOT_APPLICABLE"
  | "AT_RISK";

export type OrgEmbed = { id: string; name: string } | null;
export type TerritoryEmbed = { id: string; name: string } | null;
export type DealEmbed = { id: string; name: string } | null;
export type DocumentEmbed = { id: string; title: string } | null;
export type ContactEmbed = { id: string; first_name: string; last_name: string } | null;
export type ProductEmbed = { id: string; name: string; code: string } | null;

export type RegulatoryMeeting = {
  id: string;
  title: string;
  meeting_date: string;
  meeting_type: RegulatoryMeetingType;
  regulator_organization_id: string | null;
  territory_id: string;
  status: RegulatoryMeetingStatus;
  outcome_summary: string | null;
  next_steps: string | null;
  deal_id: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  regulator?: OrgEmbed;
  territory?: TerritoryEmbed;
  deal?: DealEmbed;
};

export type RegulatoryMeetingAttendee = {
  id: string;
  meeting_id: string;
  contact_id: string;
  attendance_role: RegulatoryAttendanceRole;
  created_at: string;
  contact?: ContactEmbed;
};

export type RegulatorySubmission = {
  id: string;
  title: string;
  submission_type: RegulatorySubmissionType;
  regulator_organization_id: string | null;
  territory_id: string;
  submitted_at: string | null;
  reference_number: string | null;
  status: RegulatorySubmissionStatus;
  document_id: string | null;
  response_summary: string | null;
  deal_id: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  regulator?: OrgEmbed;
  territory?: TerritoryEmbed;
  document?: DocumentEmbed;
  deal?: DealEmbed;
};

export type RegulatoryConsultation = {
  id: string;
  title: string;
  regulator_organization_id: string | null;
  territory_id: string;
  published_date: string | null;
  response_deadline: string | null;
  response_status: RegulatoryConsultationResponseStatus;
  consultation_url: string | null;
  our_response_document_id: string | null;
  notes: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  regulator?: OrgEmbed;
  territory?: TerritoryEmbed;
  response_document?: DocumentEmbed;
};

export type LicensingConversation = {
  id: string;
  title: string;
  license_type: LicenseType;
  territory_id: string;
  regulator_organization_id: string | null;
  status: LicensingConversationStatus;
  target_timeline: string | null;
  primary_contact_id: string | null;
  deal_id: string | null;
  notes: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  territory?: TerritoryEmbed;
  regulator?: OrgEmbed;
  primary_contact?: ContactEmbed;
  deal?: DealEmbed;
};

export type RegulatoryRequirement = {
  id: string;
  title: string;
  description: string | null;
  territory_id: string;
  product_id: string | null;
  category: RegulatoryRequirementCategory;
  compliance_status: RegulatoryComplianceStatus;
  due_date: string | null;
  evidence_document_id: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  territory?: TerritoryEmbed;
  product?: ProductEmbed;
  evidence_document?: DocumentEmbed;
};

export type RegSection =
  | "meetings"
  | "submissions"
  | "consultations"
  | "licensing"
  | "requirements";
