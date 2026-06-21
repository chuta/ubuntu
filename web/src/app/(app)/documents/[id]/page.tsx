import { notFound } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/supabase/server";
import { getDocument, getDocumentVersions } from "@/lib/actions/documents";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { DocumentDetailSummary, VersionPanel } from "@/components/documents/document-detail";
import { DeleteDocumentButton } from "@/components/documents/delete-document-button";
import { ArrowLeft, Pencil } from "lucide-react";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  const [document, versions] = await Promise.all([
    getDocument(id),
    getDocumentVersions(id),
  ]);

  if (!document) notFound();

  return (
    <>
      <Header profile={profile!} title={document.title} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/documents" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-purple">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Documents
          </Link>
          <div className="flex gap-2">
            <Link href={`/documents/${id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <DeleteDocumentButton id={id} title={document.title} />
          </div>
        </div>
        <div className="space-y-6">
          <DocumentDetailSummary document={document} />
          <VersionPanel documentId={id} documentType={document.document_type} versions={versions} />
        </div>
      </main>
    </>
  );
}
