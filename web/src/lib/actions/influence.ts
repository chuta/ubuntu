"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import { SELECT } from "@/lib/supabase/embeds";
import { revalidatePath } from "next/cache";
import type {
  ContactPositionHistory,
  GraphContact,
  InfluenceGraphData,
  InfluenceRelationship,
  InfluenceRelationshipType,
  StakeholderMap,
  UbuntuStance,
} from "@/types/influence";
import type { InfluenceLevel } from "@/types/crm";

function revalidateInfluence(paths: string[] = ["/influence"]) {
  for (const p of paths) revalidatePath(p);
}

// ─── Graph data ───────────────────────────────────────────────────────────────

export async function getInfluenceGraphData(filters?: {
  deal_id?: string;
  organization_id?: string;
  territory_id?: string;
}): Promise<InfluenceGraphData> {
  const supabase = await createClient();
  const contactIds = await resolveContactIdsForScope(filters);

  let relationships: InfluenceRelationship[] = [];
  const ids = [...contactIds];

  if (filters?.deal_id) {
    let q = supabase.from("influence_relationships").select(SELECT.influenceRelationship);
    if (ids.length > 0) {
      q = q.or(
        `deal_id.eq.${filters.deal_id},and(source_contact_id.in.(${ids.join(",")}),target_contact_id.in.(${ids.join(",")}))`
      );
    } else {
      q = q.eq("deal_id", filters.deal_id);
    }
    const { data, error } = await q.order("updated_at", { ascending: false }).limit(200);
    if (error) throw new Error(error.message);
    relationships = (data ?? []) as InfluenceRelationship[];
  } else if (filters?.organization_id) {
    let q = supabase.from("influence_relationships").select(SELECT.influenceRelationship);
    if (ids.length > 0) {
      q = q.or(
        `organization_id.eq.${filters.organization_id},source_contact_id.in.(${ids.join(",")}),target_contact_id.in.(${ids.join(",")})`
      );
    } else {
      q = q.eq("organization_id", filters.organization_id);
    }
    const { data, error } = await q.order("updated_at", { ascending: false }).limit(200);
    if (error) throw new Error(error.message);
    relationships = (data ?? []) as InfluenceRelationship[];
  } else if (filters?.territory_id && ids.length > 0) {
    const { data, error } = await supabase
      .from("influence_relationships")
      .select(SELECT.influenceRelationship)
      .or(`source_contact_id.in.(${ids.join(",")}),target_contact_id.in.(${ids.join(",")})`)
      .order("updated_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    relationships = (data ?? []) as InfluenceRelationship[];
  } else if (!filters?.deal_id && !filters?.organization_id && !filters?.territory_id) {
    const { data, error } = await supabase
      .from("influence_relationships")
      .select(SELECT.influenceRelationship)
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    relationships = (data ?? []) as InfluenceRelationship[];
  }

  for (const r of relationships) {
    contactIds.add(r.source_contact_id);
    contactIds.add(r.target_contact_id);
  }

  let mapQuery = supabase.from("stakeholder_maps").select(SELECT.stakeholderMap);
  if (filters?.deal_id) mapQuery = mapQuery.eq("deal_id", filters.deal_id);
  else if (filters?.organization_id) mapQuery = mapQuery.eq("organization_id", filters.organization_id);

  const { data: maps } = await mapQuery;
  const stakeholderMaps = (maps ?? []) as StakeholderMap[];
  for (const m of stakeholderMaps) contactIds.add(m.contact_id);

  let nodes: GraphContact[] = [];
  const allIds = [...contactIds];
  if (allIds.length > 0) {
    const { data: contacts, error: cErr } = await supabase
      .from("contacts")
      .select(SELECT.graphContact)
      .in("id", allIds);
    if (cErr) throw new Error(cErr.message);
    nodes = ((contacts ?? []) as unknown as GraphContact[]).map((n) => ({
      ...n,
      organization: Array.isArray(n.organization) ? n.organization[0] ?? null : n.organization,
    }));

    const stanceByContact = new Map<string, UbuntuStance>();
    for (const m of stakeholderMaps) {
      if (m.relationship_to_ubuntu) stanceByContact.set(m.contact_id, m.relationship_to_ubuntu);
    }
    nodes = nodes.map((n) => ({
      ...n,
      ubuntu_stance: stanceByContact.get(n.id) ?? null,
    }));
  }

  return { nodes, edges: relationships, stakeholderMaps };
}

async function resolveContactIdsForScope(filters?: {
  deal_id?: string;
  organization_id?: string;
  territory_id?: string;
}): Promise<Set<string>> {
  const supabase = await createClient();
  const ids = new Set<string>();

  if (filters?.deal_id) {
    const { data: deal } = await supabase
      .from("deals")
      .select("organization_id")
      .eq("id", filters.deal_id)
      .single();
    if (deal?.organization_id) {
      const { data: contacts } = await supabase
        .from("contacts")
        .select("id")
        .eq("organization_id", deal.organization_id);
      contacts?.forEach((c) => ids.add(c.id));
    }
    const { data: maps } = await supabase
      .from("stakeholder_maps")
      .select("contact_id")
      .eq("deal_id", filters.deal_id);
    maps?.forEach((m) => ids.add(m.contact_id));
  } else if (filters?.organization_id) {
    const { data: contacts } = await supabase
      .from("contacts")
      .select("id")
      .eq("organization_id", filters.organization_id);
    contacts?.forEach((c) => ids.add(c.id));
  } else if (filters?.territory_id) {
    const { data: orgs } = await supabase
      .from("organizations")
      .select("id")
      .eq("territory_id", filters.territory_id)
      .is("deleted_at", null);
    const orgIds = orgs?.map((o) => o.id) ?? [];
    if (orgIds.length > 0) {
      const { data: contacts } = await supabase
        .from("contacts")
        .select("id")
        .in("organization_id", orgIds);
      contacts?.forEach((c) => ids.add(c.id));
    }
  }

  return ids;
}

export async function getAllRelationships(): Promise<InfluenceRelationship[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("influence_relationships")
    .select(SELECT.influenceRelationship)
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []) as InfluenceRelationship[];
}

// ─── Position history ───────────────────────────────────────────────────────────

export type PositionFormData = {
  contact_id: string;
  organization_id: string;
  title: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  notes?: string;
};

export async function getPositionHistory(contactId: string): Promise<ContactPositionHistory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_position_history")
    .select(SELECT.contactPositionHistory)
    .eq("contact_id", contactId)
    .order("is_current", { ascending: false })
    .order("start_date", { ascending: false, nullsFirst: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ContactPositionHistory[];
}

export async function getPositionHistoryForOrganization(
  organizationId: string
): Promise<ContactPositionHistory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_position_history")
    .select(SELECT.contactPositionHistory)
    .eq("organization_id", organizationId)
    .order("is_current", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ContactPositionHistory[];
}

export async function getPositionHistoryByContacts(
  contactIds: string[]
): Promise<Record<string, ContactPositionHistory[]>> {
  if (contactIds.length === 0) return {};
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_position_history")
    .select(SELECT.contactPositionHistory)
    .in("contact_id", contactIds)
    .order("is_current", { ascending: false });
  if (error) throw new Error(error.message);
  const grouped: Record<string, ContactPositionHistory[]> = {};
  for (const row of (data ?? []) as ContactPositionHistory[]) {
    if (!grouped[row.contact_id]) grouped[row.contact_id] = [];
    grouped[row.contact_id].push(row);
  }
  return grouped;
}

export async function createPosition(data: PositionFormData, revalidatePaths: string[] = []) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  if (data.is_current) {
    await supabase
      .from("contact_position_history")
      .update({ is_current: false })
      .eq("contact_id", data.contact_id);
  }

  const { error } = await supabase.from("contact_position_history").insert({
    contact_id: data.contact_id,
    organization_id: data.organization_id,
    title: data.title,
    start_date: data.start_date || null,
    end_date: data.is_current ? null : data.end_date || null,
    is_current: data.is_current ?? false,
    notes: data.notes || null,
    owner_id: profile.id,
    created_by: profile.id,
  });
  if (error) throw new Error(error.message);
  revalidateInfluence(["/influence", ...revalidatePaths]);
}

export async function deletePosition(id: string, revalidatePaths: string[] = []) {
  const supabase = await createClient();
  const { error } = await supabase.from("contact_position_history").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateInfluence(["/influence", ...revalidatePaths]);
}

// ─── Influence relationships ──────────────────────────────────────────────────

export type RelationshipFormData = {
  source_contact_id: string;
  target_contact_id: string;
  relationship_type: InfluenceRelationshipType;
  strength: number;
  relationship_to_ubuntu?: UbuntuStance;
  notes?: string;
  last_verified_at?: string;
  deal_id?: string;
  organization_id?: string;
};

export async function createRelationship(data: RelationshipFormData, revalidatePaths: string[] = []) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { error } = await supabase.from("influence_relationships").insert({
    source_contact_id: data.source_contact_id,
    target_contact_id: data.target_contact_id,
    relationship_type: data.relationship_type,
    strength: data.strength,
    relationship_to_ubuntu: data.relationship_to_ubuntu || null,
    notes: data.notes || null,
    last_verified_at: data.last_verified_at || new Date().toISOString().slice(0, 10),
    deal_id: data.deal_id || null,
    organization_id: data.organization_id || null,
    owner_id: profile.id,
    created_by: profile.id,
  });
  if (error) throw new Error(error.message);
  revalidateInfluence(["/influence", ...revalidatePaths]);
}

export async function updateRelationship(
  id: string,
  data: Partial<RelationshipFormData>,
  revalidatePaths: string[] = []
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("influence_relationships")
    .update({
      ...(data.source_contact_id && { source_contact_id: data.source_contact_id }),
      ...(data.target_contact_id && { target_contact_id: data.target_contact_id }),
      ...(data.relationship_type && { relationship_type: data.relationship_type }),
      ...(data.strength && { strength: data.strength }),
      ...(data.relationship_to_ubuntu !== undefined && {
        relationship_to_ubuntu: data.relationship_to_ubuntu || null,
      }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
      ...(data.last_verified_at && { last_verified_at: data.last_verified_at }),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateInfluence(["/influence", ...revalidatePaths]);
}

export async function verifyRelationship(id: string, revalidatePaths: string[] = []) {
  return updateRelationship(id, { last_verified_at: new Date().toISOString().slice(0, 10) }, revalidatePaths);
}

export async function deleteRelationship(id: string, revalidatePaths: string[] = []) {
  const supabase = await createClient();
  const { error } = await supabase.from("influence_relationships").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateInfluence(["/influence", ...revalidatePaths]);
}

// ─── Stakeholder maps ─────────────────────────────────────────────────────────

export type StakeholderMapFormData = {
  deal_id?: string;
  organization_id: string;
  contact_id: string;
  relationship_to_ubuntu?: UbuntuStance;
  relationship_to_decision?: string;
  reports_to_contact_id?: string;
  engagement_score?: number;
};

export async function getStakeholderMapsForDeal(dealId: string): Promise<StakeholderMap[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stakeholder_maps")
    .select(SELECT.stakeholderMap)
    .eq("deal_id", dealId);
  if (error) throw new Error(error.message);
  return (data ?? []) as StakeholderMap[];
}

export async function upsertStakeholderMap(data: StakeholderMapFormData, revalidatePaths: string[] = []) {
  const supabase = await createClient();

  let existingQuery = supabase
    .from("stakeholder_maps")
    .select("id")
    .eq("contact_id", data.contact_id);
  if (data.deal_id) existingQuery = existingQuery.eq("deal_id", data.deal_id);
  else existingQuery = existingQuery.is("deal_id", null);

  const { data: existing } = await existingQuery.maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("stakeholder_maps")
      .update({
        relationship_to_ubuntu: data.relationship_to_ubuntu || null,
        relationship_to_decision: data.relationship_to_decision || null,
        reports_to_contact_id: data.reports_to_contact_id || null,
        engagement_score: data.engagement_score ?? null,
      })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("stakeholder_maps").insert({
      deal_id: data.deal_id || null,
      organization_id: data.organization_id,
      contact_id: data.contact_id,
      relationship_to_ubuntu: data.relationship_to_ubuntu || null,
      relationship_to_decision: data.relationship_to_decision || null,
      reports_to_contact_id: data.reports_to_contact_id || null,
      engagement_score: data.engagement_score ?? null,
    });
    if (error) throw new Error(error.message);
  }

  revalidateInfluence(["/influence", ...revalidatePaths]);
}

export async function deleteStakeholderMap(id: string, revalidatePaths: string[] = []) {
  const supabase = await createClient();
  const { error } = await supabase.from("stakeholder_maps").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateInfluence(["/influence", ...revalidatePaths]);
}

// ─── Contact influence profile ──────────────────────────────────────────────

export async function updateContactInfluence(
  contactId: string,
  data: { influence_level?: InfluenceLevel; current_influence_score?: number | null },
  revalidatePaths: string[] = []
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contacts")
    .update({
      ...(data.influence_level !== undefined && { influence_level: data.influence_level || null }),
      ...(data.current_influence_score !== undefined && {
        current_influence_score: data.current_influence_score,
      }),
    })
    .eq("id", contactId);
  if (error) throw new Error(error.message);
  revalidateInfluence(["/influence", ...revalidatePaths]);
}

// ─── Options ──────────────────────────────────────────────────────────────────

export async function getContactOptionsForInfluence() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, title, organization_id, organization:organizations(id, name)")
    .order("last_name");
  return data ?? [];
}

export async function getOrganizationOptionsForInfluence() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("id, name, territory_id")
    .is("deleted_at", null)
    .order("name");
  return data ?? [];
}

export async function getDealOptionsForInfluence() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deals")
    .select("id, name, organization_id")
    .is("deleted_at", null)
    .order("name");
  return data ?? [];
}

export async function getTerritoryOptionsForInfluence() {
  const supabase = await createClient();
  const { data } = await supabase.from("territories").select("id, name").order("name");
  return data ?? [];
}
