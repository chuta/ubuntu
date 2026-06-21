"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { KNOWLEDGE_ASSET_TYPES } from "@/lib/constants/knowledge";
import { CUSTOMER_SEGMENTS } from "@/lib/constants/deals";
import { Search } from "lucide-react";
import type { KnowledgeTag } from "@/types/knowledge";

export function KnowledgeFilters({
  products,
  territories,
  tags,
}: {
  products: { id: string; name: string }[];
  territories: { id: string; name: string }[];
  tags: KnowledgeTag[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search title or summary…"
          className="pl-9"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            clearTimeout((window as unknown as { _kSearch?: ReturnType<typeof setTimeout> })._kSearch);
            (window as unknown as { _kSearch?: ReturnType<typeof setTimeout> })._kSearch = setTimeout(
              () => update("search", value),
              300
            );
          }}
        />
      </div>
      <Select value={searchParams.get("asset_type") ?? ""} onChange={(e) => update("asset_type", e.target.value)} className="sm:w-40">
        <option value="">All types</option>
        {KNOWLEDGE_ASSET_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </Select>
      <Select value={searchParams.get("segment") ?? ""} onChange={(e) => update("segment", e.target.value)} className="sm:w-36">
        <option value="">All segments</option>
        {CUSTOMER_SEGMENTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </Select>
      <Select value={searchParams.get("territory_id") ?? ""} onChange={(e) => update("territory_id", e.target.value)} className="sm:w-40">
        <option value="">All territories</option>
        {territories.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </Select>
      <Select value={searchParams.get("tag_id") ?? ""} onChange={(e) => update("tag_id", e.target.value)} className="sm:w-40">
        <option value="">All tags</option>
        {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </Select>
    </div>
  );
}
