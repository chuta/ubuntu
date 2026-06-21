"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/crm/form-field";
import { createDeal, updateDeal, type DealFormData } from "@/lib/actions/deals";
import {
  CUSTOMER_SEGMENTS,
  DEAL_PRIORITIES,
  DEAL_SOURCES,
  DEAL_STAGES,
  REVENUE_ENGINES,
  defaultProbability,
} from "@/lib/constants/deals";
import type { Deal, Product } from "@/types/pipeline";

type OrgOption = { id: string; name: string; segment: string };

export function DealForm({
  organizations,
  products,
  deal,
}: {
  organizations: OrgOption[];
  products: Product[];
  deal?: Deal;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(deal?.stage ?? "LEAD");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const value = fd.get("estimated_value") as string;
    const prob = fd.get("probability") as string;

    const data: DealFormData = {
      name: fd.get("name") as string,
      organization_id: fd.get("organization_id") as string,
      segment: fd.get("segment") as DealFormData["segment"],
      revenue_engine: fd.get("revenue_engine") as DealFormData["revenue_engine"],
      product_id: (fd.get("product_id") as string) || undefined,
      stage: fd.get("stage") as DealFormData["stage"],
      probability: prob ? Number(prob) : undefined,
      estimated_value: value ? Number(value) : undefined,
      expected_close_date: (fd.get("expected_close_date") as string) || undefined,
      source: (fd.get("source") as DealFormData["source"]) || undefined,
      priority: (fd.get("priority") as DealFormData["priority"]) || undefined,
      next_step: (fd.get("next_step") as string) || undefined,
      next_step_date: (fd.get("next_step_date") as string) || undefined,
      description: (fd.get("description") as string) || undefined,
    };

    try {
      if (deal) {
        await updateDeal(deal.id, data);
        router.push(`/pipeline/${deal.id}`);
      } else {
        const id = await createDeal(data);
        router.push(`/pipeline/${id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  function handleOrgChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const org = organizations.find((o) => o.id === e.target.value);
    if (org) {
      const segmentSelect = document.getElementById("segment") as HTMLSelectElement | null;
      if (segmentSelect) segmentSelect.value = org.segment;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Deal Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Deal Name" htmlFor="name" required className="sm:col-span-2">
            <Input id="name" name="name" required defaultValue={deal?.name} />
          </FormField>
          <FormField label="Organization" htmlFor="organization_id" required>
            <Select id="organization_id" name="organization_id" required defaultValue={deal?.organization_id ?? ""} onChange={handleOrgChange}>
              <option value="">Select organization</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Segment" htmlFor="segment" required>
            <Select id="segment" name="segment" required defaultValue={deal?.segment ?? "B2G"}>
              {CUSTOMER_SEGMENTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Revenue Engine" htmlFor="revenue_engine" required>
            <Select id="revenue_engine" name="revenue_engine" required defaultValue={deal?.revenue_engine ?? ""}>
              <option value="">Select engine</option>
              {REVENUE_ENGINES.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Product" htmlFor="product_id">
            <Select id="product_id" name="product_id" defaultValue={deal?.product_id ?? ""}>
              <option value="">Not set</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Stage" htmlFor="stage" required>
            <Select
              id="stage"
              name="stage"
              required
              value={stage}
              onChange={(e) => setStage(e.target.value as typeof stage)}
            >
              {DEAL_STAGES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Estimated Value (USD)" htmlFor="estimated_value">
            <Input id="estimated_value" name="estimated_value" type="number" min="0" defaultValue={deal?.estimated_value ?? ""} />
          </FormField>
          <FormField label="Probability (%)" htmlFor="probability">
            <Input
              id="probability"
              name="probability"
              type="number"
              min="0"
              max="100"
              defaultValue={deal?.probability ?? defaultProbability(stage)}
              key={stage}
            />
          </FormField>
          <FormField label="Expected Close Date" htmlFor="expected_close_date">
            <Input id="expected_close_date" name="expected_close_date" type="date" defaultValue={deal?.expected_close_date ?? ""} />
          </FormField>
          <FormField label="Source" htmlFor="source">
            <Select id="source" name="source" defaultValue={deal?.source ?? ""}>
              <option value="">Not set</option>
              {DEAL_SOURCES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Priority" htmlFor="priority">
            <Select id="priority" name="priority" defaultValue={deal?.priority ?? ""}>
              <option value="">Not set</option>
              {DEAL_PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Next Step" htmlFor="next_step">
            <Input id="next_step" name="next_step" defaultValue={deal?.next_step ?? ""} />
          </FormField>
          <FormField label="Next Step Date" htmlFor="next_step_date">
            <Input id="next_step_date" name="next_step_date" type="date" defaultValue={deal?.next_step_date ?? ""} />
          </FormField>
          <FormField label="Description" htmlFor="description" className="sm:col-span-2">
            <Textarea id="description" name="description" defaultValue={deal?.description ?? ""} />
          </FormField>
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : deal ? "Save Changes" : "Create Deal"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
