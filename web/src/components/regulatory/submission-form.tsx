"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/crm/form-field";
import { RegulatorSelect } from "@/components/regulatory/regulator-select";
import {
  createSubmission,
  updateSubmission,
  type SubmissionFormData,
} from "@/lib/actions/regulatory";
import { SUBMISSION_TYPES, SUBMISSION_STATUSES, type RegulatorOrganizationOption } from "@/lib/constants/regulatory";
import type { RegulatorySubmission } from "@/types/regulatory";
import type { Territory } from "@/types/crm";

export function SubmissionForm({
  territories,
  organizations,
  deals,
  documents,
  submission,
}: {
  territories: Territory[];
  organizations: RegulatorOrganizationOption[];
  deals: { id: string; name: string }[];
  documents: { id: string; title: string }[];
  submission?: RegulatorySubmission;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const data: SubmissionFormData = {
      title: fd.get("title") as string,
      submission_type: fd.get("submission_type") as SubmissionFormData["submission_type"],
      territory_id: fd.get("territory_id") as string,
      status: fd.get("status") as SubmissionFormData["status"],
      regulator_organization_id: (fd.get("regulator_organization_id") as string) || undefined,
      submitted_at: (fd.get("submitted_at") as string) || undefined,
      reference_number: (fd.get("reference_number") as string) || undefined,
      document_id: (fd.get("document_id") as string) || undefined,
      deal_id: (fd.get("deal_id") as string) || undefined,
      response_summary: (fd.get("response_summary") as string) || undefined,
    };
    try {
      if (submission) {
        await updateSubmission(submission.id, data);
        router.push(`/regulatory/submissions/${submission.id}`);
      } else {
        const id = await createSubmission(data);
        router.push(`/regulatory/submissions/${id}`);
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
            <Input id="title" name="title" required defaultValue={submission?.title} />
          </FormField>
          <FormField label="Type" htmlFor="submission_type" required>
            <Select id="submission_type" name="submission_type" required defaultValue={submission?.submission_type ?? ""}>
              <option value="" disabled>Select type</option>
              {SUBMISSION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Status" htmlFor="status" required>
            <Select id="status" name="status" required defaultValue={submission?.status ?? "DRAFT"}>
              {SUBMISSION_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Territory" htmlFor="territory_id" required>
            <Select id="territory_id" name="territory_id" required defaultValue={submission?.territory_id ?? ""}>
              <option value="" disabled>Select territory</option>
              {territories.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Regulator" htmlFor="regulator_organization_id">
            <RegulatorSelect
              regulators={organizations}
              defaultValue={submission?.regulator_organization_id ?? ""}
            />
          </FormField>
          <FormField label="Submitted Date" htmlFor="submitted_at">
            <Input id="submitted_at" name="submitted_at" type="date" defaultValue={submission?.submitted_at?.slice(0, 10) ?? ""} />
          </FormField>
          <FormField label="Reference Number" htmlFor="reference_number">
            <Input id="reference_number" name="reference_number" defaultValue={submission?.reference_number ?? ""} />
          </FormField>
          <FormField label="Linked Document" htmlFor="document_id">
            <Select id="document_id" name="document_id" defaultValue={submission?.document_id ?? ""}>
              <option value="">None</option>
              {documents.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
            </Select>
          </FormField>
          <FormField label="Linked Deal" htmlFor="deal_id">
            <Select id="deal_id" name="deal_id" defaultValue={submission?.deal_id ?? ""}>
              <option value="">None</option>
              {deals.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Response Summary" htmlFor="response_summary" className="sm:col-span-2">
            <Textarea id="response_summary" name="response_summary" rows={3} defaultValue={submission?.response_summary ?? ""} />
          </FormField>
        </div>
      </section>
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : submission ? "Update" : "Create Submission"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
