export type DocumentType =
  | "NDA"
  | "MOU"
  | "PROPOSAL"
  | "GOVERNMENT_BRIEF"
  | "PARTNERSHIP_AGREEMENT"
  | "INVESTOR_DECK"
  | "CONTRACT"
  | "SOW"
  | "OTHER";

export type DocumentStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "SENT"
  | "SIGNED"
  | "EXECUTED"
  | "EXPIRED"
  | "TERMINATED";

export type DocumentLink = { id: string; name: string };

export type DocumentVersion = {
  id: string;
  document_id: string;
  version_number: number;
  storage_url: string;
  file_hash: string | null;
  change_summary: string | null;
  created_by_id: string;
  created_at: string;
  created_by?: { full_name: string } | null;
};

export type Document = {
  id: string;
  title: string;
  document_type: DocumentType;
  status: DocumentStatus;
  organization_id: string | null;
  deal_id: string | null;
  partnership_id: string | null;
  current_version_id: string | null;
  owner_id: string;
  effective_date: string | null;
  expiration_date: string | null;
  signed_date: string | null;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
  organization?: DocumentLink | null;
  deal?: DocumentLink | null;
  partnership?: DocumentLink | null;
  current_version?: DocumentVersion | null;
};
