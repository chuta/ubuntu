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
import { ChevronRight, Handshake } from "lucide-react";

function partner(org: Partnership["primary_partner"]) {
  if (!org) return null;
  return Array.isArray(org) ? org[0] : org;
}

function linkedDeal(deal: Partnership["deal"]) {
  if (!deal) return null;
  return Array.isArray(deal) ? deal[0] : deal;
}

export function PartnershipTable({ partnerships }: { partnerships: Partnership[] }) {
  if (partnerships.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">No partnerships yet.</p>
        <Link href="/partnerships/new" className="mt-2 inline-block text-sm text-brand-purple hover:underline">
          Create your first partnership
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Partnership</th>
            <th className="px-4 py-3">Primary Partner</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Linked Deal</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {partnerships.map((p) => {
            const org = partner(p.primary_partner);
            const deal = linkedDeal(p.deal);
            return (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/partnerships/${p.id}`} className="flex items-center gap-2 font-medium text-gray-900 hover:text-brand-purple">
                    <Handshake className="h-4 w-4 text-brand-gold" />
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{org?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{labelFor(PARTNERSHIP_TYPES, p.partnership_type)}</td>
                <td className="px-4 py-3">
                  <Badge variant={partnershipStatusVariant(p.status)}>
                    {labelFor(PARTNERSHIP_STATUSES, p.status)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {deal ? (
                    <Link href={`/pipeline/${deal.id}`} className="text-brand-purple hover:underline">
                      {deal.name}
                      {deal.estimated_value ? ` · ${formatCurrency(deal.estimated_value)}` : ""}
                    </Link>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/partnerships/${p.id}`} className="text-gray-400 hover:text-brand-purple">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export { stageLabel };
