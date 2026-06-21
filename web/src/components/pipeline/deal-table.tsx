import Link from "next/link";
import { Badge, priorityVariant } from "@/components/ui/badge";
import { labelFor, DEAL_PRIORITIES, REVENUE_ENGINES, stageLabel, weightedValue } from "@/lib/constants/deals";
import { formatCurrency } from "@/lib/utils";
import type { Deal } from "@/types/pipeline";
import { ChevronRight } from "lucide-react";

export function DealTable({ deals }: { deals: Deal[] }) {
  if (deals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">No deals yet.</p>
        <Link href="/pipeline/new" className="mt-2 inline-block text-sm text-brand-purple hover:underline">
          Create your first deal
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Deal</th>
            <th className="px-4 py-3">Organization</th>
            <th className="px-4 py-3">Stage</th>
            <th className="px-4 py-3">Value</th>
            <th className="px-4 py-3">Weighted</th>
            <th className="px-4 py-3">Engine</th>
            <th className="px-4 py-3">Close</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {deals.map((deal) => {
            const org = Array.isArray(deal.organization) ? deal.organization[0] : deal.organization;
            const weight = weightedValue(deal);
            const overdue =
              deal.expected_close_date &&
              new Date(deal.expected_close_date) < new Date() &&
              !["WON", "LOST", "IMPLEMENTATION", "REVENUE_REALIZATION", "EXPANSION"].includes(deal.stage);

            return (
              <tr key={deal.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/pipeline/${deal.id}`} className="font-medium text-gray-900 hover:text-brand-purple">
                    {deal.name}
                  </Link>
                  {deal.priority && (
                    <Badge variant={priorityVariant(deal.priority)} className="ml-2">
                      {labelFor(DEAL_PRIORITIES, deal.priority)}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{org?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant="purple">{stageLabel(deal.stage)}</Badge>
                </td>
                <td className="px-4 py-3 font-medium text-brand-gold">
                  {deal.estimated_value ? formatCurrency(deal.estimated_value) : "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {weight > 0 ? formatCurrency(weight) : "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {labelFor(REVENUE_ENGINES, deal.revenue_engine)}
                </td>
                <td className={`px-4 py-3 ${overdue ? "text-red-600 font-medium" : "text-gray-600"}`}>
                  {deal.expected_close_date
                    ? new Date(deal.expected_close_date).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/pipeline/${deal.id}`} className="text-gray-400 hover:text-brand-purple">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
