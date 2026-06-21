import type { DateRangePreset, ReportDateRange } from "@/types/reports";

export const DATE_RANGE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "custom", label: "Custom Range" },
];

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfQuarter(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3) * 3;
  return new Date(d.getFullYear(), q, 1);
}

export function resolveDateRange(params?: {
  preset?: string;
  from?: string;
  to?: string;
}): ReportDateRange {
  const now = new Date();
  const preset = (params?.preset as DateRangePreset) || "week";

  if (preset === "custom" && params?.from && params?.to) {
    return {
      preset: "custom",
      from: params.from,
      to: params.to,
      label: `${params.from} – ${params.to}`,
    };
  }

  if (preset === "month") {
    const from = startOfMonth(now);
    return {
      preset: "month",
      from: fmt(from),
      to: fmt(now),
      label: "This Month",
    };
  }

  if (preset === "quarter") {
    const from = startOfQuarter(now);
    return {
      preset: "quarter",
      from: fmt(from),
      to: fmt(now),
      label: "This Quarter",
    };
  }

  const from = startOfWeek(now);
  return {
    preset: "week",
    from: fmt(from),
    to: fmt(now),
    label: "This Week",
  };
}
