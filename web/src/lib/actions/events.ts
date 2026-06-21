"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import type { Event, EventLead, EventType, LeadQuality, UbuntuRole } from "@/types/events";
import { revalidatePath } from "next/cache";
import { SELECT } from "@/lib/supabase/embeds";
import { defaultProbability } from "@/lib/constants/deals";

export type EventFormData = {
  name: string;
  event_type: EventType;
  start_date: string;
  end_date?: string;
  location?: string;
  country_code?: string;
  territory_id?: string;
  description?: string;
  budget?: number;
  actual_cost?: number;
  ubuntu_role?: UbuntuRole;
  roi_notes?: string;
};

export async function getEvents(filters?: {
  event_type?: string;
  search?: string;
  from?: string;
  to?: string;
}): Promise<Event[]> {
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select(SELECT.event)
    .order("start_date", { ascending: false });

  if (filters?.event_type) query = query.eq("event_type", filters.event_type);
  if (filters?.search) query = query.ilike("name", `%${filters.search}%`);
  if (filters?.from) query = query.gte("start_date", filters.from);
  if (filters?.to) query = query.lte("start_date", filters.to);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Event[];
}

export async function getEvent(id: string): Promise<Event | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(SELECT.event)
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Event;
}

export async function getUpcomingEventCount(): Promise<number> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { count } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .gte("start_date", today);

  return count ?? 0;
}

export async function createEvent(data: EventFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      name: data.name,
      event_type: data.event_type,
      start_date: data.start_date,
      end_date: data.end_date || null,
      location: data.location || null,
      country_code: data.country_code || null,
      territory_id: data.territory_id || null,
      description: data.description || null,
      budget: data.budget ?? null,
      actual_cost: data.actual_cost ?? null,
      ubuntu_role: data.ubuntu_role || null,
      roi_notes: data.roi_notes || null,
      owner_id: profile.id,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/events");
  revalidatePath("/dashboard");
  return event.id;
}

export async function updateEvent(id: string, data: EventFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("events")
    .update({
      name: data.name,
      event_type: data.event_type,
      start_date: data.start_date,
      end_date: data.end_date || null,
      location: data.location || null,
      country_code: data.country_code || null,
      territory_id: data.territory_id || null,
      description: data.description || null,
      budget: data.budget ?? null,
      actual_cost: data.actual_cost ?? null,
      ubuntu_role: data.ubuntu_role || null,
      roi_notes: data.roi_notes || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/events");
  revalidatePath("/dashboard");
}

export async function getEventLeads(eventId: string): Promise<EventLead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_leads")
    .select(SELECT.eventLead)
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as EventLead[];
}

export type EventLeadFormData = {
  contact_id?: string;
  organization_id?: string;
  lead_quality?: LeadQuality;
  notes?: string;
};

export async function createEventLead(eventId: string, data: EventLeadFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { error } = await supabase.from("event_leads").insert({
    event_id: eventId,
    contact_id: data.contact_id || null,
    organization_id: data.organization_id || null,
    lead_quality: data.lead_quality || null,
    notes: data.notes || null,
    follow_up_status: "PENDING",
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/events/${eventId}`);
}

export async function updateEventLeadStatus(
  leadId: string,
  eventId: string,
  status: EventLead["follow_up_status"]
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("event_leads")
    .update({ follow_up_status: status })
    .eq("id", leadId);

  if (error) throw new Error(error.message);
  revalidatePath(`/events/${eventId}`);
}

export async function convertEventLeadToDeal(leadId: string, eventId: string) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { data: lead, error: leadError } = await supabase
    .from("event_leads")
    .select(SELECT.eventLead)
    .eq("id", leadId)
    .single();

  if (leadError || !lead) throw new Error("Lead not found");
  if (lead.deal_id) throw new Error("Lead already converted");

  const orgId = lead.organization_id;
  if (!orgId) throw new Error("Lead must have an organization to create a deal");

  const { data: org } = await supabase
    .from("organizations")
    .select("segment")
    .eq("id", orgId)
    .single();

  const event = await getEvent(eventId);
  const dealName = lead.organization?.name
    ? `${lead.organization.name} — ${event?.name ?? "Event"}`
    : `Event lead — ${event?.name ?? "Event"}`;

  const stage = "LEAD" as const;
  const { data: deal, error: dealError } = await supabase
    .from("deals")
    .insert({
      name: dealName,
      organization_id: orgId,
      owner_id: profile.id,
      created_by: profile.id,
      segment: org?.segment ?? "B2G",
      revenue_engine: "TOKENIZATION_TaaS",
      stage,
      probability: defaultProbability(stage),
      source: "EVENT",
      source_event_id: eventId,
      description: lead.notes || `Converted from event lead at ${event?.name ?? "event"}`,
    })
    .select("id")
    .single();

  if (dealError) throw new Error(dealError.message);

  await supabase.from("deal_stage_history").insert({
    deal_id: deal.id,
    from_stage: null,
    to_stage: stage,
    changed_by_id: profile.id,
    notes: "Created from event lead",
  });

  await supabase
    .from("event_leads")
    .update({ deal_id: deal.id, follow_up_status: "CONVERTED" })
    .eq("id", leadId);

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/pipeline");
  revalidatePath("/dashboard");

  return deal.id;
}

export async function getDealsBySourceEvent(eventId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deals")
    .select("id, name, stage, estimated_value")
    .eq("source_event_id", eventId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getContactOptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, organization_id")
    .order("last_name");
  return data ?? [];
}

export async function getOrganizationOptionsForEvents() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("id, name")
    .is("deleted_at", null)
    .order("name");
  return data ?? [];
}

export async function upsertImportedEvent(event: {
  google_event_id: string;
  name: string;
  start_date: string;
  end_date?: string | null;
  location?: string | null;
  description?: string | null;
}) {
  const result = await importGoogleCalendarEvents([event]);
  return {
    id: "",
    created: result.imported > 0,
  };
}

export async function importGoogleCalendarEvents(
  events: Array<{
    google_event_id: string;
    name: string;
    start_date: string;
    end_date?: string | null;
    location?: string | null;
    description?: string | null;
  }>
) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const validEvents = events.filter((e) => e.google_event_id);
  if (validEvents.length === 0) {
    return { imported: 0, updated: 0, total: 0 };
  }

  const googleIds = validEvents.map((e) => e.google_event_id);
  const { data: existingRows } = await supabase
    .from("events")
    .select("google_event_id")
    .in("google_event_id", googleIds);

  const existingIds = new Set(existingRows?.map((r) => r.google_event_id) ?? []);

  const rows = validEvents.map((e) => ({
    name: e.name,
    event_type: "OTHER" as const,
    start_date: e.start_date,
    end_date: e.end_date || null,
    location: e.location || null,
    description: e.description || null,
    google_event_id: e.google_event_id,
    owner_id: profile.id,
    created_by: profile.id,
  }));

  const chunkSize = 50;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase
      .from("events")
      .upsert(chunk, { onConflict: "google_event_id" });
    if (error) throw new Error(error.message);
  }

  const imported = rows.filter((r) => !existingIds.has(r.google_event_id)).length;
  const updated = rows.length - imported;

  revalidatePath("/events");
  return { imported, updated, total: rows.length };
}
