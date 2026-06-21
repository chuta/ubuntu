import { Badge, statusVariant } from "@/components/ui/badge";
import {
  labelFor,
  ACCOUNT_SUBTYPES,
  GIFT_ADOPTION,
  ORGANIZATION_STATUSES,
  ORGANIZATION_TIERS,
  TREASURY_INTEREST,
  WALLET_INTEGRATION,
} from "@/lib/constants/organizations";
import { formatCurrency } from "@/lib/utils";
import type { AccountProfile, Organization } from "@/types/crm";

function accProfile(org: Organization): AccountProfile | null {
  const p = org.account_profile;
  if (!p) return null;
  return Array.isArray(p) ? p[0] ?? null : p;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value || value === "—") return null;
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{value}</dd>
    </div>
  );
}

export function AccountDetail({ organization }: { organization: Organization }) {
  const ap = accProfile(organization);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant={statusVariant(organization.status)}>
          {labelFor(ORGANIZATION_STATUSES, organization.status)}
        </Badge>
        {organization.tier && (
          <Badge variant="purple">{labelFor(ORGANIZATION_TIERS, organization.tier)}</Badge>
        )}
        {ap?.account_subtype && (
          <Badge variant="gold">{labelFor(ACCOUNT_SUBTYPES, ap.account_subtype)}</Badge>
        )}
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailRow label="Legal Name" value={organization.legal_name} />
        <DetailRow label="Territory" value={organization.territory?.name} />
        <DetailRow
          label="Location"
          value={
            organization.headquarters_city || organization.headquarters_country
              ? [organization.headquarters_city, organization.headquarters_country].filter(Boolean).join(", ")
              : null
          }
        />
        <DetailRow
          label="Website"
          value={
            organization.website ? (
              <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-brand-purple hover:underline">
                {organization.website}
              </a>
            ) : null
          }
        />
        <DetailRow label="AUM Range" value={ap?.aum_range} />
        <DetailRow label="Treasury Interest" value={labelFor(TREASURY_INTEREST, ap?.treasury_interest_level)} />
        <DetailRow label="GIFT Adoption" value={labelFor(GIFT_ADOPTION, ap?.gift_adoption_status)} />
        <DetailRow label="Wallet Integration" value={labelFor(WALLET_INTEGRATION, ap?.wallet_integration_status)} />
        <DetailRow
          label="Annual Revenue Potential"
          value={ap?.annual_revenue_potential ? formatCurrency(ap.annual_revenue_potential) : null}
        />
        <DetailRow
          label="Decision Cycle"
          value={ap?.decision_cycle_months ? `${ap.decision_cycle_months} months` : null}
        />
        {organization.description && (
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Description</dt>
            <dd className="mt-0.5 text-sm text-gray-700">{organization.description}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
