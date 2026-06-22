import { Suspense } from "react";
import { getProfile } from "@/lib/supabase/server";
import { getTokenizationProjects } from "@/lib/actions/tokenization";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/crm/page-header";
import { TokenizationFilters } from "@/components/tokenization/tokenization-filters";
import { PhaseBoard } from "@/components/tokenization/phase-board";
import { ProjectTable } from "@/components/tokenization/project-card";

export default async function TokenizationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; asset_type?: string; phase?: string; search?: string; view?: string }>;
}) {
  const profile = await getProfile();
  const params = await searchParams;
  const view = params.view ?? "board";
  const projects = await getTokenizationProjects(params);

  return (
    <>
      <Header profile={profile!} title="Tokenization Registry" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <PageHeader
          title="B2G Tokenization Registry"
          description="Resource Discovery through Development & Deployment"
          actionHref="/tokenization/new"
          actionLabel="New Project"
        />
        <Suspense>
          <TokenizationFilters />
        </Suspense>
        {view === "list" ? (
          <ProjectTable projects={projects} />
        ) : (
          <PhaseBoard projects={projects} />
        )}
      </main>
    </>
  );
}
