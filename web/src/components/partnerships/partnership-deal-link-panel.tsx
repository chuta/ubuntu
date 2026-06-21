"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { linkPartnershipDeal } from "@/lib/actions/partnerships";
import { stageLabel } from "@/lib/constants/deals";
import { formatCurrency } from "@/lib/utils";
import type { Partnership } from "@/types/partnerships";
import { GitBranch } from "lucide-react";

type DealOption = { id: string; name: string; stage: string; estimated_value?: number | null };

function linkedDeal(deal: Partnership["deal"]) {
  if (!deal) return null;
  return Array.isArray(deal) ? deal[0] : deal;
}

export function PartnershipDealLinkPanel({
  partnership,
  deals,
}: {
  partnership: Partnership;
  deals: DealOption[];
}) {
  const router = useRouter();
  const current = linkedDeal(partnership.deal);
  const [dealId, setDealId] = useState(partnership.deal_id ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await linkPartnershipDeal(partnership.id, dealId || null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to link deal");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlink() {
    if (!confirm("Unlink this deal from the partnership?")) return;
    setLoading(true);
    try {
      await linkPartnershipDeal(partnership.id, null);
      setDealId("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">Deal Link</h3>
        <p className="text-xs text-gray-500">Bidirectional link between partnership and pipeline deal</p>
      </div>
      <div className="p-5">
        {current && (
          <div className="mb-4 rounded-lg border border-brand-purple/20 bg-brand-purple/5 p-4">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-brand-purple" />
              <Link href={`/pipeline/${current.id}`} className="font-medium text-brand-purple hover:underline">
                {current.name}
              </Link>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {stageLabel(current.stage)}
              {current.estimated_value ? ` · ${formatCurrency(current.estimated_value)}` : ""}
            </p>
          </div>
        )}
        <Select value={dealId} onChange={(e) => setDealId(e.target.value)}>
          <option value="">Select deal to link…</option>
          {deals.map((d) => (
            <option key={d.id} value={d.id}>{d.name} ({d.stage})</option>
          ))}
        </Select>
        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={loading}>
            {loading ? "Saving…" : "Save Link"}
          </Button>
          {current && (
            <Button size="sm" variant="outline" onClick={handleUnlink} disabled={loading}>
              Unlink
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
