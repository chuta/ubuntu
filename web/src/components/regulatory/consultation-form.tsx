"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/crm/form-field";
import { RegulatorSelect } from "@/components/regulatory/regulator-select";
import { createConsultation, updateConsultation, type ConsultationFormData } from "@/lib/actions/regulatory";
import { CONSULTATION_RESPONSE_STATUSES, type RegulatorOrganizationOption } from "@/lib/constants/regulatory";
import type { RegulatoryConsultation } from "@/types/regulatory";
import type { Territory } from "@/types/crm";

export function ConsultationForm({
  territories,
  organizations,
  documents,
  consultation,
}: {
  territories: Territory[];
  organizations: RegulatorOrganizationOption[];
  documents: { id: string; title: string }[];
  consultation?: RegulatoryConsultation;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const data: ConsultationFormData = {
      title: fd.get("title") as string,
      territory_id: fd.get("territory_id") as string,
      response_status: fd.get("response_status") as ConsultationFormData["response_status"],
      regulator_organization_id: (fd.get("regulator_organization_id") as string) || undefined,
      published_date: (fd.get("published_date") as string) || undefined,
      response_deadline: (fd.get("response_deadline") as string) || undefined,
      consultation_url: (fd.get("consultation_url") as string) || undefined,
      our_response_document_id: (fd.get("our_response_document_id") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
    };
    try {
      if (consultation) {
        await updateConsultation(consultation.id, data);
        router.push(`/regulatory/consultations/${consultation.id}`);
      } else {
        const id = await createConsultation(data);
        router.push(`/regulatory/consultations/${id}`);
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
            <Input id="title" name="title" required defaultValue={consultation?.title} />
          </FormField>
          <FormField label="Territory" htmlFor="territory_id" required>
            <Select id="territory_id" name="territory_id" required defaultValue={consultation?.territory_id ?? ""}>
              <option value="" disabled>Select territory</option>
              {territories.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Response Status" htmlFor="response_status" required>
            <Select id="response_status" name="response_status" required defaultValue={consultation?.response_status ?? "NOT_STARTED"}>
              {CONSULTATION_RESPONSE_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Regulator" htmlFor="regulator_organization_id">
            <RegulatorSelect
              regulators={organizations}
              defaultValue={consultation?.regulator_organization_id ?? ""}
            />
          </FormField>
          <FormField label="Published Date" htmlFor="published_date">
            <Input id="published_date" name="published_date" type="date" defaultValue={consultation?.published_date?.slice(0, 10) ?? ""} />
          </FormField>
          <FormField label="Response Deadline" htmlFor="response_deadline">
            <Input id="response_deadline" name="response_deadline" type="date" defaultValue={consultation?.response_deadline?.slice(0, 10) ?? ""} />
          </FormField>
          <FormField label="Consultation URL" htmlFor="consultation_url" className="sm:col-span-2">
            <Input id="consultation_url" name="consultation_url" type="url" defaultValue={consultation?.consultation_url ?? ""} />
          </FormField>
          <FormField label="Our Response Document" htmlFor="our_response_document_id">
            <Select id="our_response_document_id" name="our_response_document_id" defaultValue={consultation?.our_response_document_id ?? ""}>
              <option value="">None</option>
              {documents.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
            </Select>
          </FormField>
          <FormField label="Notes" htmlFor="notes" className="sm:col-span-2">
            <Textarea id="notes" name="notes" rows={3} defaultValue={consultation?.notes ?? ""} />
          </FormField>
        </div>
      </section>
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : consultation ? "Update" : "Create Consultation"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
