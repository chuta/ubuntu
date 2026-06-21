"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/crm/form-field";
import { addPartnershipMember, removePartnershipMember } from "@/lib/actions/partnerships";
import type { PartnershipMember } from "@/types/partnerships";
import { Plus, Trash2 } from "lucide-react";

type OrgOption = { id: string; name: string };

function orgName(member: PartnershipMember) {
  const org = member.organization;
  if (!org) return "—";
  return Array.isArray(org) ? org[0]?.name ?? "—" : org.name;
}

export function PartnershipMembersPanel({
  partnershipId,
  members,
  organizations,
}: {
  partnershipId: string;
  members: PartnershipMember[];
  organizations: OrgOption[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const memberOrgIds = new Set(members.map((m) => m.organization_id));
  const availableOrgs = organizations.filter((o) => !memberOrgIds.has(o.id));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await addPartnershipMember(
        partnershipId,
        fd.get("organization_id") as string,
        (fd.get("role_in_partnership") as string) || undefined
      );
      setShowForm(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(memberId: string) {
    if (!confirm("Remove this member?")) return;
    await removePartnershipMember(memberId, partnershipId);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Additional Partners</h3>
          <p className="text-xs text-gray-500">Multi-party partnership members</p>
        </div>
        {!showForm && availableOrgs.length > 0 && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Member
          </Button>
        )}
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="border-b border-gray-200 bg-gray-50 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Organization" htmlFor="organization_id" required>
              <Select id="organization_id" name="organization_id" required>
                {availableOrgs.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Role" htmlFor="role_in_partnership">
              <Input id="role_in_partnership" name="role_in_partnership" placeholder="e.g. Technology Provider" />
            </FormField>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" size="sm" disabled={loading}>{loading ? "Adding…" : "Add"}</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}
      {members.length === 0 && !showForm ? (
        <p className="p-8 text-center text-sm text-gray-500">No additional partners yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-gray-900">{orgName(m)}</p>
                {m.role_in_partnership && <p className="text-xs text-gray-500">{m.role_in_partnership}</p>}
              </div>
              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-600" onClick={() => handleRemove(m.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
