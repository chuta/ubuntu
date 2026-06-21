"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/crm/form-field";
import { createRequirement, updateRequirement, type RequirementFormData } from "@/lib/actions/regulatory";
import { REQUIREMENT_CATEGORIES, COMPLIANCE_STATUSES } from "@/lib/constants/regulatory";
import type { RegulatoryRequirement } from "@/types/regulatory";
import type { Territory } from "@/types/crm";

export function RequirementForm({
  territories,
  products,
  documents,
  requirement,
}: {
  territories: Territory[];
  products: { id: string; name: string; code: string }[];
  documents: { id: string; title: string }[];
  requirement?: RegulatoryRequirement;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const data: RequirementFormData = {
      title: fd.get("title") as string,
      territory_id: fd.get("territory_id") as string,
      category: fd.get("category") as RequirementFormData["category"],
      compliance_status: fd.get("compliance_status") as RequirementFormData["compliance_status"],
      description: (fd.get("description") as string) || undefined,
      product_id: (fd.get("product_id") as string) || undefined,
      due_date: (fd.get("due_date") as string) || undefined,
      evidence_document_id: (fd.get("evidence_document_id") as string) || undefined,
    };
    try {
      if (requirement) {
        await updateRequirement(requirement.id, data);
        router.push(`/regulatory/requirements/${requirement.id}`);
      } else {
        const id = await createRequirement(data);
        router.push(`/regulatory/requirements/${id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Title" htmlFor="title" required className="sm:col-span-2">
            <Input id="title" name="title" required defaultValue={requirement?.title} />
          </FormField>
          <FormField label="Category" htmlFor="category" required>
            <Select id="category" name="category" required defaultValue={requirement?.category ?? ""}>
              <option value="" disabled>Select category</option>
              {REQUIREMENT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Compliance Status" htmlFor="compliance_status" required>
            <Select id="compliance_status" name="compliance_status" required defaultValue={requirement?.compliance_status ?? "IDENTIFIED"}>
              {COMPLIANCE_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Territory" htmlFor="territory_id" required>
            <Select id="territory_id" name="territory_id" required defaultValue={requirement?.territory_id ?? ""}>
              <option value="" disabled>Select territory</option>
              {territories.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Product" htmlFor="product_id">
            <Select id="product_id" name="product_id" defaultValue={requirement?.product_id ?? ""}>
              <option value="">None</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Due Date" htmlFor="due_date">
            <Input id="due_date" name="due_date" type="date" defaultValue={requirement?.due_date?.slice(0, 10) ?? ""} />
          </FormField>
          <FormField label="Evidence Document" htmlFor="evidence_document_id">
            <Select id="evidence_document_id" name="evidence_document_id" defaultValue={requirement?.evidence_document_id ?? ""}>
              <option value="">None</option>
              {documents.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
            </Select>
          </FormField>
          <FormField label="Description" htmlFor="description" className="sm:col-span-2">
            <Textarea id="description" name="description" rows={4} defaultValue={requirement?.description ?? ""} />
          </FormField>
        </div>
      </section>
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : requirement ? "Update" : "Create Requirement"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
