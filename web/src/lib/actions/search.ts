"use server";

import { createClient } from "@/lib/supabase/server";

export type SearchResult = {
  organizations: { id: string; name: string; organization_type: string; href: string }[];
  deals: { id: string; name: string; stage: string; href: string }[];
  contacts: { id: string; name: string; organization_id: string | null; href: string }[];
};

export async function globalSearch(query: string): Promise<SearchResult> {
  const empty: SearchResult = { organizations: [], deals: [], contacts: [] };
  const q = query.trim();
  if (q.length < 2) return empty;

  const supabase = await createClient();
  const pattern = `%${q}%`;

  const [orgs, deals, contactsByFirst, contactsByLast] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name, organization_type")
      .is("deleted_at", null)
      .ilike("name", pattern)
      .limit(5),
    supabase
      .from("deals")
      .select("id, name, stage")
      .is("deleted_at", null)
      .ilike("name", pattern)
      .limit(5),
    supabase
      .from("contacts")
      .select("id, first_name, last_name, organization_id")
      .ilike("first_name", pattern)
      .limit(5),
    supabase
      .from("contacts")
      .select("id, first_name, last_name, organization_id")
      .ilike("last_name", pattern)
      .limit(5),
  ]);

  const seen = new Set<string>();
  const contacts = [...(contactsByFirst.data ?? []), ...(contactsByLast.data ?? [])]
    .filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    })
    .slice(0, 5);

  return {
    organizations: (orgs.data ?? []).map((o) => ({
      id: o.id,
      name: o.name,
      organization_type: o.organization_type,
      href: o.organization_type === "GOVERNMENT" ? `/governments/${o.id}` : `/accounts/${o.id}`,
    })),
    deals: (deals.data ?? []).map((d) => ({
      id: d.id,
      name: d.name,
      stage: d.stage,
      href: `/pipeline/${d.id}`,
    })),
    contacts: contacts.map((c) => ({
      id: c.id,
      name: `${c.first_name} ${c.last_name}`,
      organization_id: c.organization_id,
      href: c.organization_id ? `/governments/${c.organization_id}` : "#",
    })),
  };
}
