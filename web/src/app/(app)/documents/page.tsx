import { Suspense } from "react";
import { getProfile } from "@/lib/supabase/server";
import { getDocuments } from "@/lib/actions/documents";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/crm/page-header";
import { DocumentFilters } from "@/components/documents/document-filters";
import { DocumentTable } from "@/components/documents/document-table";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ document_type?: string; status?: string; search?: string }>;
}) {
  const profile = await getProfile();
  const params = await searchParams;
  const documents = await getDocuments(params);

  return (
    <>
      <Header profile={profile!} title="Document Intelligence" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <PageHeader
          title="Documents"
          description="AI-assisted NDA, MOU, and proposal drafting with version control"
          actionHref="/documents/new"
          actionLabel="New Document"
        />
        <Suspense>
          <DocumentFilters />
        </Suspense>
        <DocumentTable documents={documents} />
      </main>
    </>
  );
}
