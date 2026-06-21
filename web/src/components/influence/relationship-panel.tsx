"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/crm/form-field";
import { Badge } from "@/components/ui/badge";
import {
  createRelationship,
  deleteRelationship,
  verifyRelationship,
} from "@/lib/actions/influence";
import {
  RELATIONSHIP_TYPES,
  UBUNTU_STANCES,
  STRENGTH_OPTIONS,
  labelFor,
  isRelationshipStale,
  ubuntuStanceVariant,
} from "@/lib/constants/influence";
import type { InfluenceRelationship, InfluenceRelationshipType, UbuntuStance } from "@/types/influence";
import { Plus, Trash2, CheckCircle } from "lucide-react";

type ContactOption = {
  id: string;
  first_name: string;
  last_name: string;
  organization_id: string;
};

export function RelationshipPanel({
  relationships,
  contacts,
  dealId,
  organizationId,
  revalidatePaths = [],
}: {
  relationships: InfluenceRelationship[];
  contacts: ContactOption[];
  dealId?: string;
  organizationId?: string;
  revalidatePaths?: string[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      await createRelationship(
        {
          source_contact_id: fd.get("source_contact_id") as string,
          target_contact_id: fd.get("target_contact_id") as string,
          relationship_type: fd.get("relationship_type") as InfluenceRelationshipType,
          strength: Number(fd.get("strength")),
          relationship_to_ubuntu: (fd.get("relationship_to_ubuntu") as UbuntuStance) || undefined,
          notes: (fd.get("notes") as string) || undefined,
          deal_id: dealId,
          organization_id: organizationId,
        },
        revalidatePaths
      );
      setShowForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create relationship");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this relationship?")) return;
    await deleteRelationship(id, revalidatePaths);
    router.refresh();
  }

  async function handleVerify(id: string) {
    await verifyRelationship(id, revalidatePaths);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Influence Relationships</h3>
          <p className="text-xs text-gray-500">{relationships.length} mapped</p>
        </div>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Relationship
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="border-b border-gray-200 bg-gray-50 p-5">
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="From (Source)" htmlFor="source_contact_id" required>
              <Select id="source_contact_id" name="source_contact_id" required defaultValue="">
                <option value="" disabled>Select contact</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="To (Target)" htmlFor="target_contact_id" required>
              <Select id="target_contact_id" name="target_contact_id" required defaultValue="">
                <option value="" disabled>Select contact</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Type" htmlFor="relationship_type" required>
              <Select id="relationship_type" name="relationship_type" required defaultValue="INFLUENCES">
                {RELATIONSHIP_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Strength (1–5)" htmlFor="strength" required>
              <Select id="strength" name="strength" required defaultValue="3">
                {STRENGTH_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
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
            <FormField label="Notes" htmlFor="notes" className="sm:col-span-2">
              <Textarea id="notes" name="notes" rows={2} />
            </FormField>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" size="sm" disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {relationships.length === 0 && !showForm ? (
        <div className="p-8 text-center text-sm text-gray-500">No relationships mapped yet.</div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {relationships.map((r) => (
            <li key={r.id} className="flex items-start justify-between gap-4 px-5 py-4 text-sm">
              <div>
                <p className="font-medium text-gray-900">
                  {r.source?.first_name} {r.source?.last_name}
                  <span className="mx-1 text-gray-400">→</span>
                  {r.target?.first_name} {r.target?.last_name}
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Badge variant="purple">{labelFor(RELATIONSHIP_TYPES, r.relationship_type)}</Badge>
                  <Badge variant="default">Strength {r.strength}</Badge>
                  {r.relationship_to_ubuntu && (
                    <Badge variant={ubuntuStanceVariant(r.relationship_to_ubuntu)}>
                      {labelFor(UBUNTU_STANCES, r.relationship_to_ubuntu)}
                    </Badge>
                  )}
                  {isRelationshipStale(r.last_verified_at) && (
                    <Badge variant="gold">Stale — verify</Badge>
                  )}
                </div>
                {r.notes && <p className="mt-1 text-xs text-gray-500">{r.notes}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button size="sm" variant="ghost" title="Mark verified" onClick={() => handleVerify(r.id)}>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </Button>
                <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
