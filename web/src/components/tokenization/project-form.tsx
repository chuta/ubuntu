"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/crm/form-field";
import {
  createTokenizationProject,
  updateTokenizationProject,
  type TokenizationProjectFormData,
} from "@/lib/actions/tokenization";
import { ASSET_TYPES, B2G_PHASES, PROJECT_STATUSES } from "@/lib/constants/tokenization";
import type { TokenizationProject } from "@/types/tokenization";

type OrgOption = { id: string; name: string };
type DealOption = { id: string; name: string };

export function TokenizationProjectForm({
  organizations,
  deals,
  project,
}: {
  organizations: OrgOption[];
  deals: DealOption[];
  project?: TokenizationProject;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const data: TokenizationProjectFormData = {
      name: fd.get("name") as string,
      organization_id: fd.get("organization_id") as string,
      asset_type: fd.get("asset_type") as TokenizationProjectFormData["asset_type"],
      current_phase: (fd.get("current_phase") as TokenizationProjectFormData["current_phase"]) || undefined,
      estimated_asset_value: fd.get("estimated_asset_value") ? Number(fd.get("estimated_asset_value")) : undefined,
      tokenization_readiness_score: fd.get("tokenization_readiness_score") ? Number(fd.get("tokenization_readiness_score")) : undefined,
      opportunity_score: fd.get("opportunity_score") ? Number(fd.get("opportunity_score")) : undefined,
      jurisdiction: (fd.get("jurisdiction") as string) || undefined,
      status: (fd.get("status") as TokenizationProjectFormData["status"]) || undefined,
      description: (fd.get("description") as string) || undefined,
      deal_id: (fd.get("deal_id") as string) || undefined,
    };

    try {
      if (project) {
        await updateTokenizationProject(project.id, data);
        router.push(`/tokenization/${project.id}`);
      } else {
        const id = await createTokenizationProject(data);
        router.push(`/tokenization/${id}`);
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
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Project Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Project Name" htmlFor="name" required className="sm:col-span-2">
            <Input id="name" name="name" required defaultValue={project?.name} />
          </FormField>
          <FormField label="Government Organization" htmlFor="organization_id" required>
            <Select id="organization_id" name="organization_id" required defaultValue={project?.organization_id ?? ""}>
              <option value="" disabled>Select government</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Asset Type" htmlFor="asset_type" required>
            <Select id="asset_type" name="asset_type" required defaultValue={project?.asset_type ?? ""}>
              <option value="" disabled>Select asset type</option>
              {ASSET_TYPES.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="B2G Phase" htmlFor="current_phase">
            <Select id="current_phase" name="current_phase" defaultValue={project?.current_phase ?? "RESOURCE_DISCOVERY"}>
              {B2G_PHASES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Status" htmlFor="status">
            <Select id="status" name="status" defaultValue={project?.status ?? "PROSPECT"}>
              {PROJECT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Jurisdiction" htmlFor="jurisdiction">
            <Input id="jurisdiction" name="jurisdiction" defaultValue={project?.jurisdiction ?? ""} />
          </FormField>
          <FormField label="Est. Asset Value (USD)" htmlFor="estimated_asset_value">
            <Input id="estimated_asset_value" name="estimated_asset_value" type="number" min={0} step="0.01" defaultValue={project?.estimated_asset_value ?? ""} />
          </FormField>
          <FormField label="Readiness Score (1–100)" htmlFor="tokenization_readiness_score">
            <Input id="tokenization_readiness_score" name="tokenization_readiness_score" type="number" min={1} max={100} defaultValue={project?.tokenization_readiness_score ?? ""} />
          </FormField>
          <FormField label="Opportunity Score (1–100)" htmlFor="opportunity_score">
            <Input id="opportunity_score" name="opportunity_score" type="number" min={1} max={100} defaultValue={project?.opportunity_score ?? ""} />
          </FormField>
          <FormField label="Linked Deal" htmlFor="deal_id">
            <Select id="deal_id" name="deal_id" defaultValue={project?.deal_id ?? ""}>
              <option value="">None</option>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Description" htmlFor="description" className="sm:col-span-2">
            <Textarea id="description" name="description" rows={3} defaultValue={project?.description ?? ""} />
          </FormField>
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : project ? "Update Project" : "Create Project"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
