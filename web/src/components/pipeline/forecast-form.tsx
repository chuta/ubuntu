"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/crm/form-field";
import { createForecast, type ForecastFormData } from "@/lib/actions/forecasts";
import { CUSTOMER_SEGMENTS, FORECAST_PERIODS, REVENUE_ENGINES } from "@/lib/constants/deals";

export function ForecastForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const data: ForecastFormData = {
      period_type: fd.get("period_type") as ForecastFormData["period_type"],
      period_start: fd.get("period_start") as string,
      period_end: fd.get("period_end") as string,
      segment: (fd.get("segment") as ForecastFormData["segment"]) || undefined,
      revenue_engine: (fd.get("revenue_engine") as ForecastFormData["revenue_engine"]) || undefined,
      forecast_amount: Number(fd.get("forecast_amount")),
      commit_amount: fd.get("commit_amount") ? Number(fd.get("commit_amount")) : undefined,
      best_case_amount: fd.get("best_case_amount") ? Number(fd.get("best_case_amount")) : undefined,
      notes: (fd.get("notes") as string) || undefined,
    };

    try {
      await createForecast(data);
      router.refresh();
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save forecast");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Submit Forecast</h3>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Period Type" htmlFor="period_type" required>
          <Select id="period_type" name="period_type" required defaultValue="MONTHLY">
            {FORECAST_PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Segment (optional)" htmlFor="segment">
          <Select id="segment" name="segment">
            <option value="">All segments</option>
            {CUSTOMER_SEGMENTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Period Start" htmlFor="period_start" required>
          <Input id="period_start" name="period_start" type="date" required />
        </FormField>
        <FormField label="Period End" htmlFor="period_end" required>
          <Input id="period_end" name="period_end" type="date" required />
        </FormField>
        <FormField label="Revenue Engine (optional)" htmlFor="revenue_engine">
          <Select id="revenue_engine" name="revenue_engine">
            <option value="">All engines</option>
            {REVENUE_ENGINES.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Forecast Amount (USD)" htmlFor="forecast_amount" required>
          <Input id="forecast_amount" name="forecast_amount" type="number" min="0" required />
        </FormField>
        <FormField label="Commit Amount (USD)" htmlFor="commit_amount">
          <Input id="commit_amount" name="commit_amount" type="number" min="0" />
        </FormField>
        <FormField label="Best Case (USD)" htmlFor="best_case_amount">
          <Input id="best_case_amount" name="best_case_amount" type="number" min="0" />
        </FormField>
        <FormField label="Notes" htmlFor="notes" className="sm:col-span-2">
          <Textarea id="notes" name="notes" rows={2} />
        </FormField>
      </div>
      <Button type="submit" className="mt-4" disabled={loading}>
        {loading ? "Submitting…" : "Submit Forecast"}
      </Button>
    </form>
  );
}
