import { getProfile } from "@/lib/supabase/server";
import { getKnowledgeFilterOptions } from "@/lib/actions/knowledge";
import { Header } from "@/components/layout/header";
import { KnowledgeUploadForm } from "@/components/knowledge/knowledge-upload-form";

export default async function NewKnowledgePage() {
  const profile = await getProfile();
  const options = await getKnowledgeFilterOptions();

  return (
    <>
      <Header profile={profile!} title="Upload to Knowledge Vault" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <KnowledgeUploadForm
          products={options.products}
          territories={options.territories}
          tags={options.tags}
        />
      </main>
    </>
  );
}
