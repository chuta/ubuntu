"use server";

import { createClient, getProfile } from "@/lib/supabase/server";
import { getPipelineMetrics } from "@/lib/actions/deals";
import type { CustomerSegment, Forecast, ForecastPeriod, RevenueEngine } from "@/types/pipeline";
import { revalidatePath } from "next/cache";

export type ForecastFormData = {
  period_type: ForecastPeriod;
  period_start: string;
  period_end: string;
  segment?: CustomerSegment;
  revenue_engine?: RevenueEngine;
  forecast_amount: number;
  commit_amount?: number;
  best_case_amount?: number;
  notes?: string;
};

export async function getForecasts(): Promise<Forecast[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forecasts")
    .select("*, submitted_by:profiles(full_name)")
    .order("period_start", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Forecast[];
}

export async function createForecast(data: ForecastFormData) {
  const supabase = await createClient();
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");

  const { error } = await supabase.from("forecasts").insert({
    period_type: data.period_type,
    period_start: data.period_start,
    period_end: data.period_end,
    segment: data.segment || null,
    revenue_engine: data.revenue_engine || null,
    forecast_amount: data.forecast_amount,
    commit_amount: data.commit_amount || null,
    best_case_amount: data.best_case_amount || null,
    notes: data.notes || null,
    submitted_by_id: profile.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/forecast");
}

export async function getForecastSummary() {
  const [metrics, forecasts] = await Promise.all([getPipelineMetrics(), getForecasts()]);

  const latestByPeriod = forecasts[0];
  const totalForecast = forecasts.reduce((sum, f) => sum + Number(f.forecast_amount), 0);
  const totalCommit = forecasts.reduce((sum, f) => sum + (Number(f.commit_amount) || 0), 0);
  const totalBestCase = forecasts.reduce((sum, f) => sum + (Number(f.best_case_amount) || 0), 0);

  return {
    pipelineTotal: metrics.totalValue,
    pipelineWeighted: metrics.weightedValue,
    activeDeals: metrics.activeDeals,
    totalForecast,
    totalCommit,
    totalBestCase,
    latestForecast: latestByPeriod ?? null,
  };
}
