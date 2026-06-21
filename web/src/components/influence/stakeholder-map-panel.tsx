"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/crm/form-field";
import { Badge } from "@/components/ui/badge";
import { upsertStakeholderMap, deleteStakeholderMap } from "@/lib/actions/influence";
import { UBUNTU_STANCES, labelFor, ubuntuStanceVariant } from "@/lib/constants/influence";
import type { StakeholderMap, UbuntuStance } from "@/types/influence";
import type { Contact } from "@/types/crm";
import { Plus, Trash2 } from "lucide-react";

export function StakeholderMapPanel({
  dealId,
  organizationId,
  maps,
  contacts,
  revalidatePaths = [],
}: {
  dealId: string;
  organizationId: string;
  maps: StakeholderMap[];
  contacts: Contact[];
  revalidatePaths?: string[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const mappedIds = new Set(maps.map((m) => m.contact_id));
  const available = contacts.filter((c) => !mappedIds.has(c.id));

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await upsertStakeholderMap(
        {
          deal_id: dealId,
          organization_id: organizationId,
          contact_id: fd.get("contact_id") as string,
          relationship_to_ubuntu: (fd.get("relationship_to_ubuntu") as UbuntuStance) || undefined,
          relationship_to_decision: (fd.get("relationship_to_decision") as string) || undefined,
          engagement_score: fd.get("engagement_score")
            ? Number(fd.get("engagement_score"))
            : undefined,
        },
        revalidatePaths
      );
      setShowForm(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove stakeholder mapping?")) return;
    await deleteStakeholderMap(id, revalidatePaths);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Deal Stakeholder Map</h3>
          <p className="text-xs text-gray-500">Ubuntu relationship per contact on this deal</p>
        </div>
        {!showForm && available.length > 0 && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Map Stakeholder
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="border-b border-gray-200 bg-gray-50 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Contact" htmlFor="contact_id" required>
              <Select id="contact_id" name="contact_id" required defaultValue="">
                <option value="" disabled>Select contact</option>
                {available.map((c) => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Ubuntu Stance" htmlFor="relationship_to_ubuntu">
              <Select id="relationship_to_ubuntu" name="relationship_to_ubuntu" defaultValue="">
                <option value="">Not set</option>
                {UBUNTU_STANCES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Relationship to Decision" htmlFor="relationship_to_decision">
              <Input id="relationship_to_decision" name="relationship_to_decision" />
            </FormField>
            <FormField label="Engagement Score (1–100)" htmlFor="engagement_score">
              <Input id="engagement_score" name="engagement_score" type="number" min={1} max={100} />
            </FormField>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" size="sm" disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {maps.length === 0 && !showForm ? (
        <div className="p-6 text-center text-sm text-gray-500">No stakeholders mapped on this deal yet.</div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {maps.map((m) => (
            <li key={m.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <span className="font-medium">{m.contact?.first_name} {m.contact?.last_name}</span>
                {m.contact?.title && <span className="ml-2 text-gray-500">{m.contact.title}</span>}
                <div className="mt-1 flex gap-2">
                  {m.relationship_to_ubuntu && (
                    <Badge variant={ubuntuStanceVariant(m.relationship_to_ubuntu)}>
                      {labelFor(UBUNTU_STANCES, m.relationship_to_ubuntu)}
                    </Badge>
                  )}
                  {m.engagement_score != null && (
                    <Badge variant="default">Engagement {m.engagement_score}</Badge>
                  )}
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-red-400" onClick={() => handleDelete(m.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
