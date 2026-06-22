import { Suspense } from "react";
import { getProfile } from "@/lib/supabase/server";
import { getTerritories } from "@/lib/actions/organizations";
import { getConsultations } from "@/lib/actions/regulatory";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/crm/page-header";
import { RegulatoryFilters } from "@/components/regulatory/regulatory-filters";
import { RegulatorySectionNav } from "@/components/regulatory/regulatory-section-nav";
import { ConsultationTable } from "@/components/regulatory/consultation-components";
import { CONSULTATION_RESPONSE_STATUSES } from "@/lib/constants/regulatory";

export default async function ConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<{ response_status?: string; territory_id?: string; search?: string }>;
}) {
  const profile = await getProfile();
  const params = await searchParams;
  const [consultations, territories] = await Promise.all([
    getConsultations({ response_status: params.response_status, territory_id: params.territory_id, search: params.search }),
    getTerritories(),
  ]);

  return (
    <>
      <Header profile={profile!} title="Regulatory Affairs" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <RegulatorySectionNav />
        <PageHeader title="Consultation Papers" description="Track consultation papers and response deadlines" actionHref="/regulatory/consultations/new" actionLabel="New Consultation" />
        <Suspense><RegulatoryFilters basePath="/regulatory/consultations" statusKey="response_status" statusOptions={CONSULTATION_RESPONSE_STATUSES} territories={territories} /></Suspense>
        <ConsultationTable consultations={consultations} />
      </main>
    </>
  );
}
