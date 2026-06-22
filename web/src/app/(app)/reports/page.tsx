import { Suspense } from "react";
import Link from "next/link";
import { getProfile } from "@/lib/supabase/server";
import { getExecutiveReportData } from "@/lib/actions/reports";
import { Header } from "@/components/layout/header";
import { DateRangeFilter } from "@/components/reports/date-range-filter";
import { ExportReportButtons } from "@/components/reports/export-report-buttons";
import { ExecutiveDashboard } from "@/components/reports/executive-dashboard";
import { ArrowLeft } from "lucide-react";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; from?: string; to?: string }>;
}) {
  const profile = await getProfile();
  const params = await searchParams;
  const data = await getExecutiveReportData(params);

  return (
    <>
      <Header profile={profile!} title="Executive Report" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-purple">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Command Center
          </Link>
          <ExportReportButtons preset={params.preset} from={params.from} to={params.to} />
        </div>

        <div className="mb-6 rounded-xl border border-brand-gold/30 bg-gradient-to-r from-brand-purple/5 to-brand-gold/5 p-6">
          <h2 className="text-xl font-bold text-gray-900">Weekly Executive Report</h2>
          <p className="mt-1 text-sm text-gray-600">
            {data.period.label} · Generated for {data.generatedBy}
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Review pipeline, government, tokenization, and event ROI — then export PDF for leadership.
          </p>
        </div>

        <div className="mb-6">
          <Suspense>
            <DateRangeFilter />
          </Suspense>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 print:border-0 print:p-0">
          <ExecutiveDashboard data={data} compact />
        </div>
      </main>
    </>
  );
}
