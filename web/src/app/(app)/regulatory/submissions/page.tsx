import { Suspense } from "react";
import { getProfile } from "@/lib/supabase/server";
import { getTerritories } from "@/lib/actions/organizations";
import { getSubmissions } from "@/lib/actions/regulatory";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/crm/page-header";
import { RegulatoryFilters } from "@/components/regulatory/regulatory-filters";
import { RegulatorySectionNav } from "@/components/regulatory/regulatory-section-nav";
import { SubmissionTable } from "@/components/regulatory/submission-components";
import { SUBMISSION_STATUSES } from "@/lib/constants/regulatory";

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; territory_id?: string; search?: string }>;
}) {
  const profile = await getProfile();
  const params = await searchParams;
  const [submissions, territories] = await Promise.all([
    getSubmissions({ status: params.status, territory_id: params.territory_id, search: params.search }),
    getTerritories(),
  ]);

  return (
    <>
      <Header profile={profile!} title="Regulatory Affairs" />
      <main className="flex-1 overflow-y-auto p-6">
        <RegulatorySectionNav />
        <PageHeader title="Policy Submissions" description="Track policy submissions and regulatory filings" actionHref="/regulatory/submissions/new" actionLabel="New Submission" />
        <Suspense><RegulatoryFilters basePath="/regulatory/submissions" statusOptions={SUBMISSION_STATUSES} territories={territories} /></Suspense>
        <SubmissionTable submissions={submissions} />
      </main>
    </>
  );
}
