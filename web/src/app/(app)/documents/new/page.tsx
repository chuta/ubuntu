import { getProfile } from "@/lib/supabase/server";
import { getLinkOptions } from "@/lib/actions/documents";
import { Header } from "@/components/layout/header";
import { DocumentForm } from "@/components/documents/document-form";

export default async function NewDocumentPage({
  searchParams,
}: {
  searchParams: Promise<{
    ai?: string;
    partnership_id?: string;
    organization_id?: string;
    deal_id?: string;
  }>;
}) {
  const profile = await getProfile();
  const params = await searchParams;
  const links = await getLinkOptions();

  return (
    <>
      <Header profile={profile!} title="New Document" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <DocumentForm
          links={links}
          aiMode={params.ai === "1"}
          defaultValues={{
            partnership_id: params.partnership_id,
            organization_id: params.organization_id,
            deal_id: params.deal_id,
          }}
        />
      </main>
    </>
  );
}
