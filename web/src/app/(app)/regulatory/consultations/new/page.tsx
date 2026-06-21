import { getProfile } from "@/lib/supabase/server";
import { getTerritories } from "@/lib/actions/organizations";
import { getRegulatorOrganizationOptions, getRegulatoryDocumentOptions } from "@/lib/actions/regulatory";
import { Header } from "@/components/layout/header";
import { ConsultationForm } from "@/components/regulatory/consultation-form";

export default async function NewConsultationPage() {
  const profile = await getProfile();
  const [territories, organizations, documents] = await Promise.all([
    getTerritories(),
    getRegulatorOrganizationOptions(),
    getRegulatoryDocumentOptions(),
  ]);

  return (
    <>
      <Header profile={profile!} title="New Consultation" />
      <main className="flex-1 overflow-y-auto p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Create Consultation Paper</h2>
        <ConsultationForm territories={territories} organizations={organizations} documents={documents} />
      </main>
    </>
  );
}
