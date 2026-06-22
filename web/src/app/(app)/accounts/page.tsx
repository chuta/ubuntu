import { Suspense } from "react";
import { getProfile } from "@/lib/supabase/server";
import { getOrganizations, getTerritories } from "@/lib/actions/organizations";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/crm/page-header";
import { OrganizationFilters } from "@/components/crm/organization-filters";
import { OrganizationTable } from "@/components/crm/organization-table";

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; territory_id?: string; search?: string }>;
}) {
  const profile = await getProfile();
  const params = await searchParams;
  const [organizations, territories] = await Promise.all([
    getOrganizations("INSTITUTIONAL", params),
    getTerritories(),
  ]);

  return (
    <>
      <Header profile={profile!} title="Institutional Accounts" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <PageHeader
          title="Accounts"
          description="Banks, PSPs, exchanges, mining companies, family offices"
          actionHref="/accounts/new"
          actionLabel="Add Account"
        />
        <Suspense>
          <OrganizationFilters territories={territories} />
        </Suspense>
        <OrganizationTable organizations={organizations} basePath="/accounts" variant="account" />
      </main>
    </>
  );
}
