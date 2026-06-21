import type { KnowledgeAssetType } from "@/types/knowledge";

export const KNOWLEDGE_ASSET_TYPES: { value: KnowledgeAssetType; label: string }[] = [
  { value: "WHITEPAPER", label: "Whitepaper" },
  { value: "PITCH_DECK", label: "Pitch Deck" },
  { value: "SOP", label: "SOP" },
  { value: "LEGAL_TEMPLATE", label: "Legal Template" },
  { value: "MARKET_RESEARCH", label: "Market Research" },
  { value: "REGULATORY_BRIEF", label: "Regulatory Brief" },
  { value: "PLAYBOOK", label: "Playbook" },
  { value: "OTHER", label: "Other" },
];

export function labelFor<T extends string>(
  options: { value: T; label: string }[],
  value: string | null | undefined
): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}
