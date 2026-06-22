import { notFound } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import { getTerritories } from "@/lib/actions/organizations";
import { getSubmission, getRegulatorOrganizationOptions, getRegulatoryDealOptions, getRegulatoryDocumentOptions } from "@/lib/actions/regulatory";
import { Header } from "@/components/layout/header";
import { SubmissionForm } from "@/components/regulatory/submission-form";

export default async function EditSubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile();
  const [submission, territories, organizations, deals, documents] = await Promise.all([
    getSubmission(id),
    getTerritories(),
    getRegulatorOrganizationOptions(),
    getRegulatoryDealOptions(),
    getRegulatoryDocumentOptions(),
  ]);
  if (!submission) notFound();

  return (
    <>
      <Header profile={profile!} title={`Edit — ${submission.title}`} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Edit Policy Submission</h2>
        <SubmissionForm territories={territories} organizations={organizations} deals={deals} documents={documents} submission={submission} />
      </main>
    </>
  );
}
