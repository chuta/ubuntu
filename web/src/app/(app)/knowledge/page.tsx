import { Suspense } from "react";
import { getProfile } from "@/lib/supabase/server";
import { getKnowledgeAssets, getKnowledgeFilterOptions } from "@/lib/actions/knowledge";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/crm/page-header";
import { KnowledgeFilters } from "@/components/knowledge/knowledge-filters";
import { KnowledgeTable } from "@/components/knowledge/knowledge-table";

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{
    asset_type?: string;
    segment?: string;
    territory_id?: string;
    tag_id?: string;
    search?: string;
  }>;
}) {
  const profile = await getProfile();
  const params = await searchParams;
  const [assets, filterOptions] = await Promise.all([
    getKnowledgeAssets(params),
    getKnowledgeFilterOptions(),
  ]);

  return (
    <>
      <Header profile={profile!} title="Knowledge Vault" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <PageHeader
          title="Knowledge Vault"
          description="Source PDFs, templates, and institutional intelligence"
          actionHref="/knowledge/new"
          actionLabel="Upload Asset"
        />
        <Suspense>
          <KnowledgeFilters
            products={filterOptions.products}
            territories={filterOptions.territories}
            tags={filterOptions.tags}
          />
        </Suspense>
        <KnowledgeTable assets={assets} />
      </main>
    </>
  );
}
