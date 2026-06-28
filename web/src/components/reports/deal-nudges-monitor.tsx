import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { stageLabel } from "@/lib/constants/deals";
import type { ExecutiveReportData } from "@/types/reports";
import { BellRing } from "lucide-react";

export function DealNudgesMonitor({
  data,
}: {
  data: ExecutiveReportData["nudges"];
}) {
  const hasAttention = data.totalDeals > 0;

  return (
    <Card className={`mt-6 ${hasAttention ? "border-amber-300 bg-amber-50/30" : "border-gray-200"}`}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BellRing className={`h-4 w-4 ${hasAttention ? "text-amber-600" : "text-gray-400"}`} />
              Deals Needing Attention
            </CardTitle>
            <CardDescription>
              Stalled deals, overdue risk reviews, and overdue expected closes
            </CardDescription>
          </div>
          <Link
            href="/pipeline?nudge=stalled"
            className="text-sm font-medium text-brand-purple hover:underline"
          >
            View pipeline →
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid grid-cols-1 gap-3 min-[480px]:grid-cols-3">
          <Link
            href="/pipeline?nudge=stalled"
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 transition-shadow hover:shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Stalled</p>
            <p className={`mt-1 text-2xl font-bold ${data.stalledDeals > 0 ? "text-amber-600" : "text-gray-900"}`}>
              {data.stalledDeals}
            </p>
          </Link>
          <Link
            href="/pipeline?nudge=overdue_review"
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 transition-shadow hover:shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Overdue reviews</p>
            <p className={`mt-1 text-2xl font-bold ${data.overdueReviews > 0 ? "text-red-600" : "text-gray-900"}`}>
              {data.overdueReviews}
            </p>
          </Link>
          <Link
            href="/pipeline?nudge=overdue_close"
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 transition-shadow hover:shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Overdue closes</p>
            <p className={`mt-1 text-2xl font-bold ${data.overdueCloses > 0 ? "text-amber-600" : "text-gray-900"}`}>
              {data.overdueCloses}
            </p>
          </Link>
        </div>

        {data.topDeals.length === 0 ? (
          <p className="text-sm text-gray-400">
            No deals need attention right now — pipeline hygiene looks good.
          </p>
        ) : (
          <div className="border-t border-gray-200 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Top deals to action
            </p>
            <ul className="space-y-3 text-sm">
              {data.topDeals.map((deal) => (
                <li key={deal.id} className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <Link
                      href={`/pipeline/${deal.id}`}
                      className="truncate font-medium text-brand-purple hover:underline"
                    >
                      {deal.name}
                    </Link>
                    <p className="text-xs text-gray-400">{stageLabel(deal.stage as never)}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1">
                    {deal.nudges.map((n) => (
                      <span key={n.type} title={n.detail}>
                        <Badge
                          variant={n.severity === "critical" ? "red" : "gold"}
                          className="text-[10px]"
                        >
                          {n.label}
                        </Badge>
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
