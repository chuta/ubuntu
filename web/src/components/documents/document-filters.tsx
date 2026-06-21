"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DOCUMENT_STATUSES, DOCUMENT_TYPES } from "@/lib/constants/documents";
import { Search } from "lucide-react";

export function DocumentFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search documents…"
          className="pl-9"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            clearTimeout((window as unknown as { _dSearch?: ReturnType<typeof setTimeout> })._dSearch);
            (window as unknown as { _dSearch?: ReturnType<typeof setTimeout> })._dSearch = setTimeout(
              () => update("search", value),
              300
            );
          }}
        />
      </div>
      <Select value={searchParams.get("document_type") ?? ""} onChange={(e) => update("document_type", e.target.value)} className="sm:w-44">
        <option value="">All types</option>
        {DOCUMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </Select>
      <Select value={searchParams.get("status") ?? ""} onChange={(e) => update("status", e.target.value)} className="sm:w-40">
        <option value="">All statuses</option>
        {DOCUMENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </Select>
    </div>
  );
}
