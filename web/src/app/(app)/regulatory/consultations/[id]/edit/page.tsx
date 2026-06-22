import { notFound } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import { getTerritories } from "@/lib/actions/organizations";
import { getConsultation, getRegulatorOrganizationOptions, getRegulatoryDocumentOptions } from "@/lib/actions/regulatory";
import { Header } from "@/components/layout/header";
import { ConsultationForm } from "@/components/regulatory/consultation-form";

export default async function EditConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile();
  const [consultation, territories, organizations, documents] = await Promise.all([
    getConsultation(id),
    getTerritories(),
    getRegulatorOrganizationOptions(),
    getRegulatoryDocumentOptions(),
  ]);
  if (!consultation) notFound();

  return (
    <>
      <Header profile={profile!} title={`Edit — ${consultation.title}`} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Edit Consultation Paper</h2>
        <ConsultationForm territories={territories} organizations={organizations} documents={documents} consultation={consultation} />
      </main>
    </>
  );
}
