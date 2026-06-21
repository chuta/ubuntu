"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createResourceAsset, deleteResourceAsset } from "@/lib/actions/tokenization";
import { ASSET_TYPES, DISCOVERY_STATUSES, labelFor } from "@/lib/constants/tokenization";
import type { ResourceAsset } from "@/types/tokenization";
import { formatCurrency } from "@/lib/utils";

export function ResourceAssetsPanel({
  projectId,
  assets,
}: {
  projectId: string;
  assets: ResourceAsset[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createResourceAsset(projectId, {
        asset_name: fd.get("asset_name") as string,
        asset_type: fd.get("asset_type") as ResourceAsset["asset_type"],
        estimated_reserves: (fd.get("estimated_reserves") as string) || undefined,
        valuation_amount: fd.get("valuation_amount") ? Number(fd.get("valuation_amount")) : undefined,
        valuation_date: (fd.get("valuation_date") as string) || undefined,
        valuation_source: (fd.get("valuation_source") as string) || undefined,
        location: (fd.get("location") as string) || undefined,
        discovery_status: (fd.get("discovery_status") as ResourceAsset["discovery_status"]) || undefined,
      });
      setShowForm(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add asset");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(assetId: string) {
    if (!confirm("Remove this resource asset?")) return;
    await deleteResourceAsset(assetId, projectId);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">Resource Assets</h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Asset"}
        </Button>
      </div>
      <div className="p-5">
        {showForm && (
          <form onSubmit={handleAdd} className="mb-4 grid gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 sm:grid-cols-2">
            <Input name="asset_name" placeholder="Asset name" required className="sm:col-span-2" />
            <Select name="asset_type" required defaultValue="">
              <option value="" disabled>Asset type</option>
              {ASSET_TYPES.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </Select>
            <Select name="discovery_status" defaultValue="">
              <option value="">Discovery status</option>
              {DISCOVERY_STATUSES.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </Select>
            <Input name="estimated_reserves" placeholder="Est. reserves" />
            <Input name="valuation_amount" type="number" placeholder="Valuation (USD)" />
            <Input name="valuation_date" type="date" />
            <Input name="valuation_source" placeholder="Valuation source" />
            <Input name="location" placeholder="Location" className="sm:col-span-2" />
            <Button type="submit" size="sm" disabled={loading} className="sm:col-span-2">Save Asset</Button>
          </form>
        )}

        {assets.length === 0 ? (
          <p className="text-sm text-gray-400">No resource assets registered.</p>
        ) : (
          <ul className="space-y-3">
            {assets.map((a) => (
              <li key={a.id} className="rounded-lg border border-gray-100 p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{a.asset_name}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant="gold">{labelFor(ASSET_TYPES, a.asset_type)}</Badge>
                      {a.discovery_status && (
                        <Badge variant="blue">{labelFor(DISCOVERY_STATUSES, a.discovery_status)}</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {a.location ?? "—"}
                      {a.valuation_amount != null && ` · ${formatCurrency(a.valuation_amount)}`}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(a.id)}>
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
