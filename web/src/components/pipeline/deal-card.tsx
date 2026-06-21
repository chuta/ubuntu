"use client";

import Link from "next/link";
import { Badge, priorityVariant } from "@/components/ui/badge";
import { labelFor, DEAL_PRIORITIES, weightedValue } from "@/lib/constants/deals";
import { formatCurrency } from "@/lib/utils";
import type { Deal } from "@/types/pipeline";
import { Building2, GripVertical } from "lucide-react";

export function DealCard({ deal, draggable }: { deal: Deal; draggable?: boolean }) {
  const org = Array.isArray(deal.organization) ? deal.organization[0] : deal.organization;
  const weight = weightedValue({
    estimated_value: deal.estimated_value,
    probability: deal.probability,
  });

  const content = (
    <>
      <p className="font-medium text-gray-900 line-clamp-2">{deal.name}</p>
      {org && (
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <Building2 className="h-3 w-3" />
          {org.name}
        </p>
      )}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-brand-gold">
          {deal.estimated_value ? formatCurrency(deal.estimated_value) : "—"}
        </span>
        <span className="text-xs text-gray-400">{deal.probability ?? 0}%</span>
      </div>
      {weight > 0 && (
        <p className="mt-0.5 text-xs text-gray-400">Weighted {formatCurrency(weight)}</p>
      )}
      {deal.priority && (
        <div className="mt-2">
          <Badge variant={priorityVariant(deal.priority)}>
            {labelFor(DEAL_PRIORITIES, deal.priority)}
          </Badge>
        </div>
      )}
      {deal.expected_close_date && (
        <p className="mt-2 text-xs text-gray-400">
          Close: {new Date(deal.expected_close_date).toLocaleDateString()}
        </p>
      )}
    </>
  );

  if (draggable) {
    return (
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("dealId", deal.id);
          e.dataTransfer.setData("fromStage", deal.stage);
          e.dataTransfer.effectAllowed = "move";
        }}
        className="cursor-grab rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
      >
        <div className="mb-1 flex items-center gap-1 text-gray-300">
          <GripVertical className="h-3 w-3" />
        </div>
        <Link href={`/pipeline/${deal.id}`} className="block" draggable={false}>
          {content}
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={`/pipeline/${deal.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      {content}
    </Link>
  );
}
