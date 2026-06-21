import { formatCurrency } from "@/lib/utils";
import type { PipelineMetrics } from "@/types/pipeline";
import { GitBranch, TrendingUp, Clock } from "lucide-react";

export function PipelineMetricsBar({ metrics }: { metrics: PipelineMetrics }) {
  const items = [
    { label: "Total Pipeline", value: formatCurrency(metrics.totalValue), icon: GitBranch, color: "text-brand-purple" },
    { label: "Weighted Pipeline", value: formatCurrency(metrics.weightedValue), icon: TrendingUp, color: "text-brand-gold" },
    { label: "Active Deals", value: String(metrics.activeDeals), icon: GitBranch, color: "text-brand-purple" },
    { label: "Avg Deal Age", value: `${metrics.avgDealAgeDays}d`, icon: Clock, color: "text-brand-gold" },
  ];

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="rounded-xl border border-gray-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{item.label}</span>
              <Icon className={`h-4 w-4 ${item.color}`} />
            </div>
            <p className="mt-1 text-xl font-bold text-gray-900">{item.value}</p>
          </div>
        );
      })}
    </div>
  );
}
