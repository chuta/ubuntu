import { Suspense } from "react";
import { getProfile } from "@/lib/supabase/server";
import { getDeals, getPipelineMetrics } from "@/lib/actions/deals";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/crm/page-header";
import { PipelineMetricsBar } from "@/components/pipeline/pipeline-metrics";
import { PipelineFilters } from "@/components/pipeline/pipeline-filters";
import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { DealTable } from "@/components/pipeline/deal-table";

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    stage?: string;
    segment?: string;
    revenue_engine?: string;
    search?: string;
    has_risk?: string;
    risk_flag?: string;
    risk_severity?: string;
    sort?: string;
  }>;
}) {
  const profile = await getProfile();
  const params = await searchParams;
  const view = params.view ?? "kanban";

  const [deals, metrics] = await Promise.all([
    getDeals(params),
    getPipelineMetrics(),
  ]);

  return (
    <>
      <Header profile={profile!} title="Deal Pipeline" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <PageHeader
          title="Pipeline"
          description="15-stage commercial lifecycle — COM v1.0"
          actionHref="/pipeline/new"
          actionLabel="New Deal"
        />
        <PipelineMetricsBar metrics={metrics} />
        <Suspense>
          <PipelineFilters />
        </Suspense>
        {view === "list" ? <DealTable deals={deals} /> : <KanbanBoard deals={deals} />}
      </main>
    </>
  );
}
