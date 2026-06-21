import { Suspense } from "react";
import { getProfile } from "@/lib/supabase/server";
import { getOrganizations, getTerritories } from "@/lib/actions/organizations";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/crm/page-header";
import { OrganizationFilters } from "@/components/crm/organization-filters";
import { OrganizationTable } from "@/components/crm/organization-table";

export default async function GovernmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; territory_id?: string; search?: string }>;
}) {
  const profile = await getProfile();
  const params = await searchParams;
  const [organizations, territories] = await Promise.all([
    getOrganizations("GOVERNMENT", params),
    getTerritories(),
  ]);

  return (
    <>
      <Header profile={profile!} title="Government Relations CRM" />
      <main className="flex-1 overflow-y-auto p-6">
        <PageHeader
          title="Governments"
          description="Sovereign engagements, stakeholder maps, influence tracking"
          actionHref="/governments/new"
          actionLabel="Add Government"
        />
        <Suspense>
          <OrganizationFilters territories={territories} />
        </Suspense>
        <OrganizationTable organizations={organizations} basePath="/governments" variant="government" />
      </main>
    </>
  );
}
