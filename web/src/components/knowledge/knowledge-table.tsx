import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { labelFor, KNOWLEDGE_ASSET_TYPES } from "@/lib/constants/knowledge";
import { labelFor as segmentLabel, CUSTOMER_SEGMENTS } from "@/lib/constants/deals";
import type { KnowledgeAsset } from "@/types/knowledge";
import { BookOpen, ChevronRight, Lock } from "lucide-react";

export function KnowledgeTable({ assets }: { assets: KnowledgeAsset[] }) {
  if (assets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">No knowledge assets yet.</p>
        <Link href="/knowledge/new" className="mt-2 inline-block text-sm text-brand-purple hover:underline">
          Upload your first asset
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Segment</th>
            <th className="px-4 py-3">Territory</th>
            <th className="px-4 py-3">Tags</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {assets.map((asset) => {
            const territory = Array.isArray(asset.territory) ? asset.territory[0] : asset.territory;
            return (
              <tr key={asset.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/knowledge/${asset.id}`} className="flex items-center gap-2 font-medium text-gray-900 hover:text-brand-purple">
                    <BookOpen className="h-4 w-4 text-brand-gold" />
                    {asset.title}
                    {asset.is_restricted && <Lock className="h-3 w-3 text-red-500" />}
                    {asset.is_template && <Badge variant="purple" className="ml-1">Template</Badge>}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{labelFor(KNOWLEDGE_ASSET_TYPES, asset.asset_type)}</td>
                <td className="px-4 py-3 text-gray-600">{asset.segment ? segmentLabel(CUSTOMER_SEGMENTS, asset.segment) : "—"}</td>
                <td className="px-4 py-3 text-gray-600">{territory?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(asset.tags ?? []).slice(0, 3).map((tag) => (
                      <Badge key={tag.id} variant="default">{tag.name}</Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/knowledge/${asset.id}`} className="text-gray-400 hover:text-brand-purple">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
