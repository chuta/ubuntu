"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import type {
  AccountSubtype,
  GiftAdoptionStatus,
  OrganizationStatus,
  OrganizationTier,
  TreasuryInterest,
  WalletIntegrationStatus,
} from "@/types/crm";
import { revalidatePath } from "next/cache";

export type AccountFormData = {
  name: string;
  legal_name?: string;
  website?: string;
  headquarters_country?: string;
  headquarters_city?: string;
  territory_id?: string;
  status: OrganizationStatus;
  tier?: OrganizationTier;
  description?: string;
  account_subtype: AccountSubtype;
  aum_range?: string;
  treasury_interest_level?: TreasuryInterest;
  gift_adoption_status?: GiftAdoptionStatus;
  wallet_integration_status?: WalletIntegrationStatus;
  annual_revenue_potential?: number;
  decision_cycle_months?: number;
};

export async function createAccount(data: AccountFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: data.name,
      legal_name: data.legal_name || null,
      organization_type: "INSTITUTIONAL",
      segment: "B2B",
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

  const { error: profileError } = await supabase.from("account_profiles").insert({
    organization_id: org.id,
    account_subtype: data.account_subtype,
    aum_range: data.aum_range || null,
    treasury_interest_level: data.treasury_interest_level || null,
    gift_adoption_status: data.gift_adoption_status || null,
    wallet_integration_status: data.wallet_integration_status || null,
    annual_revenue_potential: data.annual_revenue_potential || null,
    decision_cycle_months: data.decision_cycle_months || null,
  });

  if (profileError) {
    await supabase.from("organizations").delete().eq("id", org.id);
    throw new Error(profileError.message);
  }

  revalidatePath("/accounts");
  return org.id;
}

export async function updateAccount(id: string, data: AccountFormData) {
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
    .from("account_profiles")
    .update({
      account_subtype: data.account_subtype,
      aum_range: data.aum_range || null,
      treasury_interest_level: data.treasury_interest_level || null,
      gift_adoption_status: data.gift_adoption_status || null,
      wallet_integration_status: data.wallet_integration_status || null,
      annual_revenue_potential: data.annual_revenue_potential || null,
      decision_cycle_months: data.decision_cycle_months || null,
    })
    .eq("organization_id", id);

  if (profileError) throw new Error(profileError.message);

  revalidatePath("/accounts");
  revalidatePath(`/accounts/${id}`);
}
