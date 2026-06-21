"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { moveDealStage } from "@/lib/actions/deals";
import { DEAL_STAGES, stageLabel } from "@/lib/constants/deals";
import type { Deal, DealStage } from "@/types/pipeline";
import { DealCard } from "@/components/pipeline/deal-card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function KanbanBoard({ deals }: { deals: Deal[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<{ dealId: string; dealName: string; fromStage: DealStage; toStage: DealStage } | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);

  const byStage = DEAL_STAGES.reduce(
    (acc, stage) => {
      acc[stage.value] = deals.filter((d) => d.stage === stage.value);
      return acc;
    },
    {} as Record<DealStage, Deal[]>
  );

  async function confirmMove() {
    if (!pending) return;
    setLoading(true);
    try {
      await moveDealStage(pending.dealId, pending.toStage);
      setPending(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to move deal");
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent, toStage: DealStage) {
    e.preventDefault();
    setDragOverStage(null);
    const dealId = e.dataTransfer.getData("dealId");
    const fromStage = e.dataTransfer.getData("fromStage") as DealStage;
    if (!dealId || fromStage === toStage) return;

    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;

    setPending({ dealId, dealName: deal.name, fromStage, toStage });
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {DEAL_STAGES.map((stage) => {
          const stageDeals = byStage[stage.value];
          const stageTotal = stageDeals.reduce((sum, d) => sum + (d.estimated_value ?? 0), 0);

          return (
            <div
              key={stage.value}
              className={`flex w-64 shrink-0 flex-col rounded-xl border border-gray-200 ${stage.columnColor} ${
                dragOverStage === stage.value ? "ring-2 ring-brand-purple" : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStage(stage.value);
              }}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={(e) => handleDrop(e, stage.value)}
            >
              <div className="border-b border-gray-200/80 px-3 py-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                    {stage.shortLabel}
                  </h3>
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {stageDeals.length}
                  </span>
                </div>
                {stageTotal > 0 && (
                  <p className="mt-0.5 text-xs text-gray-500">{formatCurrency(stageTotal)}</p>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-2 min-h-[120px]">
                {stageDeals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} draggable />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Move deal?</h3>
            <p className="mt-2 text-sm text-gray-600">
              Move <strong>{pending.dealName}</strong> from{" "}
              <strong>{stageLabel(pending.fromStage)}</strong> to{" "}
              <strong>{stageLabel(pending.toStage)}</strong>?
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Probability will update to the default for the new stage. Stage change is logged.
            </p>
            <div className="mt-6 flex gap-3">
              <Button onClick={confirmMove} disabled={loading}>
                {loading ? "Moving…" : "Confirm Move"}
              </Button>
              <Button variant="outline" onClick={() => setPending(null)} disabled={loading}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
