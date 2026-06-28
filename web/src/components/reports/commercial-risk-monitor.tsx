import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  COMMERCIAL_RISK_TYPES,
  COMMERCIAL_RISK_SEVERITIES,
  commercialRiskSeverityVariant,
  commercialRiskShortLabel,
  labelForCommercialRisk,
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
  const hasRisk = data.flaggedDeals > 0;
  const activeSeverities = COMMERCIAL_RISK_SEVERITIES.filter(
    (s) => (data.bySeverity[s.value] ?? 0) > 0
  );

  return (
    <Card
      className={`mt-6 ${hasRisk ? "border-amber-300 bg-amber-50/30" : "border-gray-200"}`}
    >
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${hasRisk ? "text-amber-600" : "text-gray-400"}`} />
              Commercial Risk Monitor
            </CardTitle>
            <CardDescription>COM §6 — open pipeline snapshot</CardDescription>
          </div>
          <Link
            href="/pipeline?has_risk=1"
            className="text-sm font-medium text-brand-purple hover:underline"
          >
            View all flagged →
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid grid-cols-1 gap-3 min-[480px]:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Flagged deals</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{data.flaggedDeals}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Overdue reviews</p>
            <p className={`mt-1 text-2xl font-bold ${data.overdueReviews > 0 ? "text-red-600" : "text-gray-900"}`}>
              {data.overdueReviews}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Critical severity</p>
            <p className={`mt-1 text-2xl font-bold ${data.criticalCount > 0 ? "text-brand-gold" : "text-gray-900"}`}>
              {data.criticalCount}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Risk by category
            </p>
            <div className="space-y-2 text-sm">
              {COMMERCIAL_RISK_TYPES.map((cat) => {
                const count = data.byCategory[cat.value] ?? 0;
                return (
                  <div key={cat.value} className="flex items-center justify-between gap-3">
                    <Link
                      href={`/pipeline?risk_flag=${cat.value}`}
                      className={count > 0 ? "text-gray-700 hover:text-brand-purple" : "text-gray-400 hover:text-brand-purple"}
                    >
                      {cat.label}
                    </Link>
                    <span className={`font-medium ${count > 0 ? "text-gray-900" : "text-gray-400"}`}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Risk by severity
            </p>
            {activeSeverities.length === 0 ? (
              <p className="text-sm text-gray-400">No severity ratings on flagged deals.</p>
            ) : (
              <div className="space-y-2 text-sm">
                {COMMERCIAL_RISK_SEVERITIES.map((sev) => {
                  const count = data.bySeverity[sev.value] ?? 0;
                  if (count === 0) return null;
                  return (
                    <div key={sev.value} className="flex items-center justify-between gap-3">
                      <Link
                        href={`/pipeline?risk_severity=${sev.value}`}
                        className="text-gray-700 hover:text-brand-purple"
                      >
                        {sev.label}
                      </Link>
                      <Badge variant={commercialRiskSeverityVariant(sev.value)}>{count}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {data.topAtRiskDeals.length > 0 && (
          <div className="mt-5 border-t border-gray-200 pt-4">
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
