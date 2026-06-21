import { Suspense } from "react";
import Link from "next/link";
import { getProfile } from "@/lib/supabase/server";
import { getExecutiveReportData } from "@/lib/actions/reports";
import { isReadOnlyRole } from "@/lib/auth/roles";
import { Header } from "@/components/layout/header";
import { DateRangeFilter } from "@/components/reports/date-range-filter";
import { ExportReportButtons } from "@/components/reports/export-report-buttons";
import { ExecutiveDashboard } from "@/components/reports/executive-dashboard";
import { B2cMetricsPanel } from "@/components/reports/b2c-metrics-panel";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; from?: string; to?: string }>;
}) {
  const profile = await getProfile();
  const params = await searchParams;
  const data = await getExecutiveReportData(params);
  const readOnly = isReadOnlyRole(profile!.role);

  return (
    <>
      <Header profile={profile!} title="Executive Command Center" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Suspense>
            <DateRangeFilter />
          </Suspense>
          <div className="flex gap-2">
            <Link
              href={`/reports?preset=${params.preset ?? "week"}${params.from ? `&from=${params.from}` : ""}${params.to ? `&to=${params.to}` : ""}`}
              className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-purple hover:text-brand-purple"
            >
              Preview Report
            </Link>
            <ExportReportButtons preset={params.preset} from={params.from} to={params.to} />
          </div>
        </div>

        <ExecutiveDashboard data={data} />

        <div className="mt-6">
          <B2cMetricsPanel
            metric={data.b2c}
            periodFrom={data.period.from}
            periodTo={data.period.to}
            readOnly={readOnly}
          />
        </div>
      </main>
    </>
  );
}
