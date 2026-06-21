"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import type {
  EngagementPriority,
  GovernmentLevel,
  GovernmentSubtype,
  OrganizationStatus,
  OrganizationTier,
} from "@/types/crm";
import { revalidatePath } from "next/cache";

export type GovernmentFormData = {
  name: string;
  legal_name?: string;
  website?: string;
  headquarters_country?: string;
  headquarters_city?: string;
  territory_id?: string;
  status: OrganizationStatus;
  tier?: OrganizationTier;
  description?: string;
  government_level: GovernmentLevel;
  entity_subtype?: GovernmentSubtype;
  jurisdiction?: string;
  parent_government_id?: string;
  resource_endowment?: string;
  engagement_priority?: EngagementPriority;
  regulatory_environment_notes?: string;
};

export async function createGovernment(data: GovernmentFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: data.name,
      legal_name: data.legal_name || null,
      organization_type: "GOVERNMENT",
      segment: "B2G",
      website: data.website || null,
      headquarters_country: data.headquarters_country || null,
      headquarters_city: data.headquarters_city || null,
      territory_id: data.territory_id || null,
      owner_id: profile.id,
      created_by: profile.id,
      status: data.status,
      tier: data.tier || null,
      description: data.description || null,
    })
    .select("id")
    .single();

  if (orgError) throw new Error(orgError.message);

  const { error: profileError } = await supabase.from("government_profiles").insert({
    organization_id: org.id,
    government_level: data.government_level,
    entity_subtype: data.entity_subtype || null,
    jurisdiction: data.jurisdiction || null,
    parent_government_id: data.parent_government_id || null,
    resource_endowment: data.resource_endowment || null,
    engagement_priority: data.engagement_priority || null,
    regulatory_environment_notes: data.regulatory_environment_notes || null,
  });

  if (profileError) {
    await supabase.from("organizations").delete().eq("id", org.id);
    throw new Error(profileError.message);
  }

  revalidatePath("/governments");
  return org.id;
}

export async function updateGovernment(id: string, data: GovernmentFormData) {
  const supabase = await createClient();

  const { error: orgError } = await supabase
    .from("organizations")
    .update({
      name: data.name,
      legal_name: data.legal_name || null,
      website: data.website || null,
      headquarters_country: data.headquarters_country || null,
      headquarters_city: data.headquarters_city || null,
      territory_id: data.territory_id || null,
      status: data.status,
      tier: data.tier || null,
      description: data.description || null,
    })
    .eq("id", id);

  if (orgError) throw new Error(orgError.message);

  const { error: profileError } = await supabase
    .from("government_profiles")
    .update({
      government_level: data.government_level,
      entity_subtype: data.entity_subtype || null,
      jurisdiction: data.jurisdiction || null,
      parent_government_id: data.parent_government_id || null,
      resource_endowment: data.resource_endowment || null,
      engagement_priority: data.engagement_priority || null,
      regulatory_environment_notes: data.regulatory_environment_notes || null,
    })
    .eq("organization_id", id);

  if (profileError) throw new Error(profileError.message);

  revalidatePath("/governments");
  revalidatePath(`/governments/${id}`);
}
