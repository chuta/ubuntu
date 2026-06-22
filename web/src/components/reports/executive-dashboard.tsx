import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  CUSTOMER_SEGMENTS,
  DEAL_STAGES,
  REVENUE_ENGINES,
  labelFor,
  stageLabel,
} from "@/lib/constants/deals";
import { B2G_PHASES, phaseLabel } from "@/lib/constants/tokenization";
import { priorityVariant } from "@/components/ui/badge";
import type { ExecutiveReportData } from "@/types/reports";
import {
  GitBranch,
  Landmark,
  Handshake,
  Layers,
  TrendingUp,
  Calendar,
} from "lucide-react";

export function ExecutiveDashboard({
  data,
  compact,
}: {
  data: ExecutiveReportData;
  compact?: boolean;
}) {
  const stats = [
    { label: "Total Pipeline", value: formatCurrency(data.pipeline.totalValue), icon: GitBranch, color: "text-brand-purple" },
    { label: "Weighted Pipeline", value: formatCurrency(data.pipeline.weightedValue), icon: TrendingUp, color: "text-brand-gold" },
    { label: "Active Deals", value: String(data.pipeline.activeDeals), icon: GitBranch, color: "text-brand-purple" },
    { label: "Gov Engagements", value: String(data.governments.activeCount), icon: Landmark, color: "text-brand-gold" },
    { label: "Active Partnerships", value: String(data.partnerships.activeCount), icon: Handshake, color: "text-brand-purple" },
    { label: "Tokenization Projects", value: String(data.tokenization.totalProjects), icon: Layers, color: "text-brand-gold" },
  ];

  const stageCounts = DEAL_STAGES.map((s) => ({
    stage: s,
    count: data.pipeline.byStage[s.value] ?? 0,
  })).filter((s) => s.count > 0);

  return (
    <>
      {!compact && (
        <p className="mb-4 text-sm leading-relaxed text-gray-500">
          Reporting period: <strong className="text-gray-700">{data.period.label}</strong>
          <span className="block sm:inline">
            {" "}
            ({data.period.from} – {data.period.to})
          </span>
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>{stat.label}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:flex-wrap sm:gap-4">
        <span><strong className="text-brand-purple">{data.pipeline.newDeals}</strong> new deals in period</span>
        <span><strong className="text-brand-gold">{data.pipeline.wonDeals}</strong> won in period</span>
        <span><Calendar className="mr-1 inline h-3.5 w-3.5" />{data.events.count} events · {data.events.leadsCaptured} leads · {data.events.leadsConverted} converted</span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline by Stage</CardTitle>
            <CardDescription>Open deals — current snapshot</CardDescription>
          </CardHeader>
          <CardContent>
            {stageCounts.length === 0 ? (
              <p className="text-sm text-gray-400">No open deals</p>
            ) : (
              <div className="space-y-2">
                {stageCounts.map(({ stage, count }) => (
                  <div key={stage.value} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{stageLabel(stage.value)}</span>
                    <Link href={`/pipeline?stage=${stage.value}`} className="font-medium text-brand-purple hover:underline">
                      {count}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Opportunities</CardTitle>
            <CardDescription>By priority and value</CardDescription>
          </CardHeader>
          <CardContent>
            {data.pipeline.topDeals.length === 0 ? (
              <p className="text-sm text-gray-400">No open deals</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.pipeline.topDeals.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-2">
                    <Link href={`/pipeline/${d.id}`} className="truncate font-medium text-brand-purple hover:underline">
                      {d.name}
                    </Link>
                    <div className="flex shrink-0 items-center gap-2">
                      {d.priority && <Badge variant={priorityVariant(d.priority)}>{d.priority}</Badge>}
                      <span className="text-brand-gold">{d.estimated_value != null ? formatCurrency(d.estimated_value) : "—"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline by Segment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {Object.entries(data.pipeline.bySegment).map(([seg, v]) => (
                <div key={seg} className="flex justify-between">
                  <span className="text-gray-600">{labelFor(CUSTOMER_SEGMENTS, seg)}</span>
                  <span>{v.count} · {formatCurrency(v.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline by Revenue Engine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {Object.entries(data.pipeline.byRevenueEngine).map(([eng, v]) => (
                <div key={eng} className="flex justify-between">
                  <span className="text-gray-600">{labelFor(REVENUE_ENGINES, eng)}</span>
                  <span>{v.count} · {formatCurrency(v.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Government by Territory</CardTitle>
            <CardDescription>{data.governments.activeCount} active B2G engagements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {Object.entries(data.governments.byTerritory).map(([t, c]) => (
                <div key={t} className="flex justify-between">
                  <span className="text-gray-600">{t}</span>
                  <span className="font-medium">{c}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Forecast vs Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Open pipeline</span>
                <span className="font-medium text-brand-purple">{formatCurrency(data.forecast.pipelineTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Weighted</span>
                <span className="font-medium text-brand-gold">{formatCurrency(data.forecast.pipelineWeighted)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Forecast / Commit</span>
                <span>{formatCurrency(data.forecast.totalForecast)} / {formatCurrency(data.forecast.totalCommit)}</span>
              </div>
              <Link href="/forecast" className="mt-2 inline-block text-brand-purple hover:underline">Manage forecasts →</Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Tokenization by B2G Phase</CardTitle>
          <CardDescription>{formatCurrency(data.tokenization.totalValue)} estimated asset value</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {B2G_PHASES.map((p) => {
              const row = data.tokenization.byPhase[p.value];
              return (
                <div key={p.value} className="flex justify-between">
                  <span className="text-gray-600">{phaseLabel(p.value)}</span>
                  <Link href={`/tokenization?view=list&phase=${p.value}`} className="font-medium text-brand-purple hover:underline">
                    {row?.count ?? 0} · {formatCurrency(row?.value ?? 0)}
                  </Link>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
