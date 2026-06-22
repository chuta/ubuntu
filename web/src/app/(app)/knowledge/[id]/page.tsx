import { notFound } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/supabase/server";
import { getKnowledgeAsset } from "@/lib/actions/knowledge";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { labelFor, KNOWLEDGE_ASSET_TYPES } from "@/lib/constants/knowledge";
import { labelFor as segmentLabel, CUSTOMER_SEGMENTS } from "@/lib/constants/deals";
import { DeleteKnowledgeButton } from "@/components/knowledge/delete-knowledge-button";
import { KnowledgeDownloadButton } from "@/components/knowledge/knowledge-download-button";
import { ArrowLeft } from "lucide-react";

export default async function KnowledgeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  const asset = await getKnowledgeAsset(id);

  if (!asset) notFound();

  const product = Array.isArray(asset.product) ? asset.product[0] : asset.product;
  const territory = Array.isArray(asset.territory) ? asset.territory[0] : asset.territory;

  return (
    <>
      <Header profile={profile!} title={asset.title} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/knowledge" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-purple">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Knowledge Vault
          </Link>
          <DeleteKnowledgeButton id={id} title={asset.title} />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="gold">{labelFor(KNOWLEDGE_ASSET_TYPES, asset.asset_type)}</Badge>
            {asset.is_template && <Badge variant="purple">Template</Badge>}
            {asset.is_restricted && <Badge variant="red">Restricted</Badge>}
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Segment</dt>
              <dd className="mt-0.5 text-sm">{asset.segment ? segmentLabel(CUSTOMER_SEGMENTS, asset.segment) : "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Product</dt>
              <dd className="mt-0.5 text-sm">{product?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Territory</dt>
              <dd className="mt-0.5 text-sm">{territory?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Version</dt>
              <dd className="mt-0.5 text-sm">{asset.version ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">File</dt>
              <dd className="mt-0.5 text-sm">{asset.source_filename ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Author</dt>
              <dd className="mt-0.5 text-sm">{asset.author?.full_name ?? "—"}</dd>
            </div>
          </dl>
          {asset.summary && (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Summary</p>
              <p className="mt-1 text-sm text-gray-700">{asset.summary}</p>
            </div>
          )}
          {(asset.tags ?? []).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {asset.tags!.map((tag) => (
                <Badge key={tag.id} variant="default">{tag.name}</Badge>
              ))}
            </div>
          )}
          {asset.storage_url.startsWith("s3://") && (
            <div className="mt-6">
              <KnowledgeDownloadButton storageUrl={asset.storage_url} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
