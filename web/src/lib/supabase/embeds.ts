/**
 * Supabase PostgREST embed registry — single source of truth for `.select()` joins.
 *
 * ## Why this file exists
 *
 * PostgREST throws at runtime when two tables have **multiple foreign keys** between
 * them and an embed omits the constraint name:
 *
 *   "Could not embed because more than one relationship was found for 'A' and 'B'"
 *
 * Fix syntax: `alias:target_table!constraint_name(columns)`
 *
 * PostgreSQL default constraint names: `{source_table}_{column}_fkey`
 *
 * ## Ambiguous pairs in GrowthOS (always use FK hints from this file)
 *
 * | From table     | To table            | FK constant (see FK map below)   |
 * |----------------|---------------------|----------------------------------|
 * | organizations  | government_profiles | govProfileFromOrg                |
 * | deals          | organizations       | orgFromDeal                      |
 * | partnerships   | deals               | dealFromPartnership              |
 * | partnerships   | organizations       | orgFromPartnership               |
 * | deals          | partnerships        | partnershipFromDeal              |
 *
 * ## Usage
 *
 * ```ts
 * import { SELECT } from "@/lib/supabase/embeds";
 * supabase.from("partnerships").select(SELECT.partnership);
 * ```
 *
 * When adding a new embed, check the schema for multiple FKs between the tables.
 * Add the fragment here first — never inline embeds in server actions.
 */

/**
 * Explicit FK hints for ambiguous relationships.
 * Format: `target_table!constraint_name`
 */
export const FK = {
  govProfileFromOrg: "government_profiles!government_profiles_organization_id_fkey",
  orgFromDeal: "organizations!deals_organization_id_fkey",
  orgFromDealSourcePartner: "organizations!deals_source_partner_id_fkey",
  orgFromPartnership: "organizations!partnerships_primary_partner_id_fkey",
  orgFromPartnershipMember: "organizations!partnership_members_organization_id_fkey",
  dealFromPartnership: "deals!partnerships_deal_id_fkey",
  partnershipFromDeal: "partnerships!deals_partnership_id_fkey",
  orgFromDocument: "organizations!documents_organization_id_fkey",
  dealFromDocument: "deals!documents_deal_id_fkey",
  partnershipFromDocument: "partnerships!documents_partnership_id_fkey",
  dealFromActivity: "deals!activities_deal_id_fkey",
  orgFromActivity: "organizations!activities_organization_id_fkey",
  orgFromTokenizationProject: "organizations!tokenization_projects_organization_id_fkey",
  dealFromTokenizationProject: "deals!tokenization_projects_deal_id_fkey",
  govProfileFromTokenizationProject: "government_profiles!tokenization_projects_government_profile_id_fkey",
  orgFromEventLead: "organizations!event_leads_organization_id_fkey",
  contactFromEventLead: "contacts!event_leads_contact_id_fkey",
  dealFromEventLead: "deals!event_leads_deal_id_fkey",
  orgFromRegulatoryMeeting: "organizations!regulatory_meetings_regulator_organization_id_fkey",
  dealFromRegulatoryMeeting: "deals!regulatory_meetings_deal_id_fkey",
  orgFromRegulatorySubmission: "organizations!regulatory_submissions_regulator_organization_id_fkey",
  documentFromRegulatorySubmission: "documents!regulatory_submissions_document_id_fkey",
  dealFromRegulatorySubmission: "deals!regulatory_submissions_deal_id_fkey",
  orgFromRegulatoryConsultation: "organizations!regulatory_consultations_regulator_organization_id_fkey",
  documentFromRegulatoryConsultation: "documents!regulatory_consultations_our_response_document_id_fkey",
  orgFromLicensingConversation: "organizations!licensing_conversations_regulator_organization_id_fkey",
  contactFromLicensingConversation: "contacts!licensing_conversations_primary_contact_id_fkey",
  dealFromLicensingConversation: "deals!licensing_conversations_deal_id_fkey",
  documentFromRegulatoryRequirement: "documents!regulatory_requirements_evidence_document_id_fkey",
  contactFromMeetingAttendee: "contacts!regulatory_meeting_attendees_contact_id_fkey",
  contactFromPositionHistory: "contacts!contact_position_history_contact_id_fkey",
  orgFromPositionHistory: "organizations!contact_position_history_organization_id_fkey",
  sourceContactFromInfluence: "contacts!influence_relationships_source_contact_id_fkey",
  targetContactFromInfluence: "contacts!influence_relationships_target_contact_id_fkey",
  dealFromInfluence: "deals!influence_relationships_deal_id_fkey",
  orgFromInfluence: "organizations!influence_relationships_organization_id_fkey",
  contactFromStakeholderMap: "contacts!stakeholder_maps_contact_id_fkey",
  reportsToFromStakeholderMap: "contacts!stakeholder_maps_reports_to_contact_id_fkey",
  dealFromStakeholderMap: "deals!stakeholder_maps_deal_id_fkey",
  orgFromContact: "organizations!contacts_organization_id_fkey",
  profileFromKnowledgeAuthor: "profiles!knowledge_assets_author_id_fkey",
} as const;

/** Pre-built select strings — `as const` preserves Supabase query type inference */
export const SELECT = {
  deal: `*,
  organization:${FK.orgFromDeal}(id, name, segment, territory_id, territory:territories(id, name)),
  product:products(id, code, name, revenue_engine)`,

  partnership: `*,
  primary_partner:${FK.orgFromPartnership}(id, name, organization_type),
  deal:${FK.dealFromPartnership}(id, name, stage, estimated_value)`,

  partnershipMember: `*,
  organization:${FK.orgFromPartnershipMember}(id, name, organization_type)`,

  organizationGovernment: `*,
  territory:territories(id, name, region, country_code),
  government_profile:${FK.govProfileFromOrg}(*)`,

  organizationInstitutional: `*,
  territory:territories(id, name, region, country_code),
  account_profile:account_profiles(*)`,

  organizationDetail: `*,
  territory:territories(id, name, region, country_code),
  government_profile:${FK.govProfileFromOrg}(*),
  account_profile:account_profiles(*)`,

  document: `*,
  organization:${FK.orgFromDocument}(id, name),
  deal:${FK.dealFromDocument}(id, name),
  partnership:${FK.partnershipFromDocument}(id, name)`,

  knowledgeAsset: `*,
  product:products(id, name),
  territory:territories(id, name),
  author:${FK.profileFromKnowledgeAuthor}(full_name)`,

  event: `*,
  territory:territories(id, name)`,

  eventLead: `*,
  organization:${FK.orgFromEventLead}(id, name),
  contact:${FK.contactFromEventLead}(id, first_name, last_name),
  deal:${FK.dealFromEventLead}(id, name)`,

  tokenizationProject: `*,
  organization:${FK.orgFromTokenizationProject}(id, name),
  deal:${FK.dealFromTokenizationProject}(id, name)`,

  regulatoryMeeting: `*,
  territory:territories(id, name),
  regulator:${FK.orgFromRegulatoryMeeting}(id, name),
  deal:${FK.dealFromRegulatoryMeeting}(id, name)`,

  regulatoryMeetingAttendee: `*,
  contact:${FK.contactFromMeetingAttendee}(id, first_name, last_name)`,

  regulatorySubmission: `*,
  territory:territories(id, name),
  regulator:${FK.orgFromRegulatorySubmission}(id, name),
  document:${FK.documentFromRegulatorySubmission}(id, title),
  deal:${FK.dealFromRegulatorySubmission}(id, name)`,

  regulatoryConsultation: `*,
  territory:territories(id, name),
  regulator:${FK.orgFromRegulatoryConsultation}(id, name),
  response_document:${FK.documentFromRegulatoryConsultation}(id, title)`,

  licensingConversation: `*,
  territory:territories(id, name),
  regulator:${FK.orgFromLicensingConversation}(id, name),
  primary_contact:${FK.contactFromLicensingConversation}(id, first_name, last_name),
  deal:${FK.dealFromLicensingConversation}(id, name)`,

  regulatoryRequirement: `*,
  territory:territories(id, name),
  product:products(id, name, code),
  evidence_document:${FK.documentFromRegulatoryRequirement}(id, title)`,

  contactPositionHistory: `*,
  organization:${FK.orgFromPositionHistory}(id, name),
  contact:${FK.contactFromPositionHistory}(id, first_name, last_name)`,

  influenceRelationship: `*,
  source:${FK.sourceContactFromInfluence}(id, first_name, last_name, title, influence_level, current_influence_score, organization_id, organization:${FK.orgFromContact}(id, name, territory_id)),
  target:${FK.targetContactFromInfluence}(id, first_name, last_name, title, influence_level, current_influence_score, organization_id, organization:${FK.orgFromContact}(id, name, territory_id)),
  deal:${FK.dealFromInfluence}(id, name)`,

  stakeholderMap: `*,
  contact:${FK.contactFromStakeholderMap}(id, first_name, last_name, title, influence_level, current_influence_score, organization_id),
  reports_to:${FK.reportsToFromStakeholderMap}(id, first_name, last_name)`,

  graphContact: `id, first_name, last_name, title, influence_level, current_influence_score, organization_id,
  organization:${FK.orgFromContact}(id, name, territory_id)`,
} as const;
