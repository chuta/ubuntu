"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/crm/form-field";
import { Badge } from "@/components/ui/badge";
import { updateContactInfluence } from "@/lib/actions/influence";
import { PositionHistoryPanel } from "@/components/influence/position-history-panel";
import { INFLUENCE_LEVELS, labelFor } from "@/lib/constants/organizations";
import type { Contact } from "@/types/crm";
import type { ContactPositionHistory } from "@/types/influence";
import type { InfluenceLevel } from "@/types/crm";
import { ChevronDown, ChevronUp } from "lucide-react";

type OrgOption = { id: string; name: string };

export function ContactInfluenceSection({
  contacts,
  positionsByContact,
  organizations,
  revalidatePaths = [],
}: {
  contacts: Contact[];
  positionsByContact: Record<string, ContactPositionHistory[]>;
  organizations: OrgOption[];
  revalidatePaths?: string[];
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  async function saveInfluence(contactId: string, fd: FormData) {
    setSaving(contactId);
    try {
      await updateContactInfluence(
        contactId,
        {
          influence_level: (fd.get("influence_level") as InfluenceLevel) || undefined,
          current_influence_score: fd.get("current_influence_score")
            ? Number(fd.get("current_influence_score"))
            : null,
        },
        revalidatePaths
      );
      router.refresh();
    } finally {
      setSaving(null);
    }
  }

  if (contacts.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">Contact Influence & Career</h3>
        <p className="text-xs text-gray-500">Influence scores, position history, and relationship mapping</p>
      </div>
      <ul className="divide-y divide-gray-100">
        {contacts.map((c) => {
          const isOpen = expanded === c.id;
          const positions = positionsByContact[c.id] ?? [];
          return (
            <li key={c.id} className="px-5 py-4">
              <button
                type="button"
                className="flex w-full items-center justify-between text-left"
                onClick={() => setExpanded(isOpen ? null : c.id)}
              >
                <div>
                  <span className="font-medium text-gray-900">{c.first_name} {c.last_name}</span>
                  {c.title && <span className="ml-2 text-sm text-gray-500">{c.title}</span>}
                  <div className="mt-1 flex gap-2">
                    {c.influence_level && (
                      <Badge variant="purple">{labelFor(INFLUENCE_LEVELS, c.influence_level)} influence</Badge>
                    )}
                    {c.current_influence_score != null && (
                      <Badge variant="gold">Score {c.current_influence_score}</Badge>
                    )}
                    {positions.length > 0 && (
                      <Badge variant="default">{positions.length} role{positions.length !== 1 ? "s" : ""}</Badge>
                    )}
                  </div>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>

              {isOpen && (
                <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveInfluence(c.id, new FormData(e.currentTarget));
                    }}
                    className="grid gap-3 sm:grid-cols-3"
                  >
                    <FormField label="Influence Tier" htmlFor={`tier-${c.id}`}>
                      <Select
                        id={`tier-${c.id}`}
                        name="influence_level"
                        defaultValue={c.influence_level ?? ""}
                      >
                        <option value="">Not set</option>
                        {INFLUENCE_LEVELS.map((l) => (
                          <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                      </Select>
                    </FormField>
                    <FormField label="Influence Score (1–100)" htmlFor={`score-${c.id}`}>
                      <Input
                        id={`score-${c.id}`}
                        name="current_influence_score"
                        type="number"
                        min={1}
                        max={100}
                        defaultValue={c.current_influence_score ?? ""}
                      />
                    </FormField>
                    <div className="flex items-end">
                      <Button type="submit" size="sm" disabled={saving === c.id}>
                        {saving === c.id ? "Saving…" : "Save Influence"}
                      </Button>
                    </div>
                  </form>

                  <PositionHistoryPanel
                    contactId={c.id}
                    positions={positions}
                    organizations={organizations}
                    revalidatePaths={revalidatePaths}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
