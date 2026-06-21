"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DATE_RANGE_PRESETS } from "@/lib/constants/reports";

export function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const preset = params.get("preset") ?? "week";

  function push(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Report Period</label>
        <Select
          value={preset}
          onChange={(e) => {
            const v = e.target.value;
            if (v !== "custom") push({ preset: v, from: "", to: "" });
            else push({ preset: "custom" });
          }}
        >
          {DATE_RANGE_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </Select>
      </div>
      {preset === "custom" && (
        <>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">From</label>
            <Input
              type="date"
              defaultValue={params.get("from") ?? ""}
              onChange={(e) => push({ preset: "custom", from: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">To</label>
            <Input
              type="date"
              defaultValue={params.get("to") ?? ""}
              onChange={(e) => push({ preset: "custom", to: e.target.value })}
            />
          </div>
        </>
      )}
    </div>
  );
}
