"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import type {
  Partnership,
  PartnershipMember,
  PartnershipStatus,
  PartnershipType,
} from "@/types/partnerships";
import { revalidatePath } from "next/cache";
import { SELECT } from "@/lib/supabase/embeds";

export type PartnershipFormData = {
  name: string;
  partnership_type: PartnershipType;
  status: PartnershipStatus;
  primary_partner_id: string;
  start_date?: string;
  end_date?: string;
  revenue_share_terms?: string;
  strategic_objectives?: string;
  deal_id?: string;
};

export async function getPartnerships(filters?: {
  status?: string;
  partnership_type?: string;
  search?: string;
}): Promise<Partnership[]> {
  const supabase = await createClient();

  let query = supabase
    .from("partnerships")
    .select(SELECT.partnership)
    .order("updated_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.partnership_type) query = query.eq("partnership_type", filters.partnership_type);
  if (filters?.search) query = query.ilike("name", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Partnership[];
}

export async function getPartnership(id: string): Promise<Partnership | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partnerships")
    .select(SELECT.partnership)
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Partnership;
}

export async function getActivePartnershipCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("partnerships")
    .select("*", { count: "exact", head: true })
    .eq("status", "ACTIVE");

  if (error) return 0;
  return count ?? 0;
}

export async function getPartnershipOptions(): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("partnerships").select("id, name").order("name");
  return data ?? [];
}

export async function getDealOptions(): Promise<{ id: string; name: string; stage: string; estimated_value: number | null }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deals")
    .select("id, name, stage, estimated_value")
    .is("deleted_at", null)
    .order("name");
  return data ?? [];
}

async function syncDealPartnershipLink(
  supabase: Awaited<ReturnType<typeof createClient>>,
  partnershipId: string,
  newDealId: string | null,
  previousDealId: string | null
) {
  if (previousDealId && previousDealId !== newDealId) {
    await supabase
      .from("deals")
      .update({ partnership_id: null })
      .eq("id", previousDealId)
      .eq("partnership_id", partnershipId);
  }

  if (newDealId) {
    const { data: other } = await supabase
      .from("partnerships")
      .select("id")
      .eq("deal_id", newDealId)
      .neq("id", partnershipId)
      .maybeSingle();

    if (other) {
      await supabase.from("partnerships").update({ deal_id: null }).eq("id", other.id);
      await supabase.from("deals").update({ partnership_id: null }).eq("id", newDealId);
    }

    await supabase.from("deals").update({ partnership_id: partnershipId }).eq("id", newDealId);
  }
}

export async function createPartnership(data: PartnershipFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { data: partnership, error } = await supabase
    .from("partnerships")
    .insert({
      name: data.name,
      partnership_type: data.partnership_type,
      status: data.status,
      primary_partner_id: data.primary_partner_id,
      owner_id: profile.id,
      created_by: profile.id,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      revenue_share_terms: data.revenue_share_terms || null,
      strategic_objectives: data.strategic_objectives || null,
      deal_id: data.deal_id || null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  if (data.deal_id) {
    await syncDealPartnershipLink(supabase, partnership.id, data.deal_id, null);
  }

  revalidatePath("/partnerships");
  revalidatePath("/dashboard");
  revalidatePath("/pipeline");
  return partnership.id;
}

export async function updatePartnership(id: string, data: PartnershipFormData) {
  const supabase = await createClient();
  const existing = await getPartnership(id);
  if (!existing) throw new Error("Partnership not found");

  const newDealId = data.deal_id || null;
  const previousDealId = existing.deal_id;

  const { error } = await supabase
    .from("partnerships")
    .update({
      name: data.name,
      partnership_type: data.partnership_type,
      status: data.status,
      primary_partner_id: data.primary_partner_id,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      revenue_share_terms: data.revenue_share_terms || null,
      strategic_objectives: data.strategic_objectives || null,
      deal_id: newDealId,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await syncDealPartnershipLink(supabase, id, newDealId, previousDealId);

  revalidatePath("/partnerships");
  revalidatePath(`/partnerships/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/pipeline");
  if (newDealId) revalidatePath(`/pipeline/${newDealId}`);
  if (previousDealId) revalidatePath(`/pipeline/${previousDealId}`);
}

export async function linkPartnershipDeal(partnershipId: string, dealId: string | null) {
  const existing = await getPartnership(partnershipId);
  if (!existing) throw new Error("Partnership not found");

  await updatePartnership(partnershipId, {
    name: existing.name,
    partnership_type: existing.partnership_type,
    status: existing.status,
    primary_partner_id: existing.primary_partner_id,
    start_date: existing.start_date ?? undefined,
    end_date: existing.end_date ?? undefined,
    revenue_share_terms: existing.revenue_share_terms ?? undefined,
    strategic_objectives: existing.strategic_objectives ?? undefined,
    deal_id: dealId ?? undefined,
  });
}

export async function linkDealPartnership(dealId: string, partnershipId: string | null) {
  const supabase = await createClient();

  const { data: deal } = await supabase
    .from("deals")
    .select("partnership_id")
    .eq("id", dealId)
    .single();

  if (!deal) throw new Error("Deal not found");

  if (deal.partnership_id && deal.partnership_id !== partnershipId) {
    const prev = await getPartnership(deal.partnership_id);
    if (prev) {
      await updatePartnership(deal.partnership_id, {
        name: prev.name,
        partnership_type: prev.partnership_type,
        status: prev.status,
        primary_partner_id: prev.primary_partner_id,
        start_date: prev.start_date ?? undefined,
        end_date: prev.end_date ?? undefined,
        revenue_share_terms: prev.revenue_share_terms ?? undefined,
        strategic_objectives: prev.strategic_objectives ?? undefined,
        deal_id: undefined,
      });
    }
  }

  if (partnershipId) {
    const partnership = await getPartnership(partnershipId);
    if (!partnership) throw new Error("Partnership not found");
    await updatePartnership(partnershipId, {
      name: partnership.name,
      partnership_type: partnership.partnership_type,
      status: partnership.status,
      primary_partner_id: partnership.primary_partner_id,
      start_date: partnership.start_date ?? undefined,
      end_date: partnership.end_date ?? undefined,
      revenue_share_terms: partnership.revenue_share_terms ?? undefined,
      strategic_objectives: partnership.strategic_objectives ?? undefined,
      deal_id: dealId,
    });
  } else {
    await supabase.from("deals").update({ partnership_id: null }).eq("id", dealId);
  }

  revalidatePath(`/pipeline/${dealId}`);
  revalidatePath("/partnerships");
}

export async function deletePartnership(id: string) {
  const supabase = await createClient();
  const existing = await getPartnership(id);
  if (!existing) throw new Error("Partnership not found");

  if (existing.deal_id) {
    await supabase
      .from("deals")
      .update({ partnership_id: null })
      .eq("id", existing.deal_id)
      .eq("partnership_id", id);
  }

  const { error } = await supabase.from("partnerships").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/partnerships");
  revalidatePath("/dashboard");
  revalidatePath("/pipeline");
}

export async function getPartnershipMembers(partnershipId: string): Promise<PartnershipMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partnership_members")
    .select(SELECT.partnershipMember)
    .eq("partnership_id", partnershipId)
    .order("created_at");

  if (error) throw new Error(error.message);
  return (data ?? []) as PartnershipMember[];
}

export async function addPartnershipMember(
  partnershipId: string,
  organizationId: string,
  role?: string
) {
  const supabase = await createClient();
  const { error } = await supabase.from("partnership_members").insert({
    partnership_id: partnershipId,
    organization_id: organizationId,
    role_in_partnership: role || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/partnerships/${partnershipId}`);
}

export async function removePartnershipMember(memberId: string, partnershipId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("partnership_members").delete().eq("id", memberId);
  if (error) throw new Error(error.message);
  revalidatePath(`/partnerships/${partnershipId}`);
}

export async function getPartnershipByDealId(dealId: string): Promise<Partnership | null> {
  const supabase = await createClient();
  const { data: deal } = await supabase
    .from("deals")
    .select("partnership_id")
    .eq("id", dealId)
    .single();

  if (!deal?.partnership_id) return null;
  return getPartnership(deal.partnership_id);
}
