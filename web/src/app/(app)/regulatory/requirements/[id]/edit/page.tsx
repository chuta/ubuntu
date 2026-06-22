import { notFound } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import { getTerritories } from "@/lib/actions/organizations";
import { getRequirement, getRegulatoryDocumentOptions, getRegulatoryProductOptions } from "@/lib/actions/regulatory";
import { Header } from "@/components/layout/header";
import { RequirementForm } from "@/components/regulatory/requirement-form";

export default async function EditRequirementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile();
  const [requirement, territories, products, documents] = await Promise.all([
    getRequirement(id),
    getTerritories(),
    getRegulatoryProductOptions(),
    getRegulatoryDocumentOptions(),
  ]);
  if (!requirement) notFound();

  return (
    <>
      <Header profile={profile!} title={`Edit — ${requirement.title}`} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Edit Compliance Requirement</h2>
        <RequirementForm territories={territories} products={products} documents={documents} requirement={requirement} />
      </main>
    </>
  );
}
