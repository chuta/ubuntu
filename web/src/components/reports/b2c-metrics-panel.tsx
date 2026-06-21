"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { upsertB2cMetrics } from "@/lib/actions/reports";
import type { B2cCampaignMetric } from "@/types/reports";
import { formatCurrency } from "@/lib/utils";

export function B2cMetricsPanel({
  metric,
  periodFrom,
  periodTo,
  readOnly,
}: {
  metric: B2cCampaignMetric | null;
  periodFrom: string;
  periodTo: string;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await upsertB2cMetrics({
        period_start: fd.get("period_start") as string,
        period_end: fd.get("period_end") as string,
        campaign_name: (fd.get("campaign_name") as string) || undefined,
        new_users: fd.get("new_users") ? Number(fd.get("new_users")) : undefined,
        wallet_downloads: fd.get("wallet_downloads") ? Number(fd.get("wallet_downloads")) : undefined,
        gift_purchases_usd: fd.get("gift_purchases_usd") ? Number(fd.get("gift_purchases_usd")) : undefined,
        notes: (fd.get("notes") as string) || undefined,
      });
      setEditing(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">B2C Campaign Metrics</h3>
          <p className="text-xs text-gray-500">Manual entry — GIFT adoption &amp; wallet metrics</p>
        </div>
        {!readOnly && (
          <Button size="sm" variant="outline" onClick={() => setEditing(!editing)}>
            {editing ? "Cancel" : metric ? "Edit" : "Add Metrics"}
          </Button>
        )}
      </div>
      <div className="p-5">
        {editing ? (
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <Input name="period_start" type="date" required defaultValue={metric?.period_start ?? periodFrom} />
            <Input name="period_end" type="date" required defaultValue={metric?.period_end ?? periodTo} />
            <Input name="campaign_name" placeholder="Campaign name" className="sm:col-span-2" defaultValue={metric?.campaign_name ?? "B2C GIFT Adoption"} />
            <Input name="new_users" type="number" placeholder="New users" defaultValue={metric?.new_users ?? ""} />
            <Input name="wallet_downloads" type="number" placeholder="Wallet downloads" defaultValue={metric?.wallet_downloads ?? ""} />
            <Input name="gift_purchases_usd" type="number" step="0.01" placeholder="GIFT purchases (USD)" className="sm:col-span-2" defaultValue={metric?.gift_purchases_usd ?? ""} />
            <Textarea name="notes" rows={2} placeholder="Notes" className="sm:col-span-2" defaultValue={metric?.notes ?? ""} />
            <Button type="submit" size="sm" disabled={loading} className="sm:col-span-2">Save Metrics</Button>
          </form>
        ) : metric ? (
          <dl className="grid gap-3 sm:grid-cols-3 text-sm">
            <div>
              <dt className="text-xs text-gray-500">New Users</dt>
              <dd className="font-medium">{metric.new_users ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Wallet Downloads</dt>
              <dd className="font-medium">{metric.wallet_downloads ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">GIFT Purchases</dt>
              <dd className="font-medium text-brand-gold">
                {metric.gift_purchases_usd != null ? formatCurrency(Number(metric.gift_purchases_usd)) : "—"}
              </dd>
            </div>
            {metric.notes && (
              <div className="sm:col-span-3">
                <dt className="text-xs text-gray-500">Notes</dt>
                <dd className="text-gray-600">{metric.notes}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-sm text-gray-400">No B2C metrics for this period. Add manual campaign data.</p>
        )}
      </div>
    </div>
  );
}
