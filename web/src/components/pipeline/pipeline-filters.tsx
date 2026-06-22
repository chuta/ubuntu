"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CUSTOMER_SEGMENTS, DEAL_STAGES, REVENUE_ENGINES } from "@/lib/constants/deals";
import { COMMERCIAL_RISK_TYPES, COMMERCIAL_RISK_SEVERITIES } from "@/lib/constants/commercial-risks";
import { LayoutGrid, List, Search } from "lucide-react";

export function PipelineFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "kanban";

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`);
  }

  function setView(v: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", v);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search deals…"
            className="pl-9"
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              clearTimeout((window as unknown as { _dealSearch?: ReturnType<typeof setTimeout> })._dealSearch);
              (window as unknown as { _dealSearch?: ReturnType<typeof setTimeout> })._dealSearch = setTimeout(
                () => update("search", value),
                300
              );
            }}
          />
        </div>
        <Select
          value={searchParams.get("stage") ?? ""}
          onChange={(e) => update("stage", e.target.value)}
          className="sm:w-44"
        >
          <option value="">All stages</option>
          {DEAL_STAGES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>
        <Select
          value={searchParams.get("segment") ?? ""}
          onChange={(e) => update("segment", e.target.value)}
          className="sm:w-40"
        >
          <option value="">All segments</option>
          {CUSTOMER_SEGMENTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>
        <Select
          value={searchParams.get("revenue_engine") ?? ""}
          onChange={(e) => update("revenue_engine", e.target.value)}
          className="sm:w-48"
        >
          <option value="">All engines</option>
          {REVENUE_ENGINES.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </Select>
        <Select
          value={searchParams.get("has_risk") ?? ""}
          onChange={(e) => update("has_risk", e.target.value)}
          className="sm:w-40"
        >
          <option value="">All deals</option>
          <option value="1">Flagged only</option>
        </Select>
        <Select
          value={searchParams.get("risk_flag") ?? ""}
          onChange={(e) => update("risk_flag", e.target.value)}
          className="sm:w-44"
        >
          <option value="">All risk types</option>
          {COMMERCIAL_RISK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.shortLabel}</option>
          ))}
        </Select>
        <Select
          value={searchParams.get("risk_severity") ?? ""}
          onChange={(e) => update("risk_severity", e.target.value)}
          className="sm:w-40"
        >
          <option value="">All severities</option>
          <option value="HIGH_PLUS">High+</option>
          {COMMERCIAL_RISK_SEVERITIES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>
      </div>
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
        <Button
          size="sm"
          variant={view === "kanban" ? "primary" : "ghost"}
          onClick={() => setView("kanban")}
        >
          <LayoutGrid className="mr-1.5 h-4 w-4" />
          Kanban
        </Button>
        <Button
          size="sm"
          variant={view === "list" ? "primary" : "ghost"}
          onClick={() => setView("list")}
        >
          <List className="mr-1.5 h-4 w-4" />
          List
        </Button>
      </div>
    </div>
  );
}
