import { getProfile } from "@/lib/supabase/server";
import { getGovernmentOrganizationOptions } from "@/lib/actions/tokenization";
import { getDealOptions } from "@/lib/actions/partnerships";
import { Header } from "@/components/layout/header";
import { TokenizationProjectForm } from "@/components/tokenization/project-form";

export default async function NewTokenizationPage() {
  const profile = await getProfile();
  const [organizations, deals] = await Promise.all([
    getGovernmentOrganizationOptions(),
    getDealOptions(),
  ]);

  return (
    <>
      <Header profile={profile!} title="New Tokenization Project" />
      <main className="flex-1 overflow-y-auto p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Create Tokenization Project</h2>
        <TokenizationProjectForm organizations={organizations} deals={deals} />
      </main>
    </>
  );
}
