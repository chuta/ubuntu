import { getProfile } from "@/lib/supabase/server";
import { getTerritories } from "@/lib/actions/organizations";
import { getRegulatoryDocumentOptions, getRegulatoryProductOptions } from "@/lib/actions/regulatory";
import { Header } from "@/components/layout/header";
import { RequirementForm } from "@/components/regulatory/requirement-form";

export default async function NewRequirementPage() {
  const profile = await getProfile();
  const [territories, products, documents] = await Promise.all([
    getTerritories(),
    getRegulatoryProductOptions(),
    getRegulatoryDocumentOptions(),
  ]);

  return (
    <>
      <Header profile={profile!} title="New Requirement" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Create Compliance Requirement</h2>
        <RequirementForm territories={territories} products={products} documents={documents} />
      </main>
    </>
  );
}
