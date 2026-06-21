import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  labelFor,
  PARTNERSHIP_STATUSES,
  PARTNERSHIP_TYPES,
  partnershipStatusVariant,
} from "@/lib/constants/partnerships";
import { stageLabel } from "@/lib/constants/deals";
import { formatCurrency } from "@/lib/utils";
import type { Partnership } from "@/types/partnerships";

function partner(org: Partnership["primary_partner"]) {
  if (!org) return null;
  return Array.isArray(org) ? org[0] : org;
}

function linkedDeal(deal: Partnership["deal"]) {
  if (!deal) return null;
  return Array.isArray(deal) ? deal[0] : deal;
}

export function PartnershipDetail({ partnership }: { partnership: Partnership }) {
  const org = partner(partnership.primary_partner);
  const deal = linkedDeal(partnership.deal);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant={partnershipStatusVariant(partnership.status)}>
          {labelFor(PARTNERSHIP_STATUSES, partnership.status)}
        </Badge>
        <Badge variant="gold">{labelFor(PARTNERSHIP_TYPES, partnership.partnership_type)}</Badge>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Primary Partner</dt>
          <dd className="mt-0.5 text-sm text-gray-900">
            {org ? (
              <Link
                href={org.organization_type === "GOVERNMENT" ? `/governments/${org.id}` : `/accounts/${org.id}`}
                className="text-brand-purple hover:underline"
              >
                {org.name}
              </Link>
            ) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Start Date</dt>
          <dd className="mt-0.5 text-sm text-gray-900">
            {partnership.start_date ? new Date(partnership.start_date).toLocaleDateString() : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">End Date</dt>
          <dd className="mt-0.5 text-sm text-gray-900">
            {partnership.end_date ? new Date(partnership.end_date).toLocaleDateString() : "—"}
          </dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Linked Deal</dt>
          <dd className="mt-0.5 text-sm">
            {deal ? (
              <Link href={`/pipeline/${deal.id}`} className="text-brand-purple hover:underline">
                {deal.name} · {stageLabel(deal.stage)}
                {deal.estimated_value ? ` · ${formatCurrency(deal.estimated_value)}` : ""}
              </Link>
            ) : (
              <span className="text-gray-400">No deal linked</span>
            )}
          </dd>
        </div>
        {partnership.revenue_share_terms && (
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Revenue Share Terms</dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-sm text-gray-700">{partnership.revenue_share_terms}</dd>
          </div>
        )}
        {partnership.strategic_objectives && (
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Strategic Objectives</dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-sm text-gray-700">{partnership.strategic_objectives}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
