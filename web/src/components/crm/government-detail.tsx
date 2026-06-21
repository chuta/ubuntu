import Link from "next/link";
import { Badge, priorityVariant, statusVariant } from "@/components/ui/badge";
import {
  labelFor,
  ENGAGEMENT_PRIORITIES,
  GOVERNMENT_LEVELS,
  GOVERNMENT_SUBTYPES,
  ORGANIZATION_STATUSES,
  ORGANIZATION_TIERS,
} from "@/lib/constants/organizations";
import type { GovernmentProfile, Organization } from "@/types/crm";

function govProfile(org: Organization): GovernmentProfile | null {
  const p = org.government_profile;
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

export function GovernmentDetail({ organization }: { organization: Organization }) {
  const gp = govProfile(organization);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant={statusVariant(organization.status)}>
          {labelFor(ORGANIZATION_STATUSES, organization.status)}
        </Badge>
        {organization.tier && (
          <Badge variant="purple">{labelFor(ORGANIZATION_TIERS, organization.tier)}</Badge>
        )}
        {gp?.engagement_priority && (
          <Badge variant={priorityVariant(gp.engagement_priority)}>
            {labelFor(ENGAGEMENT_PRIORITIES, gp.engagement_priority)} Priority
          </Badge>
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
        <DetailRow label="Government Level" value={labelFor(GOVERNMENT_LEVELS, gp?.government_level)} />
        <DetailRow label="Entity Subtype" value={labelFor(GOVERNMENT_SUBTYPES, gp?.entity_subtype)} />
        <DetailRow label="Jurisdiction" value={gp?.jurisdiction} />
        <DetailRow label="Resource Endowment" value={gp?.resource_endowment} />
        {organization.description && (
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Description</dt>
            <dd className="mt-0.5 text-sm text-gray-700">{organization.description}</dd>
          </div>
        )}
        {gp?.regulatory_environment_notes && (
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Regulatory Environment</dt>
            <dd className="mt-0.5 text-sm text-gray-700">{gp.regulatory_environment_notes}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
