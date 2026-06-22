import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  COMMERCIAL_RISK_SEVERITIES,
  COMMERCIAL_RISK_TYPES,
  commercialRiskSeverityVariant,
  commercialRiskShortLabel,
  dealHasCommercialRisk,
  isCommercialRiskReviewOverdue,
  labelForCommercialRisk,
} from "@/lib/constants/commercial-risks";
import type { CommercialRiskType, Deal } from "@/types/pipeline";
import { AlertTriangle } from "lucide-react";

export function CommercialRiskBadges({
  deal,
  compact,
  max = 2,
}: {
  deal: Pick<Deal, "commercial_risk_flags" | "commercial_risk_severity">;
  compact?: boolean;
  max?: number;
}) {
  if (!dealHasCommercialRisk(deal)) return null;

  const flags = deal.commercial_risk_flags ?? [];
  const shown = flags.slice(0, max);
  const overflow = flags.length - shown.length;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {compact && (
        <AlertTriangle
          className={`h-3.5 w-3.5 ${
            deal.commercial_risk_severity === "CRITICAL" || deal.commercial_risk_severity === "HIGH"
              ? "text-red-500"
              : "text-amber-500"
          }`}
          aria-label="Commercial risk flagged"
        />
      )}
      {shown.map((flag) => (
        <Badge key={flag} variant="gold" className="text-[10px]">
          {compact ? commercialRiskShortLabel(flag) : commercialRiskShortLabel(flag)}
        </Badge>
      ))}
      {overflow > 0 && (
        <span className="text-[10px] text-gray-400">+{overflow}</span>
      )}
    </div>
  );
}

export function DealCommercialRisksPanel({
  deal,
  suggestions = [],
}: {
  deal: Deal;
  suggestions?: CommercialRiskType[];
}) {
  const unapplied = suggestions.filter((s) => !deal.commercial_risk_flags?.includes(s));

  return (
    <div
      className={`rounded-xl border bg-white p-6 ${
        dealHasCommercialRisk(deal)
          ? deal.commercial_risk_severity === "CRITICAL" || deal.commercial_risk_severity === "HIGH"
            ? "border-red-200"
            : "border-amber-200"
          : "border-gray-200"
      }`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Commercial Risks</h3>
          <p className="text-xs text-gray-500">COM v1.0 §6 monitoring</p>
        </div>
        <Link
          href={`/pipeline/${deal.id}/edit`}
          className="text-xs font-medium text-brand-purple hover:underline"
        >
          Edit risks →
        </Link>
      </div>

      {!dealHasCommercialRisk(deal) ? (
        <div>
          <p className="text-sm text-gray-500">No commercial risks flagged on this deal.</p>
          {unapplied.length > 0 && (
            <p className="mt-2 text-xs text-amber-700">
              {unapplied.length} suggested risk{unapplied.length === 1 ? "" : "s"} available on edit.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {deal.commercial_risk_flags.map((flag) => (
              <Badge key={flag} variant="gold">
                {COMMERCIAL_RISK_TYPES.find((t) => t.value === flag)?.label ?? flag}
              </Badge>
            ))}
            {deal.commercial_risk_severity && (
              <Badge variant={commercialRiskSeverityVariant(deal.commercial_risk_severity)}>
                {labelForCommercialRisk(COMMERCIAL_RISK_SEVERITIES, deal.commercial_risk_severity)}
              </Badge>
            )}
          </div>

          {deal.commercial_risk_mitigation && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Mitigation</p>
              <p className="mt-0.5 text-sm text-gray-700">{deal.commercial_risk_mitigation}</p>
            </div>
          )}

          {deal.commercial_risk_notes && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Notes</p>
              <p className="mt-0.5 text-sm text-gray-700">{deal.commercial_risk_notes}</p>
            </div>
          )}

          {deal.commercial_risk_review_date && (
            <p
              className={`text-xs ${
                isCommercialRiskReviewOverdue(deal.commercial_risk_review_date)
                  ? "font-medium text-red-600"
                  : "text-gray-500"
              }`}
            >
              Review: {new Date(deal.commercial_risk_review_date).toLocaleDateString()}
              {isCommercialRiskReviewOverdue(deal.commercial_risk_review_date) && " (overdue)"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
