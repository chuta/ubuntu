import { Suspense } from "react";
import { getProfile } from "@/lib/supabase/server";
import { getTerritories } from "@/lib/actions/organizations";
import { getRequirements } from "@/lib/actions/regulatory";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/crm/page-header";
import { RegulatoryFilters } from "@/components/regulatory/regulatory-filters";
import { RegulatorySectionNav } from "@/components/regulatory/regulatory-section-nav";
import { RequirementTable } from "@/components/regulatory/requirement-components";
import { COMPLIANCE_STATUSES } from "@/lib/constants/regulatory";

export default async function RequirementsPage({
  searchParams,
}: {
  searchParams: Promise<{ compliance_status?: string; territory_id?: string; search?: string }>;
}) {
  const profile = await getProfile();
  const params = await searchParams;
  const [requirements, territories] = await Promise.all([
    getRequirements({ compliance_status: params.compliance_status, territory_id: params.territory_id, search: params.search }),
    getTerritories(),
  ]);

  return (
    <>
      <Header profile={profile!} title="Regulatory Affairs" />
      <main className="flex-1 overflow-y-auto p-6">
        <RegulatorySectionNav />
        <PageHeader title="Compliance Requirements" description="Track jurisdiction-specific regulatory requirements" actionHref="/regulatory/requirements/new" actionLabel="New Requirement" />
        <Suspense><RegulatoryFilters basePath="/regulatory/requirements" statusKey="compliance_status" statusOptions={COMPLIANCE_STATUSES} territories={territories} /></Suspense>
        <RequirementTable requirements={requirements} />
      </main>
    </>
  );
}
