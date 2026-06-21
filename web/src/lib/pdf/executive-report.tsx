import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ExecutiveReportData } from "@/types/reports";
import { B2G_PHASES, phaseLabel } from "@/lib/constants/tokenization";
import { DEAL_STAGES, stageLabel, labelFor, CUSTOMER_SEGMENTS, REVENUE_ENGINES } from "@/lib/constants/deals";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1f2937" },
  header: { marginBottom: 20, borderBottomWidth: 2, borderBottomColor: "#9035F4", paddingBottom: 12 },
  title: { fontSize: 20, fontWeight: "bold", color: "#9035F4" },
  subtitle: { fontSize: 11, color: "#C9932A", marginTop: 4 },
  meta: { fontSize: 9, color: "#6b7280", marginTop: 6 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", color: "#9035F4", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4, paddingVertical: 2 },
  label: { color: "#4b5563" },
  value: { fontWeight: "bold" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#9ca3af", textAlign: "center", borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 8 },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statBox: { width: "30%", backgroundColor: "#f9fafb", padding: 8, borderRadius: 4, marginBottom: 8 },
  statLabel: { fontSize: 8, color: "#6b7280" },
  statValue: { fontSize: 14, fontWeight: "bold", color: "#9035F4", marginTop: 2 },
});

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function ExecutiveReportPdf({ data }: { data: ExecutiveReportData }) {
  return (
    <Document title={`Executive Report — ${data.period.label}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Ubuntu GrowthOS</Text>
          <Text style={styles.subtitle}>Executive Commercial Report</Text>
          <Text style={styles.meta}>
            Period: {data.period.label} ({data.period.from} – {data.period.to})
          </Text>
          <Text style={styles.meta}>
            Generated {new Date(data.generatedAt).toLocaleString()} by {data.generatedBy}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pipeline Summary</Text>
          <View style={styles.statGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Pipeline</Text>
              <Text style={styles.statValue}>{money(data.pipeline.totalValue)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Weighted Pipeline</Text>
              <Text style={styles.statValue}>{money(data.pipeline.weightedValue)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Active Deals</Text>
              <Text style={styles.statValue}>{String(data.pipeline.activeDeals)}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>New deals in period</Text>
            <Text style={styles.value}>{data.pipeline.newDeals}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Deals won in period</Text>
            <Text style={styles.value}>{data.pipeline.wonDeals}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pipeline by Stage</Text>
          {DEAL_STAGES.filter((s) => (data.pipeline.byStage[s.value] ?? 0) > 0).map((s) => (
            <View key={s.value} style={styles.row}>
              <Text style={styles.label}>{stageLabel(s.value)}</Text>
              <Text style={styles.value}>{data.pipeline.byStage[s.value]}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Opportunities</Text>
          {data.pipeline.topDeals.length === 0 ? (
            <Text style={styles.label}>No open deals</Text>
          ) : (
            data.pipeline.topDeals.map((d) => (
              <View key={d.id} style={styles.row}>
                <Text style={styles.label}>{d.name}</Text>
                <Text style={styles.value}>
                  {d.estimated_value != null ? money(d.estimated_value) : "—"} · {stageLabel(d.stage)}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer}>
          <Text>Ubuntu Tribe — Real value. Digital access. Shared opportunity. · utribe.one</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Government Engagements</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Active B2G organizations</Text>
            <Text style={styles.value}>{data.governments.activeCount} / {data.governments.totalCount}</Text>
          </View>
          {Object.entries(data.governments.byTerritory).map(([t, c]) => (
            <View key={t} style={styles.row}>
              <Text style={styles.label}>{t}</Text>
              <Text style={styles.value}>{c}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tokenization Projects</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Active projects</Text>
            <Text style={styles.value}>{data.tokenization.totalProjects}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Est. asset value</Text>
            <Text style={styles.value}>{money(data.tokenization.totalValue)}</Text>
          </View>
          {B2G_PHASES.map((p) => {
            const row = data.tokenization.byPhase[p.value];
            if (!row?.count) return null;
            return (
              <View key={p.value} style={styles.row}>
                <Text style={styles.label}>{phaseLabel(p.value)}</Text>
                <Text style={styles.value}>{row.count} · {money(row.value)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Events &amp; Lead ROI</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Events in period</Text>
            <Text style={styles.value}>{data.events.count}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Leads captured / converted</Text>
            <Text style={styles.value}>{data.events.leadsCaptured} / {data.events.leadsConverted}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Budget / actual spend</Text>
            <Text style={styles.value}>{money(data.events.totalBudget)} / {money(data.events.totalActualCost)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Forecast vs Pipeline</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Open pipeline</Text>
            <Text style={styles.value}>{money(data.forecast.pipelineTotal)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Weighted pipeline</Text>
            <Text style={styles.value}>{money(data.forecast.pipelineWeighted)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total forecast / commit</Text>
            <Text style={styles.value}>{money(data.forecast.totalForecast)} / {money(data.forecast.totalCommit)}</Text>
          </View>
        </View>

        {data.b2c && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>B2C Campaign — {data.b2c.campaign_name}</Text>
            <View style={styles.row}>
              <Text style={styles.label}>New users</Text>
              <Text style={styles.value}>{data.b2c.new_users ?? "—"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Wallet downloads</Text>
              <Text style={styles.value}>{data.b2c.wallet_downloads ?? "—"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>GIFT purchases (USD)</Text>
              <Text style={styles.value}>{data.b2c.gift_purchases_usd != null ? money(Number(data.b2c.gift_purchases_usd)) : "—"}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By Segment</Text>
          {Object.entries(data.pipeline.bySegment).map(([seg, v]) => (
            <View key={seg} style={styles.row}>
              <Text style={styles.label}>{labelFor(CUSTOMER_SEGMENTS, seg)}</Text>
              <Text style={styles.value}>{v.count} deals · {money(v.value)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By Revenue Engine</Text>
          {Object.entries(data.pipeline.byRevenueEngine).map(([eng, v]) => (
            <View key={eng} style={styles.row}>
              <Text style={styles.label}>{labelFor(REVENUE_ENGINES, eng)}</Text>
              <Text style={styles.value}>{v.count} deals · {money(v.value)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Ubuntu Tribe — Real value. Digital access. Shared opportunity. · utribe.one</Text>
        </View>
      </Page>
    </Document>
  );
}
