import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  ASSET_TYPES,
  labelFor,
  phaseLabel,
  PROJECT_STATUSES,
  projectStatusVariant,
} from "@/lib/constants/tokenization";
import { formatCurrency } from "@/lib/utils";
import type { TokenizationProject } from "@/types/tokenization";

export function ProjectDetail({ project }: { project: TokenizationProject }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant={projectStatusVariant(project.status)}>
          {labelFor(PROJECT_STATUSES, project.status)}
        </Badge>
        <Badge variant="gold">{labelFor(ASSET_TYPES, project.asset_type)}</Badge>
        <Badge variant="purple">{phaseLabel(project.current_phase)}</Badge>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Government</dt>
          <dd className="mt-0.5 text-sm text-gray-900">
            {project.organization ? (
              <Link href={`/governments/${project.organization.id}`} className="text-brand-purple hover:underline">
                {project.organization.name}
              </Link>
            ) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Jurisdiction</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{project.jurisdiction ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Est. Asset Value</dt>
          <dd className="mt-0.5 text-sm text-gray-900">
            {project.estimated_asset_value != null ? formatCurrency(project.estimated_asset_value) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Readiness Score</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{project.tokenization_readiness_score ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Opportunity Score</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{project.opportunity_score ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Linked Deal</dt>
          <dd className="mt-0.5 text-sm text-gray-900">
            {project.deal ? (
              <Link href={`/pipeline/${project.deal.id}`} className="text-brand-purple hover:underline">
                {project.deal.name}
              </Link>
            ) : "—"}
          </dd>
        </div>
      </dl>

      {project.description && (
        <div className="mt-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Description</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{project.description}</dd>
        </div>
      )}
    </div>
  );
}
