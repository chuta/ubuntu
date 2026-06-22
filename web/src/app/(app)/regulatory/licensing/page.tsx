import { Suspense } from "react";
import { getProfile } from "@/lib/supabase/server";
import { getTerritories } from "@/lib/actions/organizations";
import { getLicensingConversations } from "@/lib/actions/regulatory";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/crm/page-header";
import { RegulatoryFilters } from "@/components/regulatory/regulatory-filters";
import { RegulatorySectionNav } from "@/components/regulatory/regulatory-section-nav";
import { LicensingTable } from "@/components/regulatory/licensing-components";
import { LICENSING_STATUSES } from "@/lib/constants/regulatory";

export default async function LicensingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; territory_id?: string; search?: string }>;
}) {
  const profile = await getProfile();
  const params = await searchParams;
  const [conversations, territories] = await Promise.all([
    getLicensingConversations({ status: params.status, territory_id: params.territory_id, search: params.search }),
    getTerritories(),
  ]);

  return (
    <>
      <Header profile={profile!} title="Regulatory Affairs" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <RegulatorySectionNav />
        <PageHeader title="Licensing Conversations" description="Track licensing dialogues and application status" actionHref="/regulatory/licensing/new" actionLabel="New Conversation" />
        <Suspense><RegulatoryFilters basePath="/regulatory/licensing" statusOptions={LICENSING_STATUSES} territories={territories} /></Suspense>
        <LicensingTable conversations={conversations} />
      </main>
    </>
  );
}
