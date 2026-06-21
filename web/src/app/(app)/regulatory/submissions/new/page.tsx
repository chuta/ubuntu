import { getProfile } from "@/lib/supabase/server";
import { getTerritories } from "@/lib/actions/organizations";
import { getRegulatorOrganizationOptions, getRegulatoryDealOptions, getRegulatoryDocumentOptions } from "@/lib/actions/regulatory";
import { Header } from "@/components/layout/header";
import { SubmissionForm } from "@/components/regulatory/submission-form";

export default async function NewSubmissionPage() {
  const profile = await getProfile();
  const [territories, organizations, deals, documents] = await Promise.all([
    getTerritories(),
    getRegulatorOrganizationOptions(),
    getRegulatoryDealOptions(),
    getRegulatoryDocumentOptions(),
  ]);

  return (
    <>
      <Header profile={profile!} title="New Submission" />
      <main className="flex-1 overflow-y-auto p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Create Policy Submission</h2>
        <SubmissionForm territories={territories} organizations={organizations} deals={deals} documents={documents} />
      </main>
    </>
  );
}
