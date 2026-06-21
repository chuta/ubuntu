"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import type { Contact, ContactRole, InfluenceLevel } from "@/types/crm";
import { revalidatePath } from "next/cache";

export type ContactFormData = {
  first_name: string;
  last_name: string;
  title?: string;
  department?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  contact_role?: ContactRole;
  influence_level?: InfluenceLevel;
  is_primary?: boolean;
  notes?: string;
};

export async function getContacts(organizationId: string): Promise<Contact[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("organization_id", organizationId)
    .order("is_primary", { ascending: false })
    .order("last_name");

  if (error) throw new Error(error.message);
  return (data ?? []) as Contact[];
}

export async function createContact(organizationId: string, data: ContactFormData, basePath: string) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  if (data.is_primary) {
    await supabase
      .from("contacts")
      .update({ is_primary: false })
      .eq("organization_id", organizationId);
  }

  const { error } = await supabase.from("contacts").insert({
    organization_id: organizationId,
    first_name: data.first_name,
    last_name: data.last_name,
    title: data.title || null,
    department: data.department || null,
    email: data.email || null,
    phone: data.phone || null,
    linkedin_url: data.linkedin_url || null,
    contact_role: data.contact_role || null,
    influence_level: data.influence_level || null,
    is_primary: data.is_primary ?? false,
    notes: data.notes || null,
    created_by: profile.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath(basePath);
}

export async function deleteContact(contactId: string, basePath: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("contacts").delete().eq("id", contactId);
  if (error) throw new Error(error.message);
  revalidatePath(basePath);
}
