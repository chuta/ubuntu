"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/crm/form-field";
import type { AccountFormData } from "@/lib/actions/accounts";
import {
  ACCOUNT_SUBTYPES,
  GIFT_ADOPTION,
  ORGANIZATION_STATUSES,
  ORGANIZATION_TIERS,
  TREASURY_INTEREST,
  WALLET_INTEGRATION,
} from "@/lib/constants/organizations";
import type { Organization, Territory } from "@/types/crm";

type Props = {
  territories: Territory[];
  organization?: Organization;
};

function profile(org: Organization) {
  const p = org.account_profile;
  return Array.isArray(p) ? p[0] : p;
}

export function AccountForm({ territories, organization }: Props) {
  const router = useRouter();
  const ap = organization ? profile(organization) : null;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const rev = fd.get("annual_revenue_potential") as string;
    const cycle = fd.get("decision_cycle_months") as string;

    const data: AccountFormData = {
      name: fd.get("name") as string,
      legal_name: (fd.get("legal_name") as string) || undefined,
      website: (fd.get("website") as string) || undefined,
      headquarters_country: (fd.get("headquarters_country") as string) || undefined,
      headquarters_city: (fd.get("headquarters_city") as string) || undefined,
      territory_id: (fd.get("territory_id") as string) || undefined,
      status: fd.get("status") as AccountFormData["status"],
      tier: (fd.get("tier") as AccountFormData["tier"]) || undefined,
      description: (fd.get("description") as string) || undefined,
      account_subtype: fd.get("account_subtype") as AccountFormData["account_subtype"],
      aum_range: (fd.get("aum_range") as string) || undefined,
      treasury_interest_level: (fd.get("treasury_interest_level") as AccountFormData["treasury_interest_level"]) || undefined,
      gift_adoption_status: (fd.get("gift_adoption_status") as AccountFormData["gift_adoption_status"]) || undefined,
      wallet_integration_status: (fd.get("wallet_integration_status") as AccountFormData["wallet_integration_status"]) || undefined,
      annual_revenue_potential: rev ? Number(rev) : undefined,
      decision_cycle_months: cycle ? Number(cycle) : undefined,
    };

    try {
      const res = organization
        ? await fetch(`/api/accounts/${organization.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          })
        : await fetch("/api/accounts", {
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

      router.push(`/accounts/${payload.id ?? organization?.id}`);
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
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Account Profile</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Account Type" htmlFor="account_subtype" required>
            <Select id="account_subtype" name="account_subtype" required defaultValue={ap?.account_subtype ?? ""}>
              <option value="">Select type</option>
              {ACCOUNT_SUBTYPES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="AUM Range" htmlFor="aum_range">
            <Input id="aum_range" name="aum_range" placeholder="e.g. $100M–$500M" defaultValue={ap?.aum_range ?? ""} />
          </FormField>
          <FormField label="Treasury Interest" htmlFor="treasury_interest_level">
            <Select id="treasury_interest_level" name="treasury_interest_level" defaultValue={ap?.treasury_interest_level ?? ""}>
              <option value="">Not set</option>
              {TREASURY_INTEREST.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="GIFT Adoption" htmlFor="gift_adoption_status">
            <Select id="gift_adoption_status" name="gift_adoption_status" defaultValue={ap?.gift_adoption_status ?? ""}>
              <option value="">Not set</option>
              {GIFT_ADOPTION.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Wallet Integration" htmlFor="wallet_integration_status">
            <Select id="wallet_integration_status" name="wallet_integration_status" defaultValue={ap?.wallet_integration_status ?? ""}>
              <option value="">Not set</option>
              {WALLET_INTEGRATION.map((w) => (
                <option key={w.value} value={w.value}>{w.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Annual Revenue Potential (USD)" htmlFor="annual_revenue_potential">
            <Input id="annual_revenue_potential" name="annual_revenue_potential" type="number" min="0" defaultValue={ap?.annual_revenue_potential ?? ""} />
          </FormField>
          <FormField label="Decision Cycle (months)" htmlFor="decision_cycle_months">
            <Input id="decision_cycle_months" name="decision_cycle_months" type="number" min="0" defaultValue={ap?.decision_cycle_months ?? ""} />
          </FormField>
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : organization ? "Save Changes" : "Create Account"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
