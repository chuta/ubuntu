"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import { SELECT } from "@/lib/supabase/embeds";
import { revalidatePath } from "next/cache";
import type {
  LicensingConversation,
  RegulatoryConsultation,
  RegulatoryMeeting,
  RegulatoryMeetingAttendee,
  RegulatoryRequirement,
  RegulatorySubmission,
  RegulatoryAttendanceRole,
  RegulatoryMeetingStatus,
  RegulatoryMeetingType,
  RegulatorySubmissionStatus,
  RegulatorySubmissionType,
  RegulatoryConsultationResponseStatus,
  LicenseType,
  LicensingConversationStatus,
  RegulatoryRequirementCategory,
  RegulatoryComplianceStatus,
} from "@/types/regulatory";
import {
  NIGERIA_REGULATORS,
  type RegulatorOrganizationOption,
} from "@/lib/constants/regulatory";

function revalidateRegulatory(section: string, id?: string) {
  revalidatePath("/regulatory");
  revalidatePath(`/regulatory/${section}`);
  if (id) revalidatePath(`/regulatory/${section}/${id}`);
  revalidatePath("/dashboard");
}

// ─── Shared options ───────────────────────────────────────────────────────────

async function ensureNigeriaRegulators(): Promise<RegulatorOrganizationOption[]> {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { data: territory } = await supabase
    .from("territories")
    .select("id")
    .eq("country_code", "NG")
    .maybeSingle();

  const results: RegulatorOrganizationOption[] = [];

  for (const regulator of NIGERIA_REGULATORS) {
    const { data: existing } = await supabase
      .from("organizations")
      .select("id, name, metadata")
      .eq("metadata->>regulator_code", regulator.code)
      .is("deleted_at", null)
      .maybeSingle();

    if (existing) {
      results.push({
        id: existing.id,
        name: regulator.name,
        acronym: regulator.acronym,
        code: regulator.code,
        category: regulator.category,
      });
      continue;
    }

    const { data: created, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: regulator.name,
        legal_name: regulator.name,
        organization_type: "GOVERNMENT",
        segment: "B2G",
        website: regulator.website ?? null,
        headquarters_country: "NG",
        territory_id: territory?.id ?? null,
        owner_id: profile.id,
        created_by: profile.id,
        status: "ACTIVE",
        tier: "TIER_1",
        description: regulator.description,
        metadata: {
          regulator_code: regulator.code,
          regulator_acronym: regulator.acronym,
          regulator_category: regulator.category,
          regulator_tags: regulator.tags,
          regulator_email: regulator.email ?? null,
          regulator_phone: regulator.phone ?? null,
        },
      })
      .select("id")
      .single();

    if (orgError) {
      if (orgError.code === "23505") {
        const { data: raced } = await supabase
          .from("organizations")
          .select("id")
          .eq("metadata->>regulator_code", regulator.code)
          .is("deleted_at", null)
          .maybeSingle();
        if (raced) {
          results.push({
            id: raced.id,
            name: regulator.name,
            acronym: regulator.acronym,
            code: regulator.code,
            category: regulator.category,
          });
        }
        continue;
      }
      throw new Error(orgError.message);
    }

    const { error: profileError } = await supabase.from("government_profiles").insert({
      organization_id: created.id,
      government_level: "NATIONAL",
      entity_subtype: "REGULATORY_BODY",
      jurisdiction: "Nigeria",
      engagement_priority: regulator.category === "PRIMARY_DIGITAL_ASSET" ? "CRITICAL" : "HIGH",
      regulatory_environment_notes: regulator.description,
    });

    if (profileError) {
      await supabase.from("organizations").delete().eq("id", created.id);
      throw new Error(profileError.message);
    }

    results.push({
      id: created.id,
      name: regulator.name,
      acronym: regulator.acronym,
      code: regulator.code,
      category: regulator.category,
    });
  }

  return results.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category === "PRIMARY_DIGITAL_ASSET" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

export async function getRegulatorOrganizationOptions(): Promise<RegulatorOrganizationOption[]> {
  return ensureNigeriaRegulators();
}

export async function getRegulatoryDealOptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deals")
    .select("id, name, stage")
    .is("deleted_at", null)
    .order("name");
  return data ?? [];
}

export async function getRegulatoryDocumentOptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("documents")
    .select("id, title, document_type")
    .order("title");
  return data ?? [];
}

export async function getRegulatoryContactOptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, organization_id")
    .order("last_name");
  return data ?? [];
}

export async function getRegulatoryProductOptions() {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("id, name, code").order("name");
  return data ?? [];
}

// ─── Meetings ─────────────────────────────────────────────────────────────────

export type MeetingFormData = {
  title: string;
  meeting_date: string;
  meeting_type: RegulatoryMeetingType;
  regulator_organization_id?: string;
  territory_id: string;
  status: RegulatoryMeetingStatus;
  outcome_summary?: string;
  next_steps?: string;
  deal_id?: string;
};

export async function getMeetings(filters?: {
  status?: string;
  territory_id?: string;
  search?: string;
}): Promise<RegulatoryMeeting[]> {
  const supabase = await createClient();
  let query = supabase
    .from("regulatory_meetings")
    .select(SELECT.regulatoryMeeting)
    .order("meeting_date", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.territory_id) query = query.eq("territory_id", filters.territory_id);
  if (filters?.search) query = query.ilike("title", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as RegulatoryMeeting[];
}

export async function getMeeting(id: string): Promise<RegulatoryMeeting | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("regulatory_meetings")
    .select(SELECT.regulatoryMeeting)
    .eq("id", id)
    .single();
  if (error) return null;
  return data as RegulatoryMeeting;
}

export async function createMeeting(data: MeetingFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { data: row, error } = await supabase
    .from("regulatory_meetings")
    .insert({
      title: data.title,
      meeting_date: data.meeting_date,
      meeting_type: data.meeting_type,
      regulator_organization_id: data.regulator_organization_id || null,
      territory_id: data.territory_id,
      status: data.status,
      outcome_summary: data.outcome_summary || null,
      next_steps: data.next_steps || null,
      deal_id: data.deal_id || null,
      owner_id: profile.id,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidateRegulatory("meetings");
  return row.id;
}

export async function updateMeeting(id: string, data: MeetingFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("regulatory_meetings")
    .update({
      title: data.title,
      meeting_date: data.meeting_date,
      meeting_type: data.meeting_type,
      regulator_organization_id: data.regulator_organization_id || null,
      territory_id: data.territory_id,
      status: data.status,
      outcome_summary: data.outcome_summary || null,
      next_steps: data.next_steps || null,
      deal_id: data.deal_id || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateRegulatory("meetings", id);
}

export async function deleteMeeting(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("regulatory_meetings").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateRegulatory("meetings");
}

export async function getMeetingAttendees(meetingId: string): Promise<RegulatoryMeetingAttendee[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("regulatory_meeting_attendees")
    .select(SELECT.regulatoryMeetingAttendee)
    .eq("meeting_id", meetingId)
    .order("created_at");

  if (error) throw new Error(error.message);
  return (data ?? []) as RegulatoryMeetingAttendee[];
}

export async function addMeetingAttendee(
  meetingId: string,
  contactId: string,
  role: RegulatoryAttendanceRole
) {
  const supabase = await createClient();
  const { error } = await supabase.from("regulatory_meeting_attendees").insert({
    meeting_id: meetingId,
    contact_id: contactId,
    attendance_role: role,
  });
  if (error) throw new Error(error.message);
  revalidateRegulatory("meetings", meetingId);
}

export async function removeMeetingAttendee(attendeeId: string, meetingId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("regulatory_meeting_attendees")
    .delete()
    .eq("id", attendeeId);
  if (error) throw new Error(error.message);
  revalidateRegulatory("meetings", meetingId);
}

// ─── Submissions ──────────────────────────────────────────────────────────────

export type SubmissionFormData = {
  title: string;
  submission_type: RegulatorySubmissionType;
  regulator_organization_id?: string;
  territory_id: string;
  submitted_at?: string;
  reference_number?: string;
  status: RegulatorySubmissionStatus;
  document_id?: string;
  response_summary?: string;
  deal_id?: string;
};

export async function getSubmissions(filters?: {
  status?: string;
  territory_id?: string;
  search?: string;
}): Promise<RegulatorySubmission[]> {
  const supabase = await createClient();
  let query = supabase
    .from("regulatory_submissions")
    .select(SELECT.regulatorySubmission)
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.territory_id) query = query.eq("territory_id", filters.territory_id);
  if (filters?.search) query = query.ilike("title", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as RegulatorySubmission[];
}

export async function getSubmission(id: string): Promise<RegulatorySubmission | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("regulatory_submissions")
    .select(SELECT.regulatorySubmission)
    .eq("id", id)
    .single();
  if (error) return null;
  return data as RegulatorySubmission;
}

export async function createSubmission(data: SubmissionFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { data: row, error } = await supabase
    .from("regulatory_submissions")
    .insert({
      title: data.title,
      submission_type: data.submission_type,
      regulator_organization_id: data.regulator_organization_id || null,
      territory_id: data.territory_id,
      submitted_at: data.submitted_at || null,
      reference_number: data.reference_number || null,
      status: data.status,
      document_id: data.document_id || null,
      response_summary: data.response_summary || null,
      deal_id: data.deal_id || null,
      owner_id: profile.id,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidateRegulatory("submissions");
  return row.id;
}

export async function updateSubmission(id: string, data: SubmissionFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("regulatory_submissions")
    .update({
      title: data.title,
      submission_type: data.submission_type,
      regulator_organization_id: data.regulator_organization_id || null,
      territory_id: data.territory_id,
      submitted_at: data.submitted_at || null,
      reference_number: data.reference_number || null,
      status: data.status,
      document_id: data.document_id || null,
      response_summary: data.response_summary || null,
      deal_id: data.deal_id || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateRegulatory("submissions", id);
}

export async function deleteSubmission(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("regulatory_submissions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateRegulatory("submissions");
}

// ─── Consultations ────────────────────────────────────────────────────────────

export type ConsultationFormData = {
  title: string;
  regulator_organization_id?: string;
  territory_id: string;
  published_date?: string;
  response_deadline?: string;
  response_status: RegulatoryConsultationResponseStatus;
  consultation_url?: string;
  our_response_document_id?: string;
  notes?: string;
};

export async function getConsultations(filters?: {
  response_status?: string;
  territory_id?: string;
  search?: string;
}): Promise<RegulatoryConsultation[]> {
  const supabase = await createClient();
  let query = supabase
    .from("regulatory_consultations")
    .select(SELECT.regulatoryConsultation)
    .order("response_deadline", { ascending: true, nullsFirst: false });

  if (filters?.response_status) query = query.eq("response_status", filters.response_status);
  if (filters?.territory_id) query = query.eq("territory_id", filters.territory_id);
  if (filters?.search) query = query.ilike("title", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as RegulatoryConsultation[];
}

export async function getConsultation(id: string): Promise<RegulatoryConsultation | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("regulatory_consultations")
    .select(SELECT.regulatoryConsultation)
    .eq("id", id)
    .single();
  if (error) return null;
  return data as RegulatoryConsultation;
}

export async function createConsultation(data: ConsultationFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { data: row, error } = await supabase
    .from("regulatory_consultations")
    .insert({
      title: data.title,
      regulator_organization_id: data.regulator_organization_id || null,
      territory_id: data.territory_id,
      published_date: data.published_date || null,
      response_deadline: data.response_deadline || null,
      response_status: data.response_status,
      consultation_url: data.consultation_url || null,
      our_response_document_id: data.our_response_document_id || null,
      notes: data.notes || null,
      owner_id: profile.id,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidateRegulatory("consultations");
  return row.id;
}

export async function updateConsultation(id: string, data: ConsultationFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("regulatory_consultations")
    .update({
      title: data.title,
      regulator_organization_id: data.regulator_organization_id || null,
      territory_id: data.territory_id,
      published_date: data.published_date || null,
      response_deadline: data.response_deadline || null,
      response_status: data.response_status,
      consultation_url: data.consultation_url || null,
      our_response_document_id: data.our_response_document_id || null,
      notes: data.notes || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateRegulatory("consultations", id);
}

export async function deleteConsultation(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("regulatory_consultations").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateRegulatory("consultations");
}

// ─── Licensing ────────────────────────────────────────────────────────────────

export type LicensingFormData = {
  title: string;
  license_type: LicenseType;
  territory_id: string;
  regulator_organization_id?: string;
  status: LicensingConversationStatus;
  target_timeline?: string;
  primary_contact_id?: string;
  deal_id?: string;
  notes?: string;
};

export async function getLicensingConversations(filters?: {
  status?: string;
  territory_id?: string;
  search?: string;
}): Promise<LicensingConversation[]> {
  const supabase = await createClient();
  let query = supabase
    .from("licensing_conversations")
    .select(SELECT.licensingConversation)
    .order("updated_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.territory_id) query = query.eq("territory_id", filters.territory_id);
  if (filters?.search) query = query.ilike("title", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as LicensingConversation[];
}

export async function getLicensingConversation(id: string): Promise<LicensingConversation | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("licensing_conversations")
    .select(SELECT.licensingConversation)
    .eq("id", id)
    .single();
  if (error) return null;
  return data as LicensingConversation;
}

export async function createLicensingConversation(data: LicensingFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { data: row, error } = await supabase
    .from("licensing_conversations")
    .insert({
      title: data.title,
      license_type: data.license_type,
      territory_id: data.territory_id,
      regulator_organization_id: data.regulator_organization_id || null,
      status: data.status,
      target_timeline: data.target_timeline || null,
      primary_contact_id: data.primary_contact_id || null,
      deal_id: data.deal_id || null,
      notes: data.notes || null,
      owner_id: profile.id,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidateRegulatory("licensing");
  return row.id;
}

export async function updateLicensingConversation(id: string, data: LicensingFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("licensing_conversations")
    .update({
      title: data.title,
      license_type: data.license_type,
      territory_id: data.territory_id,
      regulator_organization_id: data.regulator_organization_id || null,
      status: data.status,
      target_timeline: data.target_timeline || null,
      primary_contact_id: data.primary_contact_id || null,
      deal_id: data.deal_id || null,
      notes: data.notes || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateRegulatory("licensing", id);
}

export async function deleteLicensingConversation(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("licensing_conversations").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateRegulatory("licensing");
}

// ─── Requirements ─────────────────────────────────────────────────────────────

export type RequirementFormData = {
  title: string;
  description?: string;
  territory_id: string;
  product_id?: string;
  category: RegulatoryRequirementCategory;
  compliance_status: RegulatoryComplianceStatus;
  due_date?: string;
  evidence_document_id?: string;
};

export async function getRequirements(filters?: {
  compliance_status?: string;
  territory_id?: string;
  search?: string;
}): Promise<RegulatoryRequirement[]> {
  const supabase = await createClient();
  let query = supabase
    .from("regulatory_requirements")
    .select(SELECT.regulatoryRequirement)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (filters?.compliance_status) query = query.eq("compliance_status", filters.compliance_status);
  if (filters?.territory_id) query = query.eq("territory_id", filters.territory_id);
  if (filters?.search) query = query.ilike("title", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as RegulatoryRequirement[];
}

export async function getRequirement(id: string): Promise<RegulatoryRequirement | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("regulatory_requirements")
    .select(SELECT.regulatoryRequirement)
    .eq("id", id)
    .single();
  if (error) return null;
  return data as RegulatoryRequirement;
}

export async function createRequirement(data: RequirementFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { data: row, error } = await supabase
    .from("regulatory_requirements")
    .insert({
      title: data.title,
      description: data.description || null,
      territory_id: data.territory_id,
      product_id: data.product_id || null,
      category: data.category,
      compliance_status: data.compliance_status,
      due_date: data.due_date || null,
      evidence_document_id: data.evidence_document_id || null,
      owner_id: profile.id,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidateRegulatory("requirements");
  return row.id;
}

export async function updateRequirement(id: string, data: RequirementFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("regulatory_requirements")
    .update({
      title: data.title,
      description: data.description || null,
      territory_id: data.territory_id,
      product_id: data.product_id || null,
      category: data.category,
      compliance_status: data.compliance_status,
      due_date: data.due_date || null,
      evidence_document_id: data.evidence_document_id || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateRegulatory("requirements", id);
}

export async function deleteRequirement(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("regulatory_requirements").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateRegulatory("requirements");
}
