"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/crm/form-field";
import {
  createPartnership,
  updatePartnership,
  type PartnershipFormData,
} from "@/lib/actions/partnerships";
import { PARTNERSHIP_STATUSES, PARTNERSHIP_TYPES } from "@/lib/constants/partnerships";
import type { Partnership } from "@/types/partnerships";

type OrgOption = { id: string; name: string };
type DealOption = { id: string; name: string; stage: string };

export function PartnershipForm({
  organizations,
  deals,
  partnership,
}: {
  organizations: OrgOption[];
  deals: DealOption[];
  partnership?: Partnership;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const data: PartnershipFormData = {
      name: fd.get("name") as string,
      partnership_type: fd.get("partnership_type") as PartnershipFormData["partnership_type"],
      status: fd.get("status") as PartnershipFormData["status"],
      primary_partner_id: fd.get("primary_partner_id") as string,
      start_date: (fd.get("start_date") as string) || undefined,
      end_date: (fd.get("end_date") as string) || undefined,
      revenue_share_terms: (fd.get("revenue_share_terms") as string) || undefined,
      strategic_objectives: (fd.get("strategic_objectives") as string) || undefined,
      deal_id: (fd.get("deal_id") as string) || undefined,
    };

    try {
      if (partnership) {
        await updatePartnership(partnership.id, data);
        router.push(`/partnerships/${partnership.id}`);
      } else {
        const id = await createPartnership(data);
        router.push(`/partnerships/${id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Partnership Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Partnership Name" htmlFor="name" required className="sm:col-span-2">
            <Input id="name" name="name" required defaultValue={partnership?.name} />
          </FormField>
          <FormField label="Type" htmlFor="partnership_type" required>
            <Select id="partnership_type" name="partnership_type" required defaultValue={partnership?.partnership_type ?? ""}>
              <option value="">Select type</option>
              {PARTNERSHIP_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Status" htmlFor="status" required>
            <Select id="status" name="status" required defaultValue={partnership?.status ?? "DISCUSSION"}>
              {PARTNERSHIP_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Primary Partner" htmlFor="primary_partner_id" required className="sm:col-span-2">
            <Select id="primary_partner_id" name="primary_partner_id" required defaultValue={partnership?.primary_partner_id ?? ""}>
              <option value="">Select organization</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Start Date" htmlFor="start_date">
            <Input id="start_date" name="start_date" type="date" defaultValue={partnership?.start_date ?? ""} />
          </FormField>
          <FormField label="End Date" htmlFor="end_date">
            <Input id="end_date" name="end_date" type="date" defaultValue={partnership?.end_date ?? ""} />
          </FormField>
          <FormField label="Linked Deal (optional)" htmlFor="deal_id" className="sm:col-span-2">
            <Select id="deal_id" name="deal_id" defaultValue={partnership?.deal_id ?? ""}>
              <option value="">No deal linked</option>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.stage})</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Revenue Share Terms" htmlFor="revenue_share_terms" className="sm:col-span-2">
            <Textarea id="revenue_share_terms" name="revenue_share_terms" defaultValue={partnership?.revenue_share_terms ?? ""} />
          </FormField>
          <FormField label="Strategic Objectives" htmlFor="strategic_objectives" className="sm:col-span-2">
            <Textarea id="strategic_objectives" name="strategic_objectives" defaultValue={partnership?.strategic_objectives ?? ""} />
          </FormField>
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : partnership ? "Save Changes" : "Create Partnership"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
