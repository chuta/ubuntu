import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExecutiveReportData } from "@/types/reports";
import { Scale } from "lucide-react";

export function RegulatoryAffairsMonitor({
  data,
}: {
  data: ExecutiveReportData["regulatory"];
}) {
  const hasAttention = data.overdueConsultations > 0 || data.atRiskRequirements > 0;
  const isEmpty =
    data.openMeetings === 0 &&
    data.pendingConsultations === 0 &&
    data.atRiskRequirements === 0;

  return (
    <Card className={`mt-6 ${hasAttention ? "border-red-200 bg-red-50/40" : "border-gray-200"}`}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-brand-purple" />
              Regulatory Affairs
            </CardTitle>
            <CardDescription>
              Open meetings, pending consultations, and at-risk requirements by territory
            </CardDescription>
          </div>
          <Link
            href="/regulatory"
            className="text-sm font-medium text-brand-purple hover:underline"
          >
            View regulatory →
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/regulatory/meetings?status=SCHEDULED"
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 transition-shadow hover:shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Open meetings</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{data.openMeetings}</p>
          </Link>
          <Link
            href="/regulatory/consultations"
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 transition-shadow hover:shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Pending consultations</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{data.pendingConsultations}</p>
            {data.overdueConsultations > 0 && (
              <p className="mt-1 text-xs text-red-600">{data.overdueConsultations} past deadline</p>
            )}
          </Link>
          <Link
            href="/regulatory/requirements"
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 transition-shadow hover:shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">At-risk requirements</p>
            <p className={`mt-1 text-2xl font-bold ${data.atRiskRequirements > 0 ? "text-red-600" : "text-gray-900"}`}>
              {data.atRiskRequirements}
            </p>
          </Link>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Territories engaged</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{data.byTerritory.length}</p>
          </div>
        </div>

        {isEmpty ? (
          <p className="text-sm text-gray-400">No open regulatory activity.</p>
        ) : data.byTerritory.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              By territory
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="py-1.5">Territory</th>
                    <th className="py-1.5 text-right">Meetings</th>
                    <th className="py-1.5 text-right">Consultations</th>
                    <th className="py-1.5 text-right">At-risk reqs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.byTerritory.map((row) => (
                    <tr key={row.territory}>
                      <td className="py-2 text-gray-700">{row.territory}</td>
                      <td className="py-2 text-right font-medium text-gray-900">{row.meetings}</td>
                      <td className="py-2 text-right font-medium text-gray-900">{row.consultations}</td>
                      <td className={`py-2 text-right font-medium ${row.requirements > 0 ? "text-red-600" : "text-gray-900"}`}>
                        {row.requirements}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
