"use client";

import Link from "next/link";
import { Badge, priorityVariant, statusVariant } from "@/components/ui/badge";
import type { Organization } from "@/types/crm";
import {
  labelFor,
  ENGAGEMENT_PRIORITIES,
  ORGANIZATION_STATUSES,
  GOVERNMENT_LEVELS,
  ACCOUNT_SUBTYPES,
} from "@/lib/constants/organizations";
import { Building2, ChevronRight, Landmark } from "lucide-react";

export function OrganizationTable({
  organizations,
  basePath,
  variant,
}: {
  organizations: Organization[];
  basePath: "/governments" | "/accounts";
  variant: "government" | "account";
}) {
  if (organizations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">No records yet.</p>
        <Link href={`${basePath}/new`} className="mt-2 inline-block text-sm text-brand-purple hover:underline">
          Add your first {variant === "government" ? "government" : "account"}
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">{variant === "government" ? "Level" : "Type"}</th>
            <th className="px-4 py-3">Territory</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">{variant === "government" ? "Priority" : "Treasury"}</th>
            <th className="px-4 py-3 w-8" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {organizations.map((org) => (
            <tr key={org.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <Link href={`${basePath}/${org.id}`} className="flex items-center gap-2 font-medium text-gray-900 hover:text-brand-purple">
                  {variant === "government" ? (
                    <Landmark className="h-4 w-4 text-brand-gold" />
                  ) : (
                    <Building2 className="h-4 w-4 text-brand-purple" />
                  )}
                  {org.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-600">
                {variant === "government"
                  ? labelFor(GOVERNMENT_LEVELS, org.government_profile?.government_level)
                  : labelFor(ACCOUNT_SUBTYPES, org.account_profile?.account_subtype)}
              </td>
              <td className="px-4 py-3 text-gray-600">{org.territory?.name ?? "—"}</td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant(org.status)}>
                  {labelFor(ORGANIZATION_STATUSES, org.status)}
                </Badge>
              </td>
              <td className="px-4 py-3">
                {variant === "government" ? (
                  org.government_profile?.engagement_priority ? (
                    <Badge variant={priorityVariant(org.government_profile.engagement_priority)}>
                      {labelFor(ENGAGEMENT_PRIORITIES, org.government_profile.engagement_priority)}
                    </Badge>
                  ) : (
                    "—"
                  )
                ) : (
                  <span className="text-gray-600 capitalize">
                    {org.account_profile?.treasury_interest_level?.toLowerCase() ?? "—"}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <Link href={`${basePath}/${org.id}`} className="text-gray-400 hover:text-brand-purple">
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
