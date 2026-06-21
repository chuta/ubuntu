"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";
import { RELATIONSHIP_TYPES } from "@/lib/constants/influence";

type Option = { id: string; name: string };

export function InfluenceGraphFilters({
  deals,
  organizations,
  territories,
}: {
  deals: Option[];
  organizations: Option[];
  territories: Option[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/influence?${next.toString()}`);
  }

  function toggleType(type: string) {
    const current = params.get("hide_types")?.split(",").filter(Boolean) ?? [];
    const next = new URLSearchParams(params.toString());
    if (current.includes(type)) {
      const filtered = current.filter((t) => t !== type);
      if (filtered.length) next.set("hide_types", filtered.join(","));
      else next.delete("hide_types");
    } else {
      next.set("hide_types", [...current, type].join(","));
    }
    router.push(`/influence?${next.toString()}`);
  }

  const hidden = new Set(params.get("hide_types")?.split(",").filter(Boolean) ?? []);

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap gap-3">
        <Select
          defaultValue={params.get("deal_id") ?? ""}
          onChange={(e) => update("deal_id", e.target.value)}
          className="max-w-xs"
        >
          <option value="">All deals</option>
          {deals.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </Select>
        <Select
          defaultValue={params.get("organization_id") ?? ""}
          onChange={(e) => update("organization_id", e.target.value)}
          className="max-w-xs"
        >
          <option value="">All organizations</option>
          {organizations.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </Select>
        <Select
          defaultValue={params.get("territory_id") ?? ""}
          onChange={(e) => update("territory_id", e.target.value)}
          className="max-w-xs"
        >
          <option value="">All territories</option>
          {territories.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Select>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="mr-1 self-center text-xs text-gray-500">Hide types:</span>
        {RELATIONSHIP_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => toggleType(t.value)}
            className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
              hidden.has(t.value)
                ? "bg-gray-200 text-gray-400 line-through"
                : "bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function parseHiddenTypes(searchParams: URLSearchParams): Set<string> {
  return new Set(searchParams.get("hide_types")?.split(",").filter(Boolean) ?? []);
}
