import { Suspense } from "react";
import { getProfile } from "@/lib/supabase/server";
import { getPartnerships } from "@/lib/actions/partnerships";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/crm/page-header";
import { PartnershipFilters } from "@/components/partnerships/partnership-filters";
import { PartnershipTable } from "@/components/partnerships/partnership-table";

export default async function PartnershipsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; partnership_type?: string; search?: string }>;
}) {
  const profile = await getProfile();
  const params = await searchParams;
  const partnerships = await getPartnerships(params);

  return (
    <>
      <Header profile={profile!} title="Partnerships" />
      <main className="flex-1 overflow-y-auto p-6">
        <PageHeader
          title="Strategic Partnerships"
          description="Alliances, distribution partners, revenue share agreements"
          actionHref="/partnerships/new"
          actionLabel="New Partnership"
        />
        <Suspense>
          <PartnershipFilters />
        </Suspense>
        <PartnershipTable partnerships={partnerships} />
      </main>
    </>
  );
}
