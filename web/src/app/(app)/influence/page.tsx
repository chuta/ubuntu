import { Suspense } from "react";
import { getProfile } from "@/lib/supabase/server";
import {
  getInfluenceGraphData,
  getDealOptionsForInfluence,
  getOrganizationOptionsForInfluence,
  getTerritoryOptionsForInfluence,
  getContactOptionsForInfluence,
} from "@/lib/actions/influence";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/crm/page-header";
import { InfluenceGraph } from "@/components/influence/influence-graph";
import {
  InfluenceGraphFilters,
} from "@/components/influence/influence-graph-filters";
import { RelationshipPanel } from "@/components/influence/relationship-panel";

export default async function InfluencePage({
  searchParams,
}: {
  searchParams: Promise<{
    deal_id?: string;
    organization_id?: string;
    territory_id?: string;
    hide_types?: string;
  }>;
}) {
  const profile = await getProfile();
  const params = await searchParams;
  const hiddenTypes = new Set(params.hide_types?.split(",").filter(Boolean) ?? []);

  const filters = {
    deal_id: params.deal_id,
    organization_id: params.organization_id,
    territory_id: params.territory_id,
  };

  const [graphData, deals, organizations, territories, allContacts] = await Promise.all([
    getInfluenceGraphData(filters),
    getDealOptionsForInfluence(),
    getOrganizationOptionsForInfluence(),
    getTerritoryOptionsForInfluence(),
    getContactOptionsForInfluence(),
  ]);

  const contactOptions = allContacts.map((c) => ({
    id: c.id,
    first_name: c.first_name as string,
    last_name: c.last_name as string,
    organization_id: c.organization_id as string,
  }));

  return (
    <>
      <Header profile={profile!} title="Strategic Influence Graph" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <PageHeader
          title="Strategic Influence Graph"
          description="Person-to-person relationships, former roles, current influence, and relationship strength"
        />
        <Suspense>
          <InfluenceGraphFilters
            deals={deals}
            organizations={organizations}
            territories={territories}
          />
        </Suspense>

        <div className="space-y-6">
          <InfluenceGraph
            nodes={graphData.nodes}
            edges={graphData.edges}
            hiddenTypes={hiddenTypes}
          />

          <RelationshipPanel
            relationships={graphData.edges}
            contacts={contactOptions}
            dealId={params.deal_id}
            organizationId={params.organization_id}
            revalidatePaths={["/influence"]}
          />
        </div>
      </main>
    </>
  );
}
