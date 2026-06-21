import type { CustomerSegment } from "@/types/pipeline";

export type KnowledgeAssetType =
  | "WHITEPAPER"
  | "PITCH_DECK"
  | "SOP"
  | "LEGAL_TEMPLATE"
  | "MARKET_RESEARCH"
  | "REGULATORY_BRIEF"
  | "PLAYBOOK"
  | "OTHER";

export type KnowledgeTag = {
  id: string;
  name: string;
  category: string | null;
};

export type KnowledgeAsset = {
  id: string;
  title: string;
  asset_type: KnowledgeAssetType;
  storage_url: string;
  summary: string | null;
  segment: CustomerSegment | null;
  product_id: string | null;
  territory_id: string | null;
  version: string | null;
  is_template: boolean;
  is_restricted: boolean;
  source_filename: string | null;
  created_at: string;
  updated_at: string;
  product?: { id: string; name: string } | null;
  territory?: { id: string; name: string } | null;
  author?: { full_name: string } | null;
  tags?: KnowledgeTag[];
};
