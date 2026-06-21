import { notFound } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import { getDocument, getLinkOptions } from "@/lib/actions/documents";
import { Header } from "@/components/layout/header";
import { DocumentForm } from "@/components/documents/document-form";

export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  const [document, links] = await Promise.all([getDocument(id), getLinkOptions()]);

  if (!document) notFound();

  return (
    <>
      <Header profile={profile!} title={`Edit ${document.title}`} />
      <main className="flex-1 overflow-y-auto p-6">
        <DocumentForm links={links} document={document} />
      </main>
    </>
  );
}
