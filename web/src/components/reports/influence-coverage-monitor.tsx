import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { stageLabel } from "@/lib/constants/deals";
import type { ExecutiveReportData } from "@/types/reports";
import { Network } from "lucide-react";

export function InfluenceCoverageMonitor({
  data,
}: {
  data: ExecutiveReportData["influenceCoverage"];
}) {
  const { totalB2GDeals, mappedB2GDeals, coveragePct, unmappedDeals } = data;
  const lowCoverage = totalB2GDeals > 0 && coveragePct < 60;
  const barColor = coveragePct >= 80 ? "bg-green-500" : coveragePct >= 60 ? "bg-brand-gold" : "bg-red-500";

  return (
    <Card className={`mt-6 ${lowCoverage ? "border-brand-gold/40 bg-brand-gold/5" : "border-gray-200"}`}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-4 w-4 text-brand-purple" />
              Influence Graph Coverage
            </CardTitle>
            <CardDescription>
              Active B2G deals with mapped stakeholder relationships
            </CardDescription>
          </div>
          <Link
            href="/influence"
            className="text-sm font-medium text-brand-purple hover:underline"
          >
            View influence map →
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {totalB2GDeals === 0 ? (
          <p className="text-sm text-gray-400">No active B2G deals to map.</p>
        ) : (
          <>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-3xl font-bold text-gray-900">{coveragePct}%</p>
                <p className="text-xs text-gray-500">
                  {mappedB2GDeals} of {totalB2GDeals} active B2G deals mapped
                </p>
              </div>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${coveragePct}%` }} />
            </div>

            {unmappedDeals.length > 0 && (
              <div className="mt-5 border-t border-gray-200 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  B2G deals without mapped relationships
                </p>
                <ul className="space-y-2 text-sm">
                  {unmappedDeals.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-2">
                      <Link
                        href={`/pipeline/${d.id}`}
                        className="truncate font-medium text-brand-purple hover:underline"
                      >
                        {d.name}
                      </Link>
                      <span className="shrink-0 text-xs text-gray-500">{stageLabel(d.stage)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
