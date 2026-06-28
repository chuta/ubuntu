"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/crm/form-field";
import type { GovernmentFormData } from "@/lib/actions/governments";
import {
  ENGAGEMENT_PRIORITIES,
  GOVERNMENT_LEVELS,
  GOVERNMENT_SUBTYPES,
  ORGANIZATION_STATUSES,
  ORGANIZATION_TIERS,
} from "@/lib/constants/organizations";
import type { Organization, Territory } from "@/types/crm";

type Props = {
  territories: Territory[];
  governmentOptions: { id: string; name: string }[];
  organization?: Organization;
};

function profile(org: Organization) {
  const p = org.government_profile;
  return Array.isArray(p) ? p[0] : p;
}

export function GovernmentForm({ territories, governmentOptions, organization }: Props) {
  const router = useRouter();
  const gp = organization ? profile(organization) : null;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const data: GovernmentFormData = {
      name: fd.get("name") as string,
      legal_name: (fd.get("legal_name") as string) || undefined,
      website: (fd.get("website") as string) || undefined,
      headquarters_country: (fd.get("headquarters_country") as string) || undefined,
      headquarters_city: (fd.get("headquarters_city") as string) || undefined,
      territory_id: (fd.get("territory_id") as string) || undefined,
      status: fd.get("status") as GovernmentFormData["status"],
      tier: (fd.get("tier") as GovernmentFormData["tier"]) || undefined,
      description: (fd.get("description") as string) || undefined,
      government_level: fd.get("government_level") as GovernmentFormData["government_level"],
      entity_subtype: (fd.get("entity_subtype") as GovernmentFormData["entity_subtype"]) || undefined,
      jurisdiction: (fd.get("jurisdiction") as string) || undefined,
      parent_government_id: (fd.get("parent_government_id") as string) || undefined,
      resource_endowment: (fd.get("resource_endowment") as string) || undefined,
      engagement_priority: (fd.get("engagement_priority") as GovernmentFormData["engagement_priority"]) || undefined,
      regulatory_environment_notes: (fd.get("regulatory_environment_notes") as string) || undefined,
    };

    try {
      const res = organization
        ? await fetch(`/api/governments/${organization.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          })
        : await fetch("/api/governments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof payload.error === "string" ? payload.error : "Something went wrong"
        );
      }

      router.push(`/governments/${payload.id ?? organization?.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Organization</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Name" htmlFor="name" required>
            <Input id="name" name="name" required defaultValue={organization?.name} />
          </FormField>
          <FormField label="Legal Name" htmlFor="legal_name">
            <Input id="legal_name" name="legal_name" defaultValue={organization?.legal_name ?? ""} />
          </FormField>
          <FormField label="Website" htmlFor="website">
            <Input id="website" name="website" type="url" placeholder="https://" defaultValue={organization?.website ?? ""} />
          </FormField>
          <FormField label="Territory" htmlFor="territory_id">
            <Select id="territory_id" name="territory_id" defaultValue={organization?.territory_id ?? ""}>
              <option value="">Select territory</option>
              {territories.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Country" htmlFor="headquarters_country">
            <Input id="headquarters_country" name="headquarters_country" defaultValue={organization?.headquarters_country ?? ""} />
          </FormField>
          <FormField label="City" htmlFor="headquarters_city">
            <Input id="headquarters_city" name="headquarters_city" defaultValue={organization?.headquarters_city ?? ""} />
          </FormField>
          <FormField label="Status" htmlFor="status" required>
            <Select id="status" name="status" required defaultValue={organization?.status ?? "PROSPECT"}>
              {ORGANIZATION_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Tier" htmlFor="tier">
            <Select id="tier" name="tier" defaultValue={organization?.tier ?? ""}>
              <option value="">Not set</option>
              {ORGANIZATION_TIERS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Description" htmlFor="description" className="sm:col-span-2">
            <Textarea id="description" name="description" defaultValue={organization?.description ?? ""} />
          </FormField>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Government Profile</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Government Level" htmlFor="government_level" required>
            <Select id="government_level" name="government_level" required defaultValue={gp?.government_level ?? ""}>
              <option value="">Select level</option>
              {GOVERNMENT_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Entity Subtype" htmlFor="entity_subtype">
            <Select id="entity_subtype" name="entity_subtype" defaultValue={gp?.entity_subtype ?? ""}>
              <option value="">Not set</option>
              {GOVERNMENT_SUBTYPES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Jurisdiction" htmlFor="jurisdiction">
            <Input id="jurisdiction" name="jurisdiction" defaultValue={gp?.jurisdiction ?? ""} />
          </FormField>
          <FormField label="Parent Government" htmlFor="parent_government_id">
            <Select id="parent_government_id" name="parent_government_id" defaultValue={gp?.parent_government_id ?? ""}>
              <option value="">None</option>
              {governmentOptions
                .filter((g) => g.id !== organization?.id)
                .map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
            </Select>
          </FormField>
          <FormField label="Engagement Priority" htmlFor="engagement_priority">
            <Select id="engagement_priority" name="engagement_priority" defaultValue={gp?.engagement_priority ?? ""}>
              <option value="">Not set</option>
              {ENGAGEMENT_PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Resource Endowment" htmlFor="resource_endowment">
            <Input id="resource_endowment" name="resource_endowment" defaultValue={gp?.resource_endowment ?? ""} />
          </FormField>
          <FormField label="Regulatory Environment Notes" htmlFor="regulatory_environment_notes" className="sm:col-span-2">
            <Textarea id="regulatory_environment_notes" name="regulatory_environment_notes" defaultValue={gp?.regulatory_environment_notes ?? ""} />
          </FormField>
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : organization ? "Save Changes" : "Create Government"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
