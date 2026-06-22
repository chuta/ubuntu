import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  COMMERCIAL_RISK_TYPES,
  commercialRiskSeverityVariant,
  commercialRiskShortLabel,
  labelForCommercialRisk,
  COMMERCIAL_RISK_SEVERITIES,
} from "@/lib/constants/commercial-risks";
import { stageLabel } from "@/lib/constants/deals";
import { formatCurrency } from "@/lib/utils";
import type { ExecutiveReportData } from "@/types/reports";
import type { CommercialRiskType } from "@/types/pipeline";
import { AlertTriangle } from "lucide-react";

export function CommercialRiskMonitor({
  data,
}: {
  data: ExecutiveReportData["commercialRisks"];
}) {
  const activeCategories = COMMERCIAL_RISK_TYPES.filter(
    (t) => (data.byCategory[t.value] ?? 0) > 0
  );

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Commercial Risk Monitor
            </CardTitle>
            <CardDescription>COM §6 — open pipeline snapshot</CardDescription>
          </div>
          <Link
            href="/pipeline?has_risk=1"
            className="text-sm font-medium text-brand-purple hover:underline"
          >
            View all →
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-3 text-sm">
          <span>
            <strong className="text-gray-900">{data.flaggedDeals}</strong> flagged deals
          </span>
          <span>
            <strong className="text-red-600">{data.overdueReviews}</strong> overdue reviews
          </span>
          <span>
            <strong className="text-brand-gold">{data.criticalCount}</strong> critical
          </span>
        </div>

        {activeCategories.length === 0 ? (
          <p className="text-sm text-gray-400">No commercial risks flagged on open deals.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {activeCategories.map((cat) => (
              <div key={cat.value} className="flex items-center justify-between gap-3">
                <Link
                  href={`/pipeline?risk_flag=${cat.value}`}
                  className="text-gray-600 hover:text-brand-purple"
                >
                  {cat.label}
                </Link>
                <span className="font-medium text-gray-900">{data.byCategory[cat.value] ?? 0}</span>
              </div>
            ))}
          </div>
        )}

        {data.topAtRiskDeals.length > 0 && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Top at-risk deals
            </p>
            <ul className="space-y-2 text-sm">
              {data.topAtRiskDeals.map((deal) => (
                <li key={deal.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link
                      href={`/pipeline/${deal.id}`}
                      className="truncate font-medium text-brand-purple hover:underline"
                    >
                      {deal.name}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap gap-1">
                      {deal.flags.slice(0, 2).map((flag) => (
                        <Badge key={flag} variant="gold" className="text-[10px]">
                          {commercialRiskShortLabel(flag as CommercialRiskType)}
                        </Badge>
                      ))}
                      <span className="text-xs text-gray-400">{stageLabel(deal.stage as never)}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {deal.severity && (
                      <Badge variant={commercialRiskSeverityVariant(deal.severity as never)}>
                        {labelForCommercialRisk(COMMERCIAL_RISK_SEVERITIES, deal.severity)}
                      </Badge>
                    )}
                    <span className="text-brand-gold">
                      {deal.estimated_value != null ? formatCurrency(deal.estimated_value) : "—"}
                    </span>
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
