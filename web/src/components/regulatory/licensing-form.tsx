"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/crm/form-field";
import { RegulatorSelect } from "@/components/regulatory/regulator-select";
import { createLicensingConversation, updateLicensingConversation, type LicensingFormData } from "@/lib/actions/regulatory";
import { LICENSE_TYPES, LICENSING_STATUSES, type RegulatorOrganizationOption } from "@/lib/constants/regulatory";
import type { LicensingConversation } from "@/types/regulatory";
import type { Territory } from "@/types/crm";

export function LicensingForm({
  territories,
  organizations,
  contacts,
  deals,
  conversation,
}: {
  territories: Territory[];
  organizations: RegulatorOrganizationOption[];
  contacts: { id: string; first_name: string; last_name: string }[];
  deals: { id: string; name: string }[];
  conversation?: LicensingConversation;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const data: LicensingFormData = {
      title: fd.get("title") as string,
      license_type: fd.get("license_type") as LicensingFormData["license_type"],
      territory_id: fd.get("territory_id") as string,
      status: fd.get("status") as LicensingFormData["status"],
      regulator_organization_id: (fd.get("regulator_organization_id") as string) || undefined,
      target_timeline: (fd.get("target_timeline") as string) || undefined,
      primary_contact_id: (fd.get("primary_contact_id") as string) || undefined,
      deal_id: (fd.get("deal_id") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
    };
    try {
      if (conversation) {
        await updateLicensingConversation(conversation.id, data);
        router.push(`/regulatory/licensing/${conversation.id}`);
      } else {
        const id = await createLicensingConversation(data);
        router.push(`/regulatory/licensing/${id}`);
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
            <Input id="title" name="title" required defaultValue={conversation?.title} />
          </FormField>
          <FormField label="License Type" htmlFor="license_type" required>
            <Select id="license_type" name="license_type" required defaultValue={conversation?.license_type ?? ""}>
              <option value="" disabled>Select type</option>
              {LICENSE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Status" htmlFor="status" required>
            <Select id="status" name="status" required defaultValue={conversation?.status ?? "EXPLORING"}>
              {LICENSING_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Territory" htmlFor="territory_id" required>
            <Select id="territory_id" name="territory_id" required defaultValue={conversation?.territory_id ?? ""}>
              <option value="" disabled>Select territory</option>
              {territories.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Regulator" htmlFor="regulator_organization_id">
            <RegulatorSelect
              regulators={organizations}
              defaultValue={conversation?.regulator_organization_id ?? ""}
            />
          </FormField>
          <FormField label="Primary Contact" htmlFor="primary_contact_id">
            <Select id="primary_contact_id" name="primary_contact_id" defaultValue={conversation?.primary_contact_id ?? ""}>
              <option value="">None</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
            </Select>
          </FormField>
          <FormField label="Linked Deal" htmlFor="deal_id">
            <Select id="deal_id" name="deal_id" defaultValue={conversation?.deal_id ?? ""}>
              <option value="">None</option>
              {deals.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Target Timeline" htmlFor="target_timeline">
            <Input id="target_timeline" name="target_timeline" placeholder="Q3 2026" defaultValue={conversation?.target_timeline ?? ""} />
          </FormField>
          <FormField label="Notes" htmlFor="notes" className="sm:col-span-2">
            <Textarea id="notes" name="notes" rows={3} defaultValue={conversation?.notes ?? ""} />
          </FormField>
        </div>
      </section>
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : conversation ? "Update" : "Create"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
