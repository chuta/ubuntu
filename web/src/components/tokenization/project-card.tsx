"use client";

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

export function ProjectCard({ project }: { project: TokenizationProject }) {
  return (
    <Link
      href={`/tokenization/${project.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition hover:border-brand-purple/40 hover:shadow"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("projectId", project.id);
        e.dataTransfer.setData("fromPhase", project.current_phase);
      }}
    >
      <p className="text-sm font-medium text-gray-900 line-clamp-2">{project.name}</p>
      <p className="mt-1 text-xs text-gray-500">{project.organization?.name ?? "—"}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <Badge variant={projectStatusVariant(project.status)}>
          {labelFor(PROJECT_STATUSES, project.status)}
        </Badge>
        <Badge variant="gold">{labelFor(ASSET_TYPES, project.asset_type)}</Badge>
      </div>
      {project.estimated_asset_value != null && (
        <p className="mt-2 text-xs font-medium text-brand-purple">
          {formatCurrency(project.estimated_asset_value)}
        </p>
      )}
      {(project.opportunity_score != null || project.tokenization_readiness_score != null) && (
        <p className="mt-1 text-[10px] text-gray-400">
          {project.opportunity_score != null && `Opp ${project.opportunity_score}`}
          {project.opportunity_score != null && project.tokenization_readiness_score != null && " · "}
          {project.tokenization_readiness_score != null && `Ready ${project.tokenization_readiness_score}`}
        </p>
      )}
    </Link>
  );
}

export function ProjectTable({ projects }: { projects: TokenizationProject[] }) {
  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
        No tokenization projects yet.{" "}
        <Link href="/tokenization/new" className="text-brand-purple hover:underline">Create one</Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Project</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Government</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Asset</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Phase</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">Est. Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {projects.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <Link href={`/tokenization/${p.id}`} className="font-medium text-brand-purple hover:underline">
                  {p.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-600">{p.organization?.name ?? "—"}</td>
              <td className="px-4 py-3 text-gray-600">{labelFor(ASSET_TYPES, p.asset_type)}</td>
              <td className="px-4 py-3 text-gray-600">{phaseLabel(p.current_phase)}</td>
              <td className="px-4 py-3">
                <Badge variant={projectStatusVariant(p.status)}>{labelFor(PROJECT_STATUSES, p.status)}</Badge>
              </td>
              <td className="px-4 py-3 text-right text-gray-600">
                {p.estimated_asset_value != null ? formatCurrency(p.estimated_asset_value) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
