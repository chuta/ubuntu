import { Suspense } from "react";
import { getProfile } from "@/lib/supabase/server";
import { getTerritories } from "@/lib/actions/organizations";
import { getMeetings } from "@/lib/actions/regulatory";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/crm/page-header";
import { RegulatoryFilters } from "@/components/regulatory/regulatory-filters";
import { RegulatorySectionNav } from "@/components/regulatory/regulatory-section-nav";
import { MeetingTable } from "@/components/regulatory/meeting-table";
import { MEETING_STATUSES } from "@/lib/constants/regulatory";

export default async function MeetingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; territory_id?: string; search?: string }>;
}) {
  const profile = await getProfile();
  const params = await searchParams;
  const [meetings, territories] = await Promise.all([
    getMeetings({
      status: params.status,
      territory_id: params.territory_id,
      search: params.search,
    }),
    getTerritories(),
  ]);

  return (
    <>
      <Header profile={profile!} title="Regulatory Affairs" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <RegulatorySectionNav />
        <PageHeader
          title="Regulatory Meetings"
          description="Track meetings with regulators and authorities"
          actionHref="/regulatory/meetings/new"
          actionLabel="New Meeting"
        />
        <Suspense>
          <RegulatoryFilters
            basePath="/regulatory/meetings"
            statusOptions={MEETING_STATUSES}
            territories={territories}
          />
        </Suspense>
        <MeetingTable meetings={meetings} />
      </main>
    </>
  );
}
