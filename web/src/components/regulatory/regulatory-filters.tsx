"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Territory } from "@/types/crm";

type FilterOption = { value: string; label: string };

export function RegulatoryFilters({
  basePath,
  statusOptions,
  statusKey = "status",
  territories,
}: {
  basePath: string;
  statusOptions: FilterOption[];
  statusKey?: string;
  territories: Territory[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${basePath}?${next.toString()}`);
  }

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <Input
        placeholder="Search…"
        defaultValue={params.get("search") ?? ""}
        className="max-w-xs"
        onChange={(e) => {
          const v = e.target.value;
          clearTimeout((window as unknown as { _reg?: ReturnType<typeof setTimeout> })._reg);
          (window as unknown as { _reg?: ReturnType<typeof setTimeout> })._reg = setTimeout(
            () => update("search", v),
            300
          );
        }}
      />
      <Select
        defaultValue={params.get(statusKey) ?? ""}
        onChange={(e) => update(statusKey, e.target.value)}
      >
        <option value="">All statuses</option>
        {statusOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
      <Select
        defaultValue={params.get("territory_id") ?? ""}
        onChange={(e) => update("territory_id", e.target.value)}
      >
        <option value="">All territories</option>
        {territories.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
