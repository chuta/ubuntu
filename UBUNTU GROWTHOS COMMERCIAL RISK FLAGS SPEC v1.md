# **UBUNTU GROWTHOS — COMMERCIAL RISK FLAGS SPEC v1.0**

## **Document Control**

| Field | Value |
| --- | --- |
| **Version** | 1.0 |
| **Status** | Approved for Build — Phase 1 lightweight (Option A) |
| **Author** | Chimezie Chuta |
| **Traceability** | COM v1.0 §6 Commercial Risk Areas |
| **PRD IDs** | FR-DEAL-16..19, FR-EXEC-14..15 |
| **Upstream** | `UBUNTU COMMERCIAL OPERATING MODEL (COM v1.md`, `UBUNTU GROWTHOS PRD v1.0.md`, ERM v1.0 |
| **Phase 2 deferral** | Full `ComplianceCase` / Due Diligence Center (ERM §5.8) |

> **PRD numbering note:** FR-DEAL-15 is already allocated to *Expected and actual close dates* in PRD v1.0. Commercial risk requirements continue at **FR-DEAL-16..19**.

---

## **1. Purpose**

Give the Commercial Director a lightweight way to **identify, monitor, and mitigate** the six COM commercial risk areas **at the deal level**, with executive visibility on the Command Center — without building the full ERM `ComplianceCase` module (Phase 2).

This closes the gap where COM §6 was referenced conceptually in upstream docs but never became a PRD requirement or app feature.

---

## **2. Scope**

### **In scope**

- Six COM-aligned risk categories on **deals**
- Per-deal severity, notes, mitigation, review date
- Deal detail panel + edit form
- Pipeline list indicator (badge/icon)
- Executive dashboard widget with counts and top at-risk deals
- Optional auto-suggestion from Regulatory Affairs (`AT_RISK` requirements linked to deal)

### **Out of scope (Phase 2)**

- Organization-level or tokenization-project-level risk registers
- DD checklists / KYC / counterparty verification workflows
- Probability auto-adjustment rules
- Risk history audit trail (beyond `commercial_risk_updated_at`)
- PDF export of risk section (follow-up on EXEC report export)

---

## **3. Risk taxonomy (COM §6 mapping)**

| Code | Label | COM source | Typical signals in GrowthOS |
| --- | --- | --- | --- |
| `REGULATORY_DELAY` | Regulatory Delays | COM §6 | Linked `regulatory_requirements` at `AT_RISK`; overdue consultations; licensing stalled |
| `PROCUREMENT_CYCLE` | Government Procurement Cycles | COM §6 | B2G deal in MOU/CONTRACT long duration; `expected_close_date` pushed repeatedly |
| `INSTITUTIONAL_DD` | Institutional Due Diligence | COM §6 | B2B/INSTITUTIONAL in NDA/PROPOSAL; long stage age before CONTRACT |
| `TOKEN_LIQUIDITY` | Token Liquidity Constraints | COM §6 | Deal linked to tokenization project; pre-listing / structuring phases |
| `MARKET_VOLATILITY` | Capital Market Volatility | COM §6 | Capital formation deals; forecast vs pipeline divergence |
| `COUNTERPARTY` | Counterparty Risk | COM §6 | Partner-sourced deals; weak org profile; blocker in influence graph |

Store as Postgres enum: `commercial_risk_type`.

---

## **4. Data model**

### **4.1 Schema (recommended: first-class columns)**

Migration: `20260701000001_deal_commercial_risks.sql`

```sql
CREATE TYPE commercial_risk_type AS ENUM (
  'REGULATORY_DELAY',
  'PROCUREMENT_CYCLE',
  'INSTITUTIONAL_DD',
  'TOKEN_LIQUIDITY',
  'MARKET_VOLATILITY',
  'COUNTERPARTY'
);

CREATE TYPE commercial_risk_severity AS ENUM (
  'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
);

ALTER TABLE deals
  ADD COLUMN commercial_risk_flags commercial_risk_type[] NOT NULL DEFAULT '{}',
  ADD COLUMN commercial_risk_severity commercial_risk_severity,
  ADD COLUMN commercial_risk_notes TEXT,
  ADD COLUMN commercial_risk_mitigation TEXT,
  ADD COLUMN commercial_risk_review_date DATE,
  ADD COLUMN commercial_risk_updated_at TIMESTAMPTZ;

CREATE INDEX idx_deals_commercial_risk_flags
  ON deals USING GIN (commercial_risk_flags);
```

**Rationale:** Executive widget needs fast array aggregation (`GROUP BY`, `&&` overlap). Typed columns match existing deal patterns (`priority`, `stage`).

**Fallback (zero-migration demo only):** `deals.metadata.commercial_risks` JSONB — weaker for dashboard SQL.

### **4.2 TypeScript types**

File: `web/src/types/pipeline.ts`

```typescript
export type CommercialRiskType =
  | "REGULATORY_DELAY"
  | "PROCUREMENT_CYCLE"
  | "INSTITUTIONAL_DD"
  | "TOKEN_LIQUIDITY"
  | "MARKET_VOLATILITY"
  | "COUNTERPARTY";

export type CommercialRiskSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
```

Extend `Deal` with: `commercial_risk_flags`, `commercial_risk_severity`, `commercial_risk_notes`, `commercial_risk_mitigation`, `commercial_risk_review_date`, `commercial_risk_updated_at`.

### **4.3 Constants**

File: `web/src/lib/constants/commercial-risks.ts`

- `COMMERCIAL_RISK_TYPES[]` — `{ value, label, description, comReference }`
- `COMMERCIAL_RISK_SEVERITIES[]`
- `severityVariant()` for badges
- `isDealAtRisk(deal)` — flags present and severity is HIGH or CRITICAL

### **4.4 RLS**

No change — inherits existing `deals` policies.

---

## **5. Server actions**

Extend `DealFormData` and `createDeal` / `updateDeal` in `web/src/lib/actions/deals.ts`.

On update, set `commercial_risk_updated_at = now()` when any risk field changes.

### **5.1 Suggestion helper (FR-DEAL-18, P1)**

```typescript
getCommercialRiskSuggestions(dealId: string): Promise<CommercialRiskType[]>
```

| Condition | Suggest flag |
| --- | --- |
| Linked regulatory requirement with `compliance_status = 'AT_RISK'` | `REGULATORY_DELAY` |
| Linked consultation past `response_deadline` and not submitted | `REGULATORY_DELAY` |
| `segment = 'B2G'` and stage in (`MOU`, `NEGOTIATION`, `CONTRACT`) and deal age > 90 days | `PROCUREMENT_CYCLE` |
| `segment in ('B2B', 'INSTITUTIONAL')` and stage in (`NDA`, `PROPOSAL`, `DISCOVERY`) and age > 60 days | `INSTITUTIONAL_DD` |
| Linked `tokenization_project_id` and phase before capital formation | `TOKEN_LIQUIDITY` |
| `revenue_engine = 'CAPITAL_FORMATION'` | `MARKET_VOLATILITY` |
| `source = 'PARTNER'` or linked partnership with weak status | `COUNTERPARTY` |

Suggestions are **non-destructive** — shown as chips the user accepts with one click.

### **5.2 Executive aggregation (FR-EXEC-14..15)**

Extend `getExecutiveReportData()` in `web/src/lib/actions/reports.ts`:

```typescript
commercialRisks: {
  flaggedDeals: number;
  byCategory: Record<CommercialRiskType, number>;
  bySeverity: Record<CommercialRiskSeverity, number>;
  overdueReviews: number;
  topAtRiskDeals: {
    id: string;
    name: string;
    stage: string;
    estimated_value: number | null;
    flags: CommercialRiskType[];
    severity: CommercialRiskSeverity | null;
    review_date: string | null;
  }[];
}
```

**Widget scope (v1):** Current open-pipeline snapshot (not period-filtered).

---

## **6. UI/UX**

### **6.1 Deal edit form**

Section: **Commercial Risks** (below Description)

| Field | Control | Required |
| --- | --- | --- |
| Risk areas | Multi-select checkbox group (6 COM items) | No |
| Overall severity | Select: Low / Medium / High / Critical | Yes if ≥1 flag |
| Mitigation plan | Textarea | No |
| Notes | Textarea | No |
| Next review date | Date input | Yes if severity is HIGH or CRITICAL |

**Suggested risks banner:** Amber callout when heuristics return unselected flags.

### **6.2 Deal detail**

Card under `DealDetailSummary`: flags as badges, severity, mitigation, notes, review date, link to edit.

Empty state: “No commercial risks flagged.”

### **6.3 Pipeline list / kanban**

- List: “Risks” column — up to 2 abbreviations + overflow tooltip
- Kanban: warning icon on flagged cards
- Filter (FR-DEAL-19): has risks, severity ≥ High, by specific flag
- Mobile: icon on deal row, hide extra column

### **6.4 Executive widget**

**Commercial Risk Monitor** on Command Center:

- Flagged deal count, overdue reviews, critical count
- Breakdown by category (chips or bars)
- Top 5 at-risk deals with link to detail
- “View all →” links to `/pipeline?has_risk=1`

---

## **7. PRD requirements**

### **Pipeline — FR-DEAL-16..19**

| ID | Requirement | Priority | Acceptance |
| --- | --- | --- | --- |
| FR-DEAL-16 | Commercial risk flags on deals | P1 | Multi-select 6 COM categories; persisted on deal |
| FR-DEAL-17 | Risk severity, mitigation, review date | P1 | Required severity when flags set; review date required for HIGH/CRITICAL |
| FR-DEAL-18 | Risk suggestions from REG/pipeline heuristics | P1 | Non-blocking suggestions on deal edit/detail |
| FR-DEAL-19 | Pipeline filter by commercial risk | P1 | Filter list/kanban by flag and severity |

### **Executive — FR-EXEC-14..15**

| ID | Requirement | Priority | Acceptance |
| --- | --- | --- | --- |
| FR-EXEC-14 | Commercial risk summary widget | P1 | Count flagged deals, by category, by severity, overdue reviews |
| FR-EXEC-15 | Top at-risk deals list | P1 | Up to 5 deals with flags, severity, value; link to deal detail |

---

## **8. User flows**

### **Flow A — Flag risk on new B2G deal**

1. Create deal → user selects `PROCUREMENT_CYCLE` + `REGULATORY_DELAY`
2. Sets severity **HIGH**, review in 30 days, mitigation notes
3. Pipeline shows badges → dashboard widget increments

### **Flow B — Executive weekly review**

1. Open Command Center → Commercial Risk Monitor shows overdue reviews
2. Drill into deal → update mitigation and review date

### **Flow C — Auto-suggestion from REG**

1. Requirement linked to deal marked `AT_RISK`
2. Deal detail suggests “Add Regulatory Delays”
3. User accepts → flag persisted

---

## **9. Implementation plan**

| Step | Files | Est. |
| --- | --- | --- |
| 1 | Migration + types + constants | 2h |
| 2 | Extend `deals.ts` actions | 1h |
| 3 | `deal-form.tsx` risk section | 2h |
| 4 | `deal-commercial-risks-panel.tsx` + detail page | 2h |
| 5 | Pipeline table/kanban badges + filter | 2h |
| 6 | `getExecutiveReportData` + dashboard widget | 3h |
| 7 | Suggestion helper | 2h |

**Total:** ~12–14 hours

---

## **10. Acceptance criteria**

- [ ] All six COM risk categories selectable on deal create/edit
- [ ] Deal detail displays flags, severity, mitigation, notes, review date
- [ ] Open deals with flags appear in executive widget with correct counts
- [ ] Pipeline visually distinguishes flagged deals
- [ ] HIGH/CRITICAL deals without review date blocked on save
- [ ] No regression to existing deal CRUD, kanban, or dashboard metrics
- [ ] Mobile: risk info on deal detail; pipeline shows icon not extra column

---

## **11. Evolution path**

| Later | Upgrade |
| --- | --- |
| Option B | `commercial_risks` table (multi-row per deal, history) |
| Option C | `ComplianceCase` for DD/counterparty; deal flags become summary linked to case |
| REG integration | Bi-directional link: flag ↔ requirement `AT_RISK` |

---

## **12. Open decisions**

1. **Columns vs metadata** — Spec recommends typed columns (§4.1)
2. **Widget scope** — v1 uses open-pipeline snapshot; period-based “new flags this week” is Phase 2
3. **PDF export** — Include risk widget in EXEC PDF/DOCX in follow-up pass

---

*This spec implements COM §6 via PRD FR-DEAL-16..19 and FR-EXEC-14..15. Phase 2 Compliance Center remains the home for institutional DD and counterparty verification workflows.*
