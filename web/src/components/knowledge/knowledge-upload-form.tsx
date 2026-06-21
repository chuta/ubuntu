"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/crm/form-field";
import { registerKnowledgeUpload } from "@/lib/actions/knowledge";
import { KNOWLEDGE_ASSET_TYPES } from "@/lib/constants/knowledge";
import { CUSTOMER_SEGMENTS } from "@/lib/constants/deals";
import type { KnowledgeTag } from "@/types/knowledge";
import type { CustomerSegment } from "@/types/pipeline";
import type { KnowledgeAssetType } from "@/types/knowledge";

export function KnowledgeUploadForm({
  products,
  territories,
  tags,
}: {
  products: { id: string; name: string }[];
  territories: { id: string; name: string }[];
  tags: KnowledgeTag[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  function toggleTag(id: string) {
    setSelectedTags((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fileInput = (e.currentTarget.elements.namedItem("file") as HTMLInputElement);
    const file = fileInput.files?.[0];
    if (!file) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    try {
      const { assetId, key, storageUrl } = await registerKnowledgeUpload(
        {
          title: fd.get("title") as string,
          asset_type: fd.get("asset_type") as KnowledgeAssetType,
          summary: (fd.get("summary") as string) || undefined,
          segment: (fd.get("segment") as CustomerSegment) || undefined,
          product_id: (fd.get("product_id") as string) || undefined,
          territory_id: (fd.get("territory_id") as string) || undefined,
          version: (fd.get("version") as string) || undefined,
          is_template: fd.get("is_template") === "on",
          tag_ids: selectedTags,
        },
        file.name
      );

      if (storageUrl.startsWith("s3://")) {
        const presign = await fetch("/api/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operation: "upload", key, contentType: file.type || "application/pdf" }),
        });
        const { url, error: uploadError } = await presign.json();
        if (uploadError || !url) {
          setError(uploadError ?? "S3 upload unavailable — asset registered without file");
        } else {
          await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        }
      }

      router.push(`/knowledge/${assetId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Title" htmlFor="title" required className="sm:col-span-2">
            <Input id="title" name="title" required />
          </FormField>
          <FormField label="Type" htmlFor="asset_type" required>
            <Select id="asset_type" name="asset_type" required defaultValue="PITCH_DECK">
              {KNOWLEDGE_ASSET_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Version" htmlFor="version">
            <Input id="version" name="version" placeholder="e.g. v1.0" />
          </FormField>
          <FormField label="Segment" htmlFor="segment">
            <Select id="segment" name="segment">
              <option value="">Not set</option>
              {CUSTOMER_SEGMENTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Product" htmlFor="product_id">
            <Select id="product_id" name="product_id">
              <option value="">Not set</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Territory" htmlFor="territory_id">
            <Select id="territory_id" name="territory_id">
              <option value="">Not set</option>
              {territories.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Summary" htmlFor="summary" className="sm:col-span-2">
            <Textarea id="summary" name="summary" rows={2} />
          </FormField>
          <FormField label="File" htmlFor="file" required className="sm:col-span-2">
            <Input id="file" name="file" type="file" required accept=".pdf,.md,.doc,.docx,.ppt,.pptx" />
          </FormField>
          <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
            <input type="checkbox" name="is_template" />
            Mark as template (usable for AI drafting context)
          </label>
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-medium text-gray-700">Tags</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedTags.includes(tag.id)
                      ? "bg-brand-purple text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Button type="submit" disabled={loading}>{loading ? "Uploading…" : "Upload to Vault"}</Button>
    </form>
  );
}
