"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import { SELECT } from "@/lib/supabase/embeds";
import { knowledgeKey, isStorageConfigured } from "@/lib/s3/storage";
import type { CustomerSegment } from "@/types/pipeline";
import type { KnowledgeAsset, KnowledgeAssetType, KnowledgeTag } from "@/types/knowledge";
import { revalidatePath } from "next/cache";

export type KnowledgeFormData = {
  title: string;
  asset_type: KnowledgeAssetType;
  summary?: string;
  segment?: CustomerSegment;
  product_id?: string;
  territory_id?: string;
  version?: string;
  is_template?: boolean;
  tag_ids?: string[];
};

export async function getKnowledgeTags(): Promise<KnowledgeTag[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("knowledge_tags").select("id, name, category").order("name");
  return data ?? [];
}

export async function getKnowledgeAssets(filters?: {
  asset_type?: string;
  segment?: string;
  product_id?: string;
  territory_id?: string;
  search?: string;
  tag_id?: string;
}): Promise<KnowledgeAsset[]> {
  const supabase = await createClient();

  let query = supabase
    .from("knowledge_assets")
    .select(SELECT.knowledgeAsset)
    .order("updated_at", { ascending: false });

  if (filters?.asset_type) query = query.eq("asset_type", filters.asset_type);
  if (filters?.segment) query = query.eq("segment", filters.segment);
  if (filters?.product_id) query = query.eq("product_id", filters.product_id);
  if (filters?.territory_id) query = query.eq("territory_id", filters.territory_id);
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,summary.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let assets = (data ?? []) as KnowledgeAsset[];

  if (filters?.tag_id) {
    const { data: tagged } = await supabase
      .from("knowledge_asset_tags")
      .select("knowledge_asset_id")
      .eq("tag_id", filters.tag_id);
    const ids = new Set((tagged ?? []).map((t) => t.knowledge_asset_id));
    assets = assets.filter((a) => ids.has(a.id));
  }

  const withTags = await Promise.all(assets.map(async (asset) => {
    const tags = await getAssetTags(asset.id);
    return { ...asset, tags };
  }));

  return withTags;
}

async function getAssetTags(assetId: string): Promise<KnowledgeTag[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("knowledge_asset_tags")
    .select("tag:knowledge_tags(id, name, category)")
    .eq("knowledge_asset_id", assetId);

  return (data ?? []).map((row) => {
    const tag = row.tag;
    return Array.isArray(tag) ? tag[0] : tag;
  }).filter(Boolean) as KnowledgeTag[];
}

export async function getKnowledgeAsset(id: string): Promise<KnowledgeAsset | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("knowledge_assets")
    .select(SELECT.knowledgeAsset)
    .eq("id", id)
    .single();

  if (error) return null;
  const tags = await getAssetTags(id);
  return { ...(data as KnowledgeAsset), tags };
}

export async function getKnowledgeCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase.from("knowledge_assets").select("*", { count: "exact", head: true });
  return count ?? 0;
}

export async function createKnowledgeAsset(
  data: KnowledgeFormData,
  storageUrl: string,
  sourceFilename: string
) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { data: asset, error } = await supabase
    .from("knowledge_assets")
    .insert({
      title: data.title,
      asset_type: data.asset_type,
      storage_url: storageUrl,
      summary: data.summary || null,
      segment: data.segment || null,
      product_id: data.product_id || null,
      territory_id: data.territory_id || null,
      version: data.version || null,
      is_template: data.is_template ?? false,
      source_filename: sourceFilename,
      author_id: profile.id,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  if (data.tag_ids?.length) {
    await supabase.from("knowledge_asset_tags").insert(
      data.tag_ids.map((tag_id) => ({ knowledge_asset_id: asset.id, tag_id }))
    );
  }

  revalidatePath("/knowledge");
  revalidatePath("/dashboard");
  return asset.id;
}

export async function registerKnowledgeUpload(data: KnowledgeFormData, filename: string) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { data: asset, error } = await supabase
    .from("knowledge_assets")
    .insert({
      title: data.title,
      asset_type: data.asset_type,
      storage_url: "pending://upload",
      summary: data.summary || null,
      segment: data.segment || null,
      product_id: data.product_id || null,
      territory_id: data.territory_id || null,
      version: data.version || null,
      is_template: data.is_template ?? false,
      source_filename: filename,
      author_id: profile.id,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const key = knowledgeKey(asset.id, filename);
  const storageUrl = isStorageConfigured()
    ? `s3://${process.env.AWS_S3_BUCKET_NAME ?? process.env.AWS_S3_BUCKET}/${key}`
    : `pending://${asset.id}/${filename}`;

  await supabase.from("knowledge_assets").update({ storage_url: storageUrl }).eq("id", asset.id);

  if (data.tag_ids?.length) {
    await supabase.from("knowledge_asset_tags").insert(
      data.tag_ids.map((tag_id) => ({ knowledge_asset_id: asset.id, tag_id }))
    );
  }

  revalidatePath("/knowledge");
  return { assetId: asset.id, key, storageUrl };
}

export async function deleteKnowledgeAsset(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("knowledge_assets").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/knowledge");
  revalidatePath("/dashboard");
}

export async function getKnowledgeFilterOptions() {
  const supabase = await createClient();
  const [products, territories, tags] = await Promise.all([
    supabase.from("products").select("id, name").eq("is_active", true).order("name"),
    supabase.from("territories").select("id, name").eq("is_active", true).order("name"),
    getKnowledgeTags(),
  ]);
  return {
    products: products.data ?? [],
    territories: territories.data ?? [],
    tags,
  };
}
