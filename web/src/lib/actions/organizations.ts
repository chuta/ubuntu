"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import type { Organization, Territory } from "@/types/crm";
import { revalidatePath } from "next/cache";
import { SELECT } from "@/lib/supabase/embeds";

export async function getTerritories(): Promise<Territory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("territories")
    .select("id, name, region, country_code")
    .eq("is_active", true)
    .order("name");
  return data ?? [];
}

export async function getOrganizations(
  type: "GOVERNMENT" | "INSTITUTIONAL",
  filters?: { status?: string; territory_id?: string; search?: string }
): Promise<Organization[]> {
  const supabase = await createClient();

  let query = supabase
    .from("organizations")
    .select(type === "GOVERNMENT" ? SELECT.organizationGovernment : SELECT.organizationInstitutional)
    .eq("organization_type", type)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.territory_id) query = query.eq("territory_id", filters.territory_id);
  if (filters?.search) query = query.ilike("name", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Organization[];
}

export async function getOrganization(id: string): Promise<Organization | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select(SELECT.organizationDetail)
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return data as Organization;
}

export async function getGovernmentOptions(): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("organization_type", "GOVERNMENT")
    .is("deleted_at", null)
    .order("name");
  return data ?? [];
}

export async function softDeleteOrganization(id: string, basePath: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath(basePath);
}

async function getOwnerId() {
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");
  return profile.id;
}

export { getOwnerId };
