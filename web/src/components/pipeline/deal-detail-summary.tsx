import { Badge, priorityVariant, statusVariant } from "@/components/ui/badge";
import { labelFor, DEAL_PRIORITIES, REVENUE_ENGINES, stageLabel, weightedValue } from "@/lib/constants/deals";
import { formatCurrency } from "@/lib/utils";
import type { Deal } from "@/types/pipeline";
import Link from "next/link";

export function DealDetailSummary({ deal }: { deal: Deal }) {
  const org = Array.isArray(deal.organization) ? deal.organization[0] : deal.organization;
  const product = Array.isArray(deal.product) ? deal.product[0] : deal.product;
  const weight = weightedValue(deal);

  const overdue =
    deal.expected_close_date &&
    new Date(deal.expected_close_date) < new Date() &&
    !["WON", "LOST", "IMPLEMENTATION", "REVENUE_REALIZATION", "EXPANSION"].includes(deal.stage);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="purple">{stageLabel(deal.stage)}</Badge>
        {deal.priority && (
          <Badge variant={priorityVariant(deal.priority)}>
            {labelFor(DEAL_PRIORITIES, deal.priority)}
          </Badge>
        )}
        <Badge variant={statusVariant("ACTIVE")}>{deal.segment}</Badge>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Organization</dt>
          <dd className="mt-0.5 text-sm">
            {org ? (
              <Link href={org.segment === "B2G" ? `/governments/${org.id}` : `/accounts/${org.id}`} className="text-brand-purple hover:underline">
                {org.name}
              </Link>
            ) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Revenue Engine</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{labelFor(REVENUE_ENGINES, deal.revenue_engine)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Product</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{product?.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Estimated Value</dt>
          <dd className="mt-0.5 text-sm font-semibold text-brand-gold">
            {deal.estimated_value ? formatCurrency(deal.estimated_value) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Probability</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{deal.probability ?? 0}%</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Weighted Value</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{weight > 0 ? formatCurrency(weight) : "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Expected Close</dt>
          <dd className={`mt-0.5 text-sm ${overdue ? "font-medium text-red-600" : "text-gray-900"}`}>
            {deal.expected_close_date
              ? new Date(deal.expected_close_date).toLocaleDateString()
              : "—"}
            {overdue && " (overdue)"}
          </dd>
        </div>
        {deal.next_step && (
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Next Step</dt>
            <dd className="mt-0.5 text-sm text-gray-900">
              {deal.next_step}
              {deal.next_step_date && ` · ${new Date(deal.next_step_date).toLocaleDateString()}`}
            </dd>
          </div>
        )}
        {deal.description && (
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Description</dt>
            <dd className="mt-0.5 text-sm text-gray-700">{deal.description}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
