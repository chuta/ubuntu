import { getProfile } from "@/lib/supabase/server";
import { getForecasts, getForecastSummary } from "@/lib/actions/forecasts";
import { Header } from "@/components/layout/header";
import { ForecastForm } from "@/components/pipeline/forecast-form";
import { formatCurrency } from "@/lib/utils";
import { labelFor, FORECAST_PERIODS, CUSTOMER_SEGMENTS, REVENUE_ENGINES } from "@/lib/constants/deals";

export default async function ForecastPage() {
  const profile = await getProfile();
  const [forecasts, summary] = await Promise.all([getForecasts(), getForecastSummary()]);

  return (
    <>
      <Header profile={profile!} title="Revenue Forecast" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Open Pipeline</p>
            <p className="mt-1 text-xl font-bold text-brand-purple">{formatCurrency(summary.pipelineTotal)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Weighted Pipeline</p>
            <p className="mt-1 text-xl font-bold text-brand-gold">{formatCurrency(summary.pipelineWeighted)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total Forecast</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(summary.totalForecast)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Commit / Best Case</p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {formatCurrency(summary.totalCommit)} / {formatCurrency(summary.totalBestCase)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ForecastForm />
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <h3 className="text-sm font-semibold text-gray-900">Forecast History</h3>
            </div>
            {forecasts.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-500">No forecasts submitted yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3">Scope</th>
                    <th className="px-4 py-3">Forecast</th>
                    <th className="px-4 py-3">Commit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {forecasts.map((f) => (
                    <tr key={f.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{labelFor(FORECAST_PERIODS, f.period_type)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(f.period_start).toLocaleDateString()} – {new Date(f.period_end).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {f.segment ? labelFor(CUSTOMER_SEGMENTS, f.segment) : "All"}
                        {f.revenue_engine && (
                          <span className="block text-xs">{labelFor(REVENUE_ENGINES, f.revenue_engine)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-brand-gold">{formatCurrency(f.forecast_amount)}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {f.commit_amount ? formatCurrency(f.commit_amount) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
