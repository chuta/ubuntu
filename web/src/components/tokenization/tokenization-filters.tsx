"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ASSET_TYPES, B2G_PHASES, PROJECT_STATUSES } from "@/lib/constants/tokenization";

export function TokenizationFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const view = params.get("view") ?? "board";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/tokenization?${next.toString()}`);
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="flex rounded-lg border border-gray-200 bg-white p-0.5 text-sm">
        <Link
          href={`/tokenization?view=board${params.get("search") ? `&search=${params.get("search")}` : ""}`}
          className={`rounded-md px-3 py-1.5 ${view === "board" ? "bg-brand-purple text-white" : "text-gray-600 hover:text-brand-purple"}`}
        >
          Board
        </Link>
        <Link
          href={`/tokenization?view=list${params.get("search") ? `&search=${params.get("search")}` : ""}`}
          className={`rounded-md px-3 py-1.5 ${view === "list" ? "bg-brand-purple text-white" : "text-gray-600 hover:text-brand-purple"}`}
        >
          List
        </Link>
      </div>
      <Input
        placeholder="Search projects…"
        defaultValue={params.get("search") ?? ""}
        className="max-w-xs"
        onChange={(e) => {
          const v = e.target.value;
          clearTimeout((window as unknown as { _tok?: ReturnType<typeof setTimeout> })._tok);
          (window as unknown as { _tok?: ReturnType<typeof setTimeout> })._tok = setTimeout(() => update("search", v), 300);
        }}
      />
      <Select defaultValue={params.get("status") ?? ""} onChange={(e) => update("status", e.target.value)}>
        <option value="">All statuses</option>
        {PROJECT_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </Select>
      <Select defaultValue={params.get("asset_type") ?? ""} onChange={(e) => update("asset_type", e.target.value)}>
        <option value="">All asset types</option>
        {ASSET_TYPES.map((a) => (
          <option key={a.value} value={a.value}>{a.label}</option>
        ))}
      </Select>
      {view === "list" && (
        <Select defaultValue={params.get("phase") ?? ""} onChange={(e) => update("phase", e.target.value)}>
          <option value="">All phases</option>
          {B2G_PHASES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </Select>
      )}
    </div>
  );
}
