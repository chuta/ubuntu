"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EVENT_TYPES } from "@/lib/constants/events";

export function EventFilters() {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/events?${next.toString()}`);
  }

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <Input
        placeholder="Search events…"
        defaultValue={params.get("search") ?? ""}
        className="max-w-xs"
        onChange={(e) => {
          const v = e.target.value;
          clearTimeout((window as unknown as { _evt?: ReturnType<typeof setTimeout> })._evt);
          (window as unknown as { _evt?: ReturnType<typeof setTimeout> })._evt = setTimeout(() => update("search", v), 300);
        }}
      />
      <Select
        defaultValue={params.get("event_type") ?? ""}
        onChange={(e) => update("event_type", e.target.value)}
      >
        <option value="">All types</option>
        {EVENT_TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </Select>
    </div>
  );
}
