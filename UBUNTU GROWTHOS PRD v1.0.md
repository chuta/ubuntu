# **UBUNTU GROWTHOS — PRODUCT REQUIREMENTS DOCUMENT (PRD v1.0)**

## **Document Control**

| Field | Value |
| --- | --- |
| **Version** | 1.4 |
| **Status** | Approved for Build — **Week 8 pivot + COM §6 commercial risk flags** |
| **Author** | Chimezie Chuta |
| **Role** | Commercial Director of Sales & Partnerships |
| **Platform** | Ubuntu GrowthOS |
| **Upstream Documents** | Source Documents Index, Knowledge Base v1.0, COM v1.0, FSB v1.0, ERM v1.0, Website Reference (utribe.one), **Commercial Risk Flags Spec v1.0** |
| **Source of Truth** | 4 PDFs — see `UBUNTU GROWTHOS SOURCE DOCUMENTS INDEX.md` |
| **Primary Audience** | Personal build guide (Chimezie + Cursor) |
| **Target Launch** | Week 8 — full Phase 1 live |
| **Ubuntu Tribe Website** | https://utribe.one/ |
| **Logo Asset** | `download.svg` (project root) |

---

## **Build Status Legend**

| Symbol | Meaning |
| --- | --- |
| 🟢 **Good** | Implemented in codebase; milestone exit criteria met |
| 🟡 **Partial** | Core delivered; known gaps documented below |
| ⬜ **Remaining** | Not started, or Week 8 launch / verification task |

**Overall:** Weeks **1–7** 🟢 **Good** · Week **8** ⬜ **Remaining** (launch prep)

| Week | Status | Summary |
| --- | --- | --- |
| 1 | 🟢 **Good** | Foundation, schema, auth, branding, nav |
| 2 | 🟢 **Good** | Government & account CRM, contacts |
| 3 | 🟢 **Good** | Pipeline, Kanban, forecast, activities, tasks, notes |
| 4 | 🟡 **Partial** | Partnerships + deal links live; influence graph (SIG) Week 8; CAP deferred |
| 5 | 🟢 **Good** | Documents, S3, AI drafting, Knowledge Vault upload/search |
| 6 | 🟢 **Good** | Events, calendar, Google import, tokenization board |
| 7 | 🟢 **Good** | Executive dashboard, PDF/DOCX export, global search, B2C metrics, RLS |
| 8 | ⬜ **Remaining** | **REG + SIG modules**, 4 PDF vault seed, production deploy, E2E testing |

---

## **Discovery Decisions Log**

Decisions captured during PRD discovery workshops and confirmed before authoring.

| # | Decision Area | Resolution |
| --- | --- | --- |
| 1 | Build approach | Fully custom application on ERM v1.0 |
| 2 | Hosting | **Netlify** (frontend), **Supabase** (DB + auth), **AWS S3** (file storage) |
| 3 | Frontend | Next.js (App Router) |
| 4 | Auth | Supabase Auth — email + password |
| 5 | Active roles (P1) | Commercial + Executive (read-only dashboard) |
| 6 | Initial users | 3–6 users (Commercial Director + 2–5 BD team) |
| 7 | Launch deadline | **Everything live by Week 8** — no staggered module releases |
| 8 | Builder | Chimezie + Cursor (solo build) |
| 9 | Geographic focus | Pan-African (Nigeria + key African markets) |
| 10 | Data migration | Greenfield — no import from existing systems |
| 11 | Currency | USD only |
| 12 | Organization model | One primary profile type per Organization |
| 13 | B2C scope | Light — campaign-level metrics only; no individual retail CRM |
| 14 | AI (P1) | Anthropic (Claude) for NDA/MOU/Proposal drafting |
| 15 | Knowledge Vault (P1) | Upload + tagging + manual search (AI search → Phase 2) |
| 16 | Document approvals | Manual status tracking; workflow engine → Phase 2 |
| 17 | Google Calendar | **Import only** — pull events from Google into GrowthOS |
| 18 | Executive reporting | In-app dashboard + PDF export |
| 19 | Compliance module | **Split:** Regulatory Affairs (REG) → Phase 1 Week 8; full KYC/ComplianceCase center → Phase 2 |
| 20 | Capital Formation | Basic — investor records linked to deals (no full raise tracker) — **deferred post-launch** |
| 21 | On-chain integration | None in Phase 1 |
| 22 | Mobile | Desktop-first; responsive web nice-to-have |
| 23 | Branding | Ubuntu Tribe brand from https://utribe.one/; logo at `download.svg` |
| 24 | Design priority | Function-first MVP with Ubuntu Tribe brand applied |
| 25 | Website reference | Official site https://utribe.one/; wallet at https://gift.utribe.app |
| 26 | Source of truth | 4 PDFs in project root — seeded into Knowledge Vault at launch |
| 27 | Build mandate | Proactive initiative by Commercial Director — not corporate IT mandate |
| 28 | **Week 8 pivot (2026-06-20)** | **Regulatory Affairs (REG)** and **Strategic Influence Graph (SIG)** added as Phase 1 launch blockers; CAP investor module deferred |
| 29 | Influence graph scope | Person-to-person relationships, position history, strength scoring — graph UI in Phase 1; predictive analytics Phase 4 |

---

## **Build Context — Why GrowthOS Exists**

Ubuntu GrowthOS is **not a mandated Ubuntu Tribe corporate project**. It is a proactive initiative by Chimezie Chuta, Commercial Director of Sales & Partnerships, to leverage every available technology tool to deliver and exceed role expectations.

**Primary driver:** Personal execution excellence — replace Excel/Notion fragmentation with a commercial operating system that supports pipeline ownership, government engagement, document velocity, and weekly executive reporting (contractual obligations per Employment Contract Exhibit A).

**Secondary driver:** Team leverage — enable leadership visibility and help the broader Ubuntu Tribe team maximize the commercial opportunities this role is designed to unlock.

All planning markdown in this repository was derived from **four source PDFs** indexed in `UBUNTU GROWTHOS SOURCE DOCUMENTS INDEX.md`. Those PDFs remain the authoritative source of truth; GrowthOS Knowledge Vault seeds them at Phase 1 launch.

---

# **1. EXECUTIVE SUMMARY**

Ubuntu GrowthOS is a custom-built Commercial Intelligence & Growth Operations Platform designed to replace fragmented Excel spreadsheets and Notion pages with a single source of truth for Ubuntu Tribe's commercial operations.

As Commercial Director of Sales & Partnerships, Chimezie Chuta requires a platform that supports sovereign government engagement, institutional account management, deal pipeline visibility, document generation, event tracking, tokenization project registry, **regulatory affairs tracking**, **strategic influence mapping**, knowledge management, and executive reporting — all within an 8-week build cycle using Next.js, Supabase, AWS S3, and Anthropic AI.

**Phase 1 delivers twelve functional modules** (adapted per scope decisions above) in a single launch at Week 8. The platform is built for pan-African commercial operations with Nigeria as a primary territory, serving a small commercial team with executive read-only visibility.

**Week 8 pivot:** Launch is not complete until **Regulatory Affairs (REG)** and **Strategic Influence Graph (SIG)** modules ship alongside existing Week 1–7 capabilities.

---

# **2. PROBLEM STATEMENT**

## **2.1 Current State**

Ubuntu Tribe's commercial operations span five revenue engines (GIFT adoption, Tokenization-as-a-Service, capital formation, strategic partnerships, financial infrastructure) across four customer segments (B2G, B2B, institutional capital, ecosystem partners). The Commercial Director must simultaneously:

- Engage national and state governments on resource tokenization
- Manage institutional accounts (banks, PSPs, exchanges, mining companies)
- Track deals through a 15-stage commercial lifecycle
- Generate NDAs, MOUs, proposals, and government briefs
- Represent Ubuntu at conferences and capture leads
- Report pipeline and forecast to executive leadership weekly
- Coordinate tokenization project phases from resource discovery through deployment
- **Track regulatory meetings, policy submissions, consultation papers, licensing dialogues, and jurisdiction-specific compliance requirements**
- **Map person-to-person influence networks — former roles, current influence, and relationship strength — across government and institutional engagements**

Today this work is distributed across Excel, Notion, email, and ad-hoc documents — creating visibility gaps, version confusion, lost follow-ups, slow executive reporting, **and no durable institutional memory of regulatory or relationship intelligence**.

## **2.2 Desired State**

A unified platform where:

1. Every government engagement, institutional account, and deal is tracked in one system.
2. Leadership sees real-time pipeline data without requesting manual reports.
3. Commercial documents are AI-drafted, versioned, and linked to deals.
4. Events and meetings (including imported Google Calendar events) feed the pipeline.
5. Tokenization opportunities progress through defined B2G phases with scoring.
6. Institutional knowledge is uploaded, tagged, and searchable.
7. Weekly executive reports export to PDF in under 30 minutes.
8. **Every active jurisdiction has regulatory touchpoints and open requirements tracked in GrowthOS.**
9. **B2G and institutional deals maintain a living influence graph with relationship strength over time.**

---

# **3. PRODUCT VISION & GOALS**

## **3.1 Vision**

Ubuntu GrowthOS becomes the commercial operating backbone of Ubuntu Tribe — enabling leadership to scale sovereign partnerships, institutional adoption, tokenization projects, and capital formation through a unified intelligence platform.

## **3.2 Phase 1 Goals**

| Goal ID | Goal | Measurable Outcome |
| --- | --- | --- |
| G-01 | Replace spreadsheet/Notion tracking | Zero commercial tracking in Excel/Notion post-launch |
| G-02 | Pipeline visibility for leadership | Executives access live dashboard without requesting reports |
| G-03 | Government engagement tracking | 100% of active B2G engagements have influence relationships mapped (SIG) |
| G-04 | Fast executive reporting | Weekly PDF report generated in ≤ 30 minutes |
| G-05 | Document velocity | NDA/MOU/Proposal first draft generated via AI in ≤ 5 minutes |
| G-06 | Event-to-pipeline conversion | All conference leads captured and linked to deals or follow-up tasks |
| G-07 | Tokenization visibility | All active tokenization projects tracked by B2G phase |
| G-08 | Regulatory affairs tracking | 100% of active jurisdictions have regulatory meetings and open requirements logged |
| G-09 | Influence graph coverage | ≥ 80% of active B2G deals have influence relationships mapped with strength scores |

## **3.3 Non-Goals (Phase 1)**

- Replacing UTribe Wallet, UbuntuVerse, or on-chain systems
- Full compliance/KYC workflow automation *(ComplianceCase / DueDiligence — Phase 2; REG tracks regulatory affairs only)*
- Multi-step legal approval workflows
- Semantic AI search over knowledge base
- Individual retail (B2C) CRM
- Native mobile applications
- Multi-currency financial reporting
- Automated email report delivery (PDF export only)

---

# **4. USER PERSONAS & ROLES**

## **4.1 Personas**

### **P1 — Commercial Director (Primary User / Admin)**

- **Name archetype:** Chimezie Chuta
- **Needs:** Full platform access, pipeline ownership, government CRM, AI document drafting, executive report generation, team oversight
- **Frequency:** Daily, multiple sessions

### **P2 — Business Development Manager**

- **Needs:** Manage assigned accounts and deals, log activities, capture event leads, update pipeline stages
- **Frequency:** Daily

### **P3 — Executive Stakeholder**

- **Name archetype:** Global Head of BD, CEO
- **Needs:** Read-only dashboard, pipeline summary, government engagement count, PDF reports
- **Frequency:** Weekly review + ad-hoc

## **4.2 Role Permissions Matrix (Phase 1)**

| Capability | Commercial | Executive | Admin |
| --- | --- | --- | --- |
| View all organizations & deals | Own + team territory | All (read-only) | All |
| Create/edit organizations | Yes | No | Yes |
| Create/edit deals | Yes | No | Yes |
| Move deal stages | Yes | No | Yes |
| Log activities & tasks | Yes | No | Yes |
| Stakeholder mapping | Yes | View | Yes |
| Regulatory affairs CRUD | Yes | View | Yes |
| Influence graph CRUD | Yes | View | Yes |
| AI document drafting | Yes | No | Yes |
| Upload/manage documents | Yes | View | Yes |
| Manage events & import calendar | Yes | View | Yes |
| Tokenization project CRUD | Yes | View | Yes |
| Knowledge Vault upload/search | Yes | View | Yes |
| Partnership CRUD | Yes | View | Yes |
| Investor records (basic) | Yes | View | Yes |
| Executive dashboard | View | Yes | Yes |
| PDF report export | Yes | Yes | Yes |
| User management | No | No | Yes |

**Note:** Legal, Marketing, and Operations roles from FSB v1.0 are deferred to Phase 2 when those teams onboard.

---

# **5. SCOPE DEFINITION**

## **5.1 Phase 1 Module Inventory**

All modules launch together at Week 8.

| Module | FSB Ref | Phase 1 Scope Level | Build Status | ERM Entities |
| --- | --- | --- | --- | --- |
| Government Relations CRM | M1 | **Full** | 🟡 **Partial** | Organization, GovernmentProfile, Contact, StakeholderMap |
| Strategic Account Management | M2 | **Full** | 🟢 **Good** | Organization, AccountProfile, Contact |
| Deal Pipeline Engine | M3 | **Full** | 🟢 **Good** | Deal, DealStageHistory, Activity, Task, Note, Forecast |
| Document Intelligence Center | M4 | **Core** (AI draft + versions; no approval workflow) | 🟡 **Partial** | Document, DocumentVersion, Contract |
| Event & Conference Engine | M5 | **Full** (+ Google Calendar import) | 🟢 **Good** | Event, EventParticipant, EventLead |
| Tokenization Opportunity Registry | M6 | **Full** | 🟢 **Good** | TokenizationProject, ResourceAsset, ProjectPhaseHistory |
| Capital Formation Tracker | M7 | **Deferred post-launch** | ⬜ **Remaining** | Organization, InvestorProfile |
| Compliance & Due Diligence (KYC) | M8 | **Out of scope** | — | ComplianceCase, DueDiligenceCheck |
| Knowledge Vault | M9 | **Core** (upload, tag, manual search) | 🟡 **Partial** | KnowledgeAsset, KnowledgeTag |
| Executive Command Center | M10 | **Full** (dashboard + PDF export) | 🟢 **Good** | Aggregations across all entities |
| Partnership Management | — | **Basic** | 🟢 **Good** | Partnership, PartnershipMember |
| B2C Campaign Tracking | — | **Light** | 🟢 **Good** | Campaign metrics on dashboard only |
| **Regulatory Affairs** | **M11** | **Full** | ⬜ **Remaining** | RegulatoryMeeting, RegulatorySubmission, RegulatoryConsultation, LicensingConversation, RegulatoryRequirement |
| **Strategic Influence Graph** | **M12** | **Full** | ⬜ **Remaining** | ContactPositionHistory, InfluenceRelationship, StakeholderMap (extended) |

**Partial notes:** GOV — contacts on org/deal live; **FR-GOV-07 visual stakeholder map fulfilled by SIG (M12)**. DOC — FR-DOC-09 per-document PDF/DOCX export not built (executive report export is 🟢). KNW — FR-KNW-08/09/10 source PDF seed pending Week 8. CAP — **deferred post-launch** per Week 8 pivot (decision #28).

## **5.3 Week 8 Module Addendum — Data Model (REG + SIG)**

New tables extend ERM v1.0. Migration: `20260628000001_regulatory_influence_rls.sql` (Week 8).

### **Regulatory Affairs entities**

| Entity | Purpose | Key fields |
| --- | --- | --- |
| `regulatory_meetings` | Track meetings with regulators | `title`, `meeting_date`, `meeting_type` (IN_PERSON, VIRTUAL, WRITTEN), `regulator_organization_id`, `territory_id`, `status` (SCHEDULED, COMPLETED, CANCELLED), `outcome_summary`, `next_steps`, `deal_id` (optional), `owner_id` |
| `regulatory_meeting_attendees` | Junction: meeting ↔ contacts | `meeting_id`, `contact_id`, `attendance_role` (REGULATOR, UBUNTU, ADVISOR, OTHER) |
| `regulatory_submissions` | Policy submissions to regulators | `title`, `submission_type` (POLICY_PROPOSAL, WHITEPAPER, COMMENT_LETTER, REGULATORY_FILING, OTHER), `regulator_organization_id`, `territory_id`, `submitted_at`, `reference_number`, `status` (DRAFT, SUBMITTED, UNDER_REVIEW, ACCEPTED, REJECTED, WITHDRAWN), `document_id` (optional), `response_summary`, `deal_id` (optional) |
| `regulatory_consultations` | Consultation papers & responses | `title`, `regulator_organization_id`, `territory_id`, `published_date`, `response_deadline`, `response_status` (NOT_STARTED, IN_PROGRESS, SUBMITTED, NOT_APPLICABLE), `consultation_url`, `our_response_document_id` (optional), `notes` |
| `licensing_conversations` | Licensing dialogues | `title`, `license_type` (VASP, EXCHANGE, PAYMENT_SERVICE, CUSTODY, TOKEN_ISSUANCE, OTHER), `territory_id`, `regulator_organization_id`, `status` (EXPLORING, PRE_APPLICATION, APPLICATION_SUBMITTED, UNDER_REVIEW, APPROVED, DENIED, ON_HOLD), `target_timeline`, `primary_contact_id`, `deal_id` (optional), `notes` |
| `regulatory_requirements` | Jurisdiction compliance requirements | `title`, `description`, `territory_id`, `product_id` (optional), `category` (LICENSING, AML_CFT, CONSUMER_PROTECTION, CAPITAL, REPORTING, OTHER), `compliance_status` (IDENTIFIED, IN_PROGRESS, MET, NOT_APPLICABLE, AT_RISK), `due_date`, `evidence_document_id` (optional), `owner_id` |

**Shared REG patterns:** All entities link to `Organization` (regulator subtype), `Territory`, optional `Deal` and `Document`; audit fields (`created_at`, `updated_at`, `created_by`); RLS mirrors pipeline module (Commercial CRUD own/team; Executive read-only).

### **Strategic Influence Graph entities**

| Entity | Purpose | Key fields |
| --- | --- | --- |
| `contact_position_history` | Former and current roles | `contact_id`, `organization_id`, `title`, `start_date`, `end_date` (null = current), `is_current`, `notes` |
| `influence_relationships` | Person-to-person edges | `source_contact_id`, `target_contact_id`, `relationship_type` (REPORTS_TO, INFLUENCES, MENTORS, COLLEAGUE, ADVISES, INTRODUCED_BY, OTHER), `strength` (1–5), `relationship_to_ubuntu` (CHAMPION, SUPPORTER, NEUTRAL, SKEPTIC, BLOCKER — optional), `notes`, `last_verified_at`, `deal_id` (optional), `organization_id` (optional scope) |
| `stakeholder_maps` *(existing)* | Per-deal/org Ubuntu relationship | Reused; SIG graph aggregates maps + `influence_relationships` |

**Contact influence fields (extend `contacts` or computed view):** `current_influence_score` (1–100, manual), `influence_tier` (HIGH, MEDIUM, LOW) — stored on Contact or derived from max relationship strength.

**Graph UI:** Force-directed or hierarchical layout; filter by deal, organization, territory; node = Contact (avatar, title, org badge, influence tier); edge = InfluenceRelationship (label + strength).

## **5.2 Phase 2+ Roadmap (Reference)**

| Phase | Timeline | Additions |
| --- | --- | --- |
| Phase 2 | Post-launch +8 weeks | Compliance center, document approval workflows, Knowledge Vault AI search, Legal/Marketing/Operations roles, automated email reports |
| Phase 3 | +8 weeks | Full capital raise tracker, on-chain reference fields, treasury conversion tracker, revenue recognition |
| Phase 4 | +8 weeks | AI copilot, predictive analytics, opportunity recommendations, native mobile |

---

# **6. FUNCTIONAL REQUIREMENTS**

Requirements use the format: **FR-{MODULE}-{NN}** with priority **P0** (launch blocker) or **P1** (launch important).

---

## **6.1 Platform Foundation (PLT)** — 🟢 **Good**

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-PLT-01 | User registration and login via email/password (Supabase Auth) | P0 | User can sign up, verify email, log in, log out, reset password |
| FR-PLT-02 | Role assignment: Commercial, Executive, Admin | P0 | Admin can assign roles; UI respects permission matrix |
| FR-PLT-03 | Territory management (pan-African) | P0 | Pre-seeded territories: Nigeria, Ghana, Kenya, South Africa, Senegal, Côte d'Ivoire, Rwanda, Pan-Africa, Global; admin can add more |
| FR-PLT-04 | Product catalog (Ubuntu ecosystem) | P0 | GIFT, UTribe Wallet, UbuntuVerse, Ubuntu Capital pre-seeded and selectable on deals |
| FR-PLT-05 | Global search across organizations, deals, contacts | P1 | Search bar returns results from orgs, deals, contacts within 500ms |
| FR-PLT-06 | Audit fields on all core entities | P0 | created_at, updated_at, created_by visible on records |
| FR-PLT-07 | Soft delete on organizations and deals | P1 | Deleted records hidden from lists but recoverable by admin |

---

## **6.2 Government Relations CRM (GOV)** — 🟡 **Partial**

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-GOV-01 | Create government Organization with GovernmentProfile | P0 | Supports levels: National, State, Regional, Local, Sovereign Institution, Traditional Kingdom |
| FR-GOV-02 | Entity subtypes: Ministry, Agency, Regulatory Body, Development Authority, SWF | P0 | Subtype selectable on profile |
| FR-GOV-03 | Government hierarchy (parent/child) | P0 | Ministry can link to parent National Government org |
| FR-GOV-04 | Engagement priority scoring (Critical/High/Medium/Low) | P0 | Filterable on government list view |
| FR-GOV-05 | Contact management with role tags | P0 | Contacts tagged: Decision Maker, Influencer, Champion, Gatekeeper, Legal, Technical |
| FR-GOV-06 | Influence level per contact (High/Medium/Low) | P0 | Visible on contact card and stakeholder map |
| FR-GOV-07 | Stakeholder map per deal or organization | P0 | **Fulfilled by SIG module (M12):** visual influence graph with contacts, relationship to Ubuntu, org chart links, and person-to-person edges |
| FR-GOV-08 | Engagement timeline | P0 | Chronological activity feed on government org detail page |
| FR-GOV-09 | Government list with filters | P0 | Filter by territory, level, priority, owner, status |
| FR-GOV-10 | Opportunity scoring on government org | P1 | Numeric score 1–100 with manual override |

---

## **6.3 Strategic Account Management (ACC)** — 🟢 **Good**

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-ACC-01 | Create institutional Organization with AccountProfile | P0 | Subtypes: Bank, Fintech, PSP, Exchange, OTC Desk, Mining, Commodity Trader, Family Office, Asset Manager, Corporate Treasury |
| FR-ACC-02 | Treasury interest level tracking | P0 | None / Exploring / Active / Committed |
| FR-ACC-03 | GIFT adoption status | P0 | None / Evaluating / Pilot / Live |
| FR-ACC-04 | Wallet integration status | P1 | None / In Progress / Live |
| FR-ACC-05 | Account tier classification | P0 | Strategic, Tier 1, Tier 2, Tier 3 |
| FR-ACC-06 | Account detail page with linked deals, activities, documents | P0 | Single-page view of all related commercial data |
| FR-ACC-07 | Annual revenue potential field | P1 | USD decimal on account profile |
| FR-ACC-08 | Account list with segment and status filters | P0 | Filter by subtype, territory, tier, owner, treasury interest |

---

## **6.4 Deal Pipeline Engine (DEAL)** — 🟢 **Good**

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-DEAL-01 | Create deal linked to Organization | P0 | Required fields: name, org, owner, segment, revenue engine, stage |
| FR-DEAL-02 | Full 15-stage pipeline per COM/ERM lifecycle | P0 | All stages from Lead through Expansion, plus Lost and On Hold |
| FR-DEAL-03 | Kanban board view by stage | P0 | Drag-and-drop stage changes with confirmation |
| FR-DEAL-04 | List/table view with sorting and filtering | P0 | Filter by stage, segment, revenue engine, owner, territory, date range |
| FR-DEAL-05 | Deal value and weighted value | P0 | estimated_value × probability = weighted_value (auto-calculated) |
| FR-DEAL-06 | Stage history audit trail | P0 | Every stage change logged with timestamp, user, duration in previous stage |
| FR-DEAL-07 | Deal scoring (1–100) | P1 | Manual score with optional auto-suggestion based on stage + engagement |
| FR-DEAL-08 | Link deal to tokenization project, partnership, source event | P0 | Foreign key links on deal detail page |
| FR-DEAL-09 | Activity logging (call, meeting, email, visit, demo, presentation) | P0 | Activities linked to deal and/or org with date, duration, outcome |
| FR-DEAL-10 | Task management with assignee and due date | P0 | Tasks linked to deals; status: Open, In Progress, Completed, Cancelled |
| FR-DEAL-11 | Notes on deals (pinned support) | P0 | Free-form notes with author and timestamp |
| FR-DEAL-12 | Pipeline dashboard metrics | P0 | Total pipeline value, deal count by stage, weighted pipeline, avg deal age |
| FR-DEAL-13 | Manual forecast entry (weekly/monthly/quarterly) | P1 | Forecast record with period, amount, segment filter, submitter |
| FR-DEAL-14 | Lead source tracking | P0 | Source: Inbound, Outbound, Event, Referral, Partner, Government, Other |
| FR-DEAL-15 | Expected and actual close dates | P0 | Date fields with overdue highlighting |
| FR-DEAL-16 | Commercial risk flags on deals | P1 | Multi-select six COM §6 categories (`commercial_risk_type[]`); see `UBUNTU GROWTHOS COMMERCIAL RISK FLAGS SPEC v1.md` |
| FR-DEAL-17 | Risk severity, mitigation, review date | P1 | Required severity when flags set; review date required for HIGH/CRITICAL; notes and mitigation text |
| FR-DEAL-18 | Risk suggestions from REG/pipeline heuristics | P1 | Non-blocking suggested flags on deal edit/detail from linked regulatory records and stage heuristics |
| FR-DEAL-19 | Pipeline filter by commercial risk | P1 | Filter list/kanban by flag presence, specific flag, and severity |

**Out of scope P1:** Full ComplianceCase / DD center (Phase 2); organization-level risk register.

---

## **6.5 Document Intelligence Center (DOC)** — 🟡 **Partial**

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-DOC-01 | Create document linked to deal and/or organization | P0 | Document types: NDA, MOU, Proposal, Government Brief, Partnership Agreement, Investor Deck, Contract, SOW, Other |
| FR-DOC-02 | AI-assisted drafting via Anthropic (Claude) | P0 | User selects type, provides context (org, deal, key terms); AI generates draft within 60 seconds |
| FR-DOC-03 | Document status tracking (manual) | P0 | Statuses: Draft, In Review, Pending Approval, Approved, Sent, Signed, Executed, Expired, Terminated |
| FR-DOC-04 | Version control | P0 | Each save/upload creates new version with number, author, timestamp, change summary |
| FR-DOC-05 | File storage on AWS S3 | P0 | Upload/download via presigned URLs; metadata in Supabase |
| FR-DOC-06 | Document list with filters | P0 | Filter by type, status, deal, org, owner |
| FR-DOC-07 | Contract extension fields | P1 | Contract number, value, payment terms, renewal date, governing law |
| FR-DOC-08 | Template selection for AI drafting | P1 | Knowledge Vault templates usable as AI drafting context |
| FR-DOC-09 | Export document as PDF/DOCX | P0 | Download current version in standard formats |

**Out of scope P1:** Multi-step approval workflow engine (Phase 2). Status changes are manual.

---

## **6.6 Event & Conference Engine (EVT)** — 🟢 **Good**

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-EVT-01 | Create event with type, dates, location, territory | P0 | Types: Conference, Roundtable, Executive Meeting, Government Briefing, Workshop, Webinar, Internal, Other |
| FR-EVT-02 | Event budget and actual cost tracking | P1 | USD fields for ROI calculation |
| FR-EVT-03 | Ubuntu role at event | P0 | Speaker, Sponsor, Exhibitor, Attendee, Host |
| FR-EVT-04 | Event participant tracking | P0 | Link Ubuntu users, external contacts, and organizations |
| FR-EVT-05 | Lead capture (EventLead) | P0 | Capture contact/org at event with quality (Hot/Warm/Cold) and follow-up status |
| FR-EVT-06 | Convert event lead to deal | P0 | One-click create deal from event lead pre-filled with source |
| FR-EVT-07 | Event calendar view (month/week) | P0 | Visual calendar of all GrowthOS events |
| FR-EVT-08 | Google Calendar import (one-way, import only) | P0 | OAuth connect to Google; pull events from selected calendar(s) into GrowthOS as Event records; re-import updates existing matched events |
| FR-EVT-09 | Post-event ROI notes | P1 | Free-text ROI assessment on event detail |
| FR-EVT-10 | Link event to deals (source attribution) | P0 | Deals show originating event |

---

## **6.7 Tokenization Opportunity Registry (TOK)** — 🟢 **Good**

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-TOK-01 | Create tokenization project linked to government org | P0 | Asset types: Gold, Silver, Lithium, Copper, Rare Earth, Real Estate, Infrastructure, Carbon, Community Development, Other |
| FR-TOK-02 | B2G phase tracking (5 phases) | P0 | Resource Discovery → Valuation → Digital Asset Structuring → Capital Formation → Development & Deployment |
| FR-TOK-03 | Phase history log | P0 | Timestamped entries when project enters/completes each phase |
| FR-TOK-04 | Resource assets within project | P0 | Multiple assets per project with reserves, valuation, location, discovery status |
| FR-TOK-05 | Readiness score (1–100) | P0 | Manual score on project |
| FR-TOK-06 | Opportunity score (1–100) | P0 | Commercial priority score |
| FR-TOK-07 | Project status | P0 | Prospect, Active, Structuring, Live, Paused, Completed |
| FR-TOK-08 | Link project to deal | P0 | Bidirectional link between TokenizationProject and Deal |
| FR-TOK-09 | Board view by B2G phase | P0 | Kanban by current_phase |
| FR-TOK-10 | Estimated asset value (USD) | P0 | Decimal field on project and per resource asset |

---

## **6.8 Capital Formation — Basic (CAP)** — ⬜ **Deferred post-launch**

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-CAP-01 | Create investor Organization with InvestorProfile | P0 | Types: VC, Family Office, Institutional, Sovereign Wealth, Treasury, Asset Manager, Angel, Other |
| FR-CAP-02 | Investor fields: thesis, check size range, preferred asset classes | P1 | Text and decimal fields on profile |
| FR-CAP-03 | Link investor to deal | P0 | Deal detail shows associated investors with relationship warmth (Cold/Warm/Hot/LP) |
| FR-CAP-04 | Investor list with filters | P0 | Filter by type, territory, warmth, owner |
| FR-CAP-05 | Investor detail page with linked deals | P0 | All deals associated with investor visible |

**Week 8 pivot:** CAP deferred to post-launch; **REG + SIG are launch blockers** (decision #28).

**Out of scope P1:** CapitalRaise entity, InvestmentCommitment tracking, raise progress dashboards (Phase 3).

---

## **6.9 Knowledge Vault (KNW)** — 🟡 **Partial**

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-KNW-01 | Upload knowledge assets to AWS S3 | P0 | Types: Whitepaper, Pitch Deck, SOP, Legal Template, Market Research, Regulatory Brief, Playbook, Other |
| FR-KNW-02 | Tagging system | P0 | Create tags; assign multiple tags per asset; filter by tag |
| FR-KNW-03 | Manual text search (title, summary, tags) | P0 | Search returns matching assets within 500ms |
| FR-KNW-04 | Filter by segment, product, territory | P0 | Dropdown filters on knowledge list |
| FR-KNW-05 | Template flag for AI drafting | P0 | is_template boolean; templates appear in Document Intelligence template picker |
| FR-KNW-06 | Version field on assets | P1 | Optional version string |
| FR-KNW-07 | Download uploaded assets | P0 | Presigned S3 download |
| FR-KNW-08 | Seed 4 source PDFs at launch | P0 | All PDFs from Source Documents Index pre-loaded with tags, types, and template flags per seed spec |
| FR-KNW-09 | Source PDF template flagging | P0 | B2G deck, Pitch Deck, Whitepaper marked `is_template = true` for AI drafting |
| FR-KNW-10 | Restricted access on contract PDF | P0 | Employment contract asset visible to Admin role only |
| FR-KNW-11 | Source document metadata | P0 | Each seed asset includes summary, tags, segment, and product linkage from Source Documents Index |

**Out of scope P1:** Semantic AI search, embedding vectors, knowledge graph (Phase 2).

**Source PDFs (seed at launch):**

| File | Vault Type | Template |
| --- | --- | --- |
| ` B2G Master Presentation  2.pdf` | GOVERNMENT_BRIEF | Yes |
| `Generic Pitch Deck - March 2026.pdf` | PITCH_DECK | Yes |
| `Mansa Musa (Ubuntu Tribe)Whitepaper_2026.pdf` | WHITEPAPER | Yes |
| `CHIMEZIE CHUTA CONTRAT  - Copy – Copie.pdf` | SOP (restricted) | No |

---

## **6.10 Partnership Management (PRT)** — 🟢 **Good**

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-PRT-01 | Create partnership with type and status | P0 | Types: Distribution, Strategic Alliance, JV, Technology, Listing, Custody, Revenue Share, Referral, Other |
| FR-PRT-02 | Link primary partner organization | P0 | Required primary partner |
| FR-PRT-03 | Multi-party partnerships (PartnershipMember) | P1 | Additional orgs with role in partnership |
| FR-PRT-04 | Link partnership to originating deal | P0 | Bidirectional deal ↔ partnership link |
| FR-PRT-05 | Partnership list with status filters | P0 | Discussion, MOU, Active, Paused, Terminated |
| FR-PRT-06 | Revenue share terms (text) | P1 | Free-text field on partnership |

---

## **6.11 Executive Command Center (EXEC)** — 🟢 **Good**

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-EXEC-01 | Pipeline summary dashboard | P0 | Total pipeline value, weighted value, deal count by stage, by segment, by revenue engine |
| FR-EXEC-02 | Government engagement summary | P0 | Active B2G org count, by territory, by priority |
| FR-EXEC-03 | Active opportunities widget | P0 | Top deals by value and priority with stage |
| FR-EXEC-04 | Partnership count (active) | P0 | Active partnerships total |
| FR-EXEC-05 | Tokenization projects by phase | P0 | Count and value by B2G phase |
| FR-EXEC-06 | Event ROI summary | P1 | Events this quarter, leads captured, leads converted |
| FR-EXEC-07 | B2C campaign metrics (light) | P1 | Manual entry fields for campaign-level B2C metrics on dashboard |
| FR-EXEC-08 | Forecast vs. pipeline comparison | P1 | Side-by-side forecast entry and pipeline rollup |
| FR-EXEC-09 | PDF report export | P0 | One-click export of dashboard snapshot as branded PDF ≤ 30 min to produce weekly report |
| FR-EXEC-10 | Date range filter on all dashboard widgets | P0 | Filter by week, month, quarter, custom range |
| FR-EXEC-11 | Executive read-only access | P0 | Executive role sees dashboard and all data read-only |
| FR-EXEC-12 | Regulatory affairs summary widget | P1 | Open meetings, pending consultations, at-risk requirements by territory |
| FR-EXEC-13 | Influence graph coverage widget | P1 | Active B2G deals with mapped relationships vs. total active B2G deals |
| FR-EXEC-14 | Commercial risk summary widget | P1 | Count open deals with commercial risk flags, by category, by severity, overdue review dates |
| FR-EXEC-15 | Top at-risk deals list | P1 | Up to 5 flagged deals with severity, value, and link to deal detail; see Commercial Risk Flags Spec v1.0 |

---

## **6.12 Regulatory Affairs (REG)** — ⬜ **Remaining**

Tracks regulatory engagement across jurisdictions — meetings, submissions, consultations, licensing dialogues, and compliance requirements. Distinct from Phase 2 **ComplianceCase** KYC workflow (decision #19).

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-REG-01 | Regulatory meetings CRUD | P0 | Create/edit/list meetings with date, type, regulator org, territory, status, outcome, optional deal link |
| FR-REG-02 | Meeting attendee management | P0 | Add/remove contacts as attendees with role (Regulator, Ubuntu, Advisor, Other) |
| FR-REG-03 | Policy submissions CRUD | P0 | Track submission type, reference number, submitted date, status lifecycle, linked document |
| FR-REG-04 | Consultation papers CRUD | P0 | Track published date, response deadline, response status, optional URL and response document |
| FR-REG-05 | Licensing conversations CRUD | P0 | Track license type, jurisdiction, status, primary contact, target timeline, notes |
| FR-REG-06 | Compliance requirements CRUD | P0 | Track requirement title, category, compliance status, due date, owner, optional product and evidence document |
| FR-REG-07 | Regulator organization linkage | P0 | All REG records link to Organization with Regulatory Body subtype (or government agency) |
| FR-REG-08 | Territory scoping | P0 | All REG records require territory; list views filterable by territory |
| FR-REG-09 | Deal cross-links | P0 | Optional deal_id on meetings, submissions, licensing conversations; visible on deal detail Regulatory tab |
| FR-REG-10 | Document cross-links | P0 | Submissions, consultations, and requirements can link to Document or KnowledgeAsset |
| FR-REG-11 | Regulatory hub navigation | P0 | Sidebar section with sub-routes: Meetings, Submissions, Consultations, Licensing, Requirements |
| FR-REG-12 | List + detail pages per entity | P0 | Consistent list → detail → edit pattern matching Pipeline/Events modules |
| FR-REG-13 | Status filters and overdue alerts | P1 | Filter by status; highlight consultations past deadline and requirements AT_RISK or overdue |
| FR-REG-14 | Activity logging from REG records | P1 | "Log activity" action creates Activity linked to deal/org from meeting or licensing record |

**Out of scope P1:** Automated regulatory feed ingestion, e-filing integrations, KYC/due diligence cases (Phase 2 Compliance center).

---

## **6.13 Strategic Influence Graph (SIG)** — ⬜ **Remaining**

Living map of person-to-person influence across government and institutional engagements. Compounds in value as position history and relationship strength accumulate over time.

| ID | Requirement | Priority | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-SIG-01 | Contact position history CRUD | P0 | Add/edit past and current roles: org, title, start/end dates, is_current flag |
| FR-SIG-02 | Person-to-person relationship CRUD | P0 | Create directed edge between two contacts with type, strength (1–5), notes |
| FR-SIG-03 | Relationship types | P0 | REPORTS_TO, INFLUENCES, MENTORS, COLLEAGUE, ADVISES, INTRODUCED_BY, OTHER |
| FR-SIG-04 | Relationship strength scoring | P0 | Integer 1–5 on each edge; visible on graph and relationship list |
| FR-SIG-05 | Relationship to Ubuntu | P0 | Optional Champion/Supporter/Neutral/Skeptic/Blocker on edge or stakeholder map entry |
| FR-SIG-06 | Current influence on contact | P0 | Contact detail shows influence_tier (High/Medium/Low) and current_influence_score (1–100) |
| FR-SIG-07 | Visual influence graph | P0 | Interactive graph view: nodes (contacts), edges (relationships), zoom/pan; min 1280px viewport |
| FR-SIG-08 | Graph filters | P0 | Filter by deal, organization, territory; show/hide relationship types |
| FR-SIG-09 | Deal stakeholder tab | P0 | Deal detail "Influence" tab shows graph scoped to deal contacts + linked relationships |
| FR-SIG-10 | Organization influence view | P0 | Government/account detail shows contacts and internal REPORTS_TO hierarchy where mapped |
| FR-SIG-11 | Former positions display | P0 | Contact detail "Career" section lists position history with date ranges |
| FR-SIG-12 | Stakeholder map integration | P0 | Reuse `stakeholder_maps` for deal-level Ubuntu relationship; graph merges map + influence edges |
| FR-SIG-13 | Relationship verification date | P1 | `last_verified_at` on relationships; stale (>90 days) flagged in UI |
| FR-SIG-14 | Quick-add from contact | P1 | From contact card: "Add relationship" and "Add former role" without leaving context |

**Out of scope P1:** LinkedIn import, automated org-chart sync, predictive influence scoring (Phase 4).

---

# **7. KEY USER WORKFLOWS**

## **7.1 B2G Engagement Workflow**

```
Create Government Org → Add Contacts → Map Influence Relationships (SIG) on Deal
    → Log Regulatory Meetings & Requirements (REG) → Log Activities
    → Create TokenizationProject (phase: Resource Discovery)
    → AI Draft Government Brief → Stage Deal to Proposal → MOU → Contract
    → Executive Dashboard reflects engagement
```

## **7.2 Institutional Sales Workflow**

```
Create Account → Log Discovery Call → Create Deal (GIFT Adoption)
    → Link Investor (if applicable) → AI Draft Proposal
    → Move through Pipeline → Won → Implementation
```

## **7.3 Event-to-Pipeline Workflow**

```
Import Google Calendar Events → Enrich Event in GrowthOS
    → Capture EventLeads at conference → Convert Hot Lead to Deal
    → Assign follow-up Task → Track in Pipeline Dashboard
```

## **7.4 Weekly Executive Report Workflow**

```
Open Executive Command Center → Set date range to current week
    → Review pipeline, government, tokenization widgets
    → Export PDF → Share with leadership (target: ≤ 30 minutes total)
```

## **7.5 AI Document Drafting Workflow**

```
Open Deal → Create Document (type: MOU) → Select Knowledge Vault template
    → Provide context (parties, terms, jurisdiction) → Generate with Claude
    → Review/edit draft → Save version → Update status to In Review
    → Upload signed version when executed
```

## **7.6 Regulatory Affairs Workflow**

```
Identify jurisdiction requirement → Create RegulatoryRequirement (IDENTIFIED)
    → Schedule RegulatoryMeeting with regulator contacts → Log outcome
    → Draft policy response → Link Document → Create RegulatorySubmission or Consultation response
    → Track LicensingConversation through PRE_APPLICATION → APPROVED
    → Mark requirements MET with evidence document → Executive dashboard reflects open/at-risk items
```

## **7.7 Strategic Influence Mapping Workflow**

```
Create/import Contacts on Government or Account org → Add ContactPositionHistory (current + former roles)
    → Map InfluenceRelationships (person-to-person, strength 1–5)
    → Set relationship_to_ubuntu on deal stakeholder map
    → View Influence Graph on deal or org → Re-verify relationships quarterly (last_verified_at)
    → Graph enriches over time as roles change and new edges added
```

---

# **8. TECHNICAL ARCHITECTURE**

## **8.1 Stack Summary**

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS | UI, SSR, API routes |
| Hosting (Frontend) | Netlify | Deployment, CDN, serverless functions |
| Database | Supabase (PostgreSQL) | All relational data per ERM v1.0 |
| Auth | Supabase Auth | Email/password, JWT sessions, RLS |
| File Storage | AWS S3 | Documents, knowledge assets, PDF exports |
| AI | Anthropic API (Claude) | Document drafting via Netlify/Next.js API routes |
| Calendar | Google Calendar API | One-way import (OAuth 2.0) |
| PDF Generation | Server-side (e.g., `@react-pdf/renderer` or Puppeteer on Netlify function) | Executive report export |

## **8.2 Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                     NETLIFY                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Next.js App (App Router)                           │    │
│  │  ├── UI Components (React + Tailwind)               │    │
│  │  ├── Server Components (data fetching)              │    │
│  │  └── API Routes / Netlify Functions                 │    │
│  │       ├── /api/ai/draft-document  → Anthropic       │    │
│  │       ├── /api/calendar/import    → Google Calendar │    │
│  │       ├── /api/reports/pdf        → PDF generator   │    │
│  │       └── /api/files/presign      → AWS S3          │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │  SUPABASE   │  │   AWS S3    │  │  ANTHROPIC  │
   │  PostgreSQL │  │  Documents  │  │   Claude    │
   │  Auth + RLS │  │  Knowledge  │  │   API       │
   │  Realtime   │  │  Exports    │  │             │
   └─────────────┘  └─────────────┘  └─────────────┘
                           │
                    ┌──────┴──────┐
                    │   Google    │
                    │  Calendar   │
                    │    API      │
                    └─────────────┘
```

## **8.3 Supabase Schema Strategy**

- Derive PostgreSQL tables directly from ERM v1.0 entities (Section 5).
- Use Supabase Row Level Security (RLS) policies aligned to role permissions (ERM Section 11).
- Enums stored as PostgreSQL ENUM types matching ERM Section 4.
- `metadata` JSONB columns on Organization, Deal, TokenizationProject for extensibility.
- Supabase Realtime enabled for pipeline Kanban (optional P1).

## **8.4 AWS S3 Bucket Structure**

```
growthos-prod/
├── documents/{document_id}/v{version_number}/{filename}
├── knowledge/{asset_id}/{filename}
├── exports/{user_id}/{timestamp}-executive-report.pdf
└── temp/{upload_id}/{filename}    # presigned upload staging
```

## **8.5 API Route Contracts (Key Endpoints)**

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/ai/draft-document` | Send doc type + context → Claude → return draft |
| POST | `/api/files/upload-url` | Generate S3 presigned upload URL |
| GET | `/api/files/download-url` | Generate S3 presigned download URL |
| POST | `/api/calendar/connect` | Initiate Google OAuth |
| POST | `/api/calendar/import` | Pull events from connected calendar |
| POST | `/api/reports/executive-pdf` | Generate PDF from dashboard data |
| CRUD | `/api/*` via Supabase client | Direct Supabase queries with RLS for standard entities |

## **8.6 Environment Variables**

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET_NAME
AWS_REGION
ANTHROPIC_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
```

---

# **9. INTEGRATIONS**

## **9.1 Google Calendar (Import Only)**

| Aspect | Specification |
| --- | --- |
| Direction | One-way import: Google → GrowthOS |
| Auth | OAuth 2.0; per-user calendar connection |
| Scope | `calendar.readonly` |
| Behavior | User selects calendar(s) to import; system pulls events for configurable date range (default: ±3 months) |
| Matching | Match by `google_event_id` on re-import to update, not duplicate |
| Mapping | Google event → GrowthOS Event (name, dates, location, type default: Other) |
| Manual enrichment | Imported events editable in GrowthOS (type, territory, participants, leads) |
| Frequency | Manual "Import Now" button; optional daily auto-import (P1) |

## **9.2 Anthropic (Claude) — Document Drafting**

| Aspect | Specification |
| --- | --- |
| Model | Claude 3.5 Sonnet (or latest stable at build time) |
| Input | Document type, organization context, deal context, user-provided terms, optional Knowledge Vault template content |
| Output | Markdown or HTML draft stored as DocumentVersion v1 |
| Rate limiting | Per-user daily cap (configurable, default 20 drafts/day) |
| Error handling | Graceful fallback with user-visible error; retry option |
| Security | API key server-side only; no client exposure; document context not logged externally |

---

# **10. DATA MODEL REFERENCE**

All entities, enums, relationships, and constraints are defined in **UBUNTU GROWTHOS DATA ARCHITECTURE & ERM v1.0.md**.

### **Phase 1 Entity Checklist**

| Entity | In Phase 1 | Notes |
| --- | --- | --- |
| User | Yes | |
| Territory | Yes | Pre-seeded pan-African |
| Product | Yes | Pre-seeded Ubuntu products |
| Organization | Yes | Single profile type per org |
| GovernmentProfile | Yes | |
| AccountProfile | Yes | |
| PartnerProfile | Yes | For ecosystem partners |
| InvestorProfile | Yes | Basic capital module |
| Contact | Yes | |
| StakeholderMap | Yes | |
| Deal | Yes | |
| DealStageHistory | Yes | |
| Activity | Yes | |
| Task | Yes | |
| Note | Yes | |
| Forecast | Yes | Manual entry |
| Document | Yes | |
| DocumentVersion | Yes | |
| Contract | Yes | Extension of Document |
| Event | Yes | |
| EventParticipant | Yes | |
| EventLead | Yes | |
| TokenizationProject | Yes | |
| ResourceAsset | Yes | |
| ProjectPhaseHistory | Yes | |
| Partnership | Yes | |
| PartnershipMember | Yes | |
| KnowledgeAsset | Yes | |
| KnowledgeTag | Yes | |
| RegulatoryMeeting | Yes | Week 8 — REG module |
| RegulatorySubmission | Yes | Week 8 — REG module |
| RegulatoryConsultation | Yes | Week 8 — REG module |
| LicensingConversation | Yes | Week 8 — REG module |
| RegulatoryRequirement | Yes | Week 8 — REG module |
| ContactPositionHistory | Yes | Week 8 — SIG module |
| InfluenceRelationship | Yes | Week 8 — SIG module |
| ApprovalRequest | No | Phase 2 |
| ComplianceCase | No | Phase 2 |
| CapitalRaise | No | Phase 3 |
| InvestmentCommitment | No | Phase 3 |
| RevenueRecord | No | Phase 3 |
| TreasuryConversion | No | Phase 3 |

### **Confirmed ERM Deviations**

| ERM Assumption | PRD Resolution |
| --- | --- |
| Multi-profile organizations | **Rejected** — one primary profile type per Organization |
| B2C individual CRM | **Reduced** — campaign-level dashboard metrics only |
| ApprovalRequest workflow | **Deferred** — manual document status in Phase 1 |
| KnowledgeAsset AI search | **Deferred** — manual search in Phase 1 |
| Week 8 REG + SIG entities | **Added** — see Section 5.3; ERM addendum required before migration |

---

# **11. NON-FUNCTIONAL REQUIREMENTS**

| ID | Category | Requirement |
| --- | --- | --- |
| NFR-01 | Performance | Page load ≤ 2s on broadband; list views paginated (50/page) |
| NFR-02 | Performance | AI document draft response ≤ 60 seconds |
| NFR-03 | Performance | PDF export generation ≤ 30 seconds |
| NFR-04 | Availability | 99% uptime (Netlify + Supabase SLA) |
| NFR-05 | Security | All data encrypted in transit (TLS) and at rest (Supabase, S3) |
| NFR-06 | Security | RLS enforced on all Supabase tables |
| NFR-07 | Security | S3 presigned URLs with 15-minute expiry |
| NFR-08 | Security | API keys (Anthropic, AWS, Google) server-side only |
| NFR-09 | Scalability | Support 50 users without architecture changes |
| NFR-10 | Usability | Desktop-first; minimum viewport 1280px optimized |
| NFR-11 | Usability | Core workflows completable in ≤ 5 clicks from dashboard |
| NFR-12 | Data | Greenfield start; no migration tooling in Phase 1 |
| NFR-13 | Branding | Ubuntu Tribe brand per Section 12.4; logo from `download.svg`; site reference https://utribe.one/ |
| NFR-14 | Accessibility | Basic WCAG 2.1 AA on primary flows (contrast, labels, keyboard nav) |
| NFR-15 | Backup | Supabase daily backups; S3 versioning enabled |

---

# **12. UI/UX REQUIREMENTS**

## **12.1 Application Structure (Navigation)**

```
GrowthOS
├── Dashboard (Executive Command Center)
├── Pipeline
│   ├── Kanban Board
│   ├── Deal List
│   └── Forecast
├── Organizations
│   ├── Governments
│   ├── Institutional Accounts
│   ├── Partners
│   └── Investors
├── Tokenization Projects
├── Documents
├── Events
│   └── Calendar View
├── Partnerships
├── Knowledge Vault
├── Regulatory Affairs
│   ├── Meetings
│   ├── Submissions
│   ├── Consultations
│   ├── Licensing
│   └── Requirements
├── Influence Graph
└── Settings
    ├── Territories
    ├── Products
    ├── Users (Admin)
    └── Calendar Connection
```

## **12.2 Key Screen Inventory**

| Screen | Primary User | Priority | Build Status |
| --- | --- | --- | --- |
| Executive Dashboard | Executive, Commercial | P0 | 🟢 **Good** |
| Pipeline Kanban | Commercial | P0 | 🟢 **Good** |
| Deal Detail (with tabs: Overview, Activities, Documents, Influence, Notes) | Commercial | P0 | 🟡 **Partial** — Influence tab pending SIG |
| Government List + Detail | Commercial | P0 | 🟢 **Good** |
| Account List + Detail | Commercial | P0 | 🟢 **Good** |
| Influence Graph (visual) | Commercial | P0 | ⬜ **Remaining** — SIG module |
| Regulatory Affairs — Meetings list + detail | Commercial | P0 | ⬜ **Remaining** |
| Regulatory Affairs — Submissions list + detail | Commercial | P0 | ⬜ **Remaining** |
| Regulatory Affairs — Consultations list + detail | Commercial | P0 | ⬜ **Remaining** |
| Regulatory Affairs — Licensing list + detail | Commercial | P0 | ⬜ **Remaining** |
| Regulatory Affairs — Requirements list + detail | Commercial | P0 | ⬜ **Remaining** |
| Contact detail — Career (position history) | Commercial | P0 | ⬜ **Remaining** |
| Tokenization Project Board | Commercial | P0 | 🟢 **Good** |
| Document Editor + AI Draft Panel | Commercial | P0 | 🟢 **Good** |
| Event Calendar + Detail | Commercial | P0 | 🟢 **Good** |
| Knowledge Vault List + Upload | Commercial | P0 | 🟢 **Good** |
| PDF Report Preview + Export | Executive, Commercial | P0 | 🟢 **Good** |
| Login / Register | All | P0 | 🟢 **Good** |

## **12.3 Design Principles**

1. **Density over decoration** — CRM-style information density; minimize clicks.
2. **Deal-centric navigation** — Every module links back to deals where applicable.
3. **Africa-first defaults** — Nigeria pre-selected territory; African timezone (WAT/EAT/SAST) support.
4. **Ubuntu Tribe brand** — Apply official brand from https://utribe.one/ using logo (`download.svg`) and palette defined in Section 12.4.
5. **Consistent entity patterns** — List → Detail → Edit flows identical across modules.

## **12.4 Ubuntu Tribe Brand & Website Reference**

GrowthOS is an internal platform but must visually align with the public Ubuntu Tribe brand. Full reference: **`UBUNTU TRIBE WEBSITE REFERENCE - utribe.one.md`**.

### **Official Properties**

| Property | URL |
| --- | --- |
| Corporate website | https://utribe.one/ |
| Utribe Wallet | https://gift.utribe.app |
| Logo (project asset) | `download.svg` |

### **Brand Tokens (Implementation)**

| Token | Value | Tailwind / CSS Usage |
| --- | --- | --- |
| `--brand-purple` | `#9035F4` | Primary nav, buttons, active states |
| `--brand-purple-light` | `#9359FF` | Gradients, hover, secondary accents |
| `--brand-gold` | `#C9932A` | Pipeline values, deal highlights, success |
| `--brand-gradient` | `#9035F4` → `#C9932A` | Login screen, report headers (match logo mark) |

### **Logo Usage**

| Location | Specification |
| --- | --- |
| App header | `download.svg` left-aligned, max height 32px; purple nav background |
| Login / register | Centered logo on purple gradient background |
| PDF executive report | Logo + "Ubuntu GrowthOS" subtitle + report date |
| Favicon | Generate from butterfly mark in `download.svg` |

**Note:** Source SVG wordmark uses white paths — display on purple/dark backgrounds, not white backgrounds.

### **Messaging Alignment (for UI copy & AI drafting context)**

| Context | Reference Copy (from utribe.one) |
| --- | --- |
| Tagline | Real value. Digital access. Shared opportunity. |
| GIFT positioning | Credible alternative backed by physical gold; accessible from less than $1 |
| Tone | Credible, human, accessible — not crypto-speculative |
| Product names | $GIFT, Utribe Wallet, UbuntuVerse, Ubuntu Capital (official casing) |

### **GrowthOS vs. Public Brand**

| Aspect | Public Website (utribe.one) | GrowthOS (internal) |
| --- | --- | --- |
| Audience | Retail, institutions, public | Commercial team + executives |
| Layout | Marketing storytelling | CRM information density |
| Colors | Purple gradients, gold accents | Same palette, more white/light content area |
| CTA | "Start Saving" / "Buy $GIFT" | "Create Deal" / "Log Activity" / "Export Report" |

### **Brand Implementation Requirements (P0)** — 🟢 **Good**

| ID | Status | Requirement | Acceptance Criteria |
| --- | --- | --- | --- |
| FR-BRD-01 | 🟢 **Good** | Logo in app header | `download.svg` visible on all authenticated pages |
| FR-BRD-02 | 🟢 **Good** | Branded login screen | Purple gradient + centered logo |
| FR-BRD-03 | 🟢 **Good** | Purple/gold theme applied | Primary UI uses brand tokens from Section 12.4 |
| FR-BRD-04 | 🟢 **Good** | Branded PDF export | Executive report includes logo and Ubuntu Tribe footer |
| FR-BRD-05 | 🟢 **Good** | External website link | Settings or footer links to https://utribe.one/ |
| FR-BRD-06 | 🟢 **Good** | Official product naming | Product catalog uses names from website/ Knowledge Base |

---

# **13. 8-WEEK DELIVERY PLAN**

All modules go live at **Week 8**. Development runs in parallel workstreams.

## **13.1 Workstreams**

| Stream | Owner | Modules | Build Status |
| --- | --- | --- | --- |
| A — Foundation | Chimezie | PLT, Auth, Supabase schema, S3 setup, layout/nav | 🟢 **Good** |
| B — CRM & Pipeline | Chimezie | GOV, ACC, DEAL, Activities, Tasks, Notes | 🟢 **Good** |
| C — Documents & AI | Chimezie | DOC, Anthropic integration, Knowledge Vault templates | 🟡 **Partial** |
| D — Events & Calendar | Chimezie | EVT, Google Calendar import | 🟢 **Good** |
| E — Tokenization & Capital | Chimezie | TOK; CAP deferred post-launch | 🟡 **Partial** |
| F — Partnerships & Knowledge | Chimezie | PRT, KNW | 🟡 **Partial** |
| G — Executive & Reporting | Chimezie | EXEC, PDF export | 🟢 **Good** |
| H — Regulatory & Influence | Chimezie | REG, SIG | ⬜ **Remaining** |

## **13.2 Week-by-Week Milestones**

| Week | Status | Milestone | Deliverables | Exit Criteria |
| --- | --- | --- | --- | --- |
| **1** | 🟢 **Good** | Foundation & Schema | Next.js project on Netlify; Supabase project; full ERM schema migrated; Auth working; S3 bucket; app shell with nav; brand theme + logo (`download.svg`) | User can log in and see branded empty dashboard |
| **2** | 🟢 **Good** | CRM Core | Organization CRUD (all profile types); Contact CRUD; Territory/Product seeds; Government + Account list/detail pages | Create government and account with contacts |
| **3** | 🟢 **Good** | Pipeline MVP | Deal CRUD; 15-stage pipeline; Kanban board; stage history; activity logging; tasks and notes | Full deal lifecycle operable on Kanban |
| **4** | 🟡 **Partial** | Stakeholders & Links | Deal linking (events, tokenization, partnerships); partnership CRUD; **stakeholder visual map deferred to Week 8 SIG** | Cross-entity links work; influence graph Week 8 |
| **5** | 🟢 **Good** | Documents & AI | Document CRUD; S3 upload/download; Anthropic AI drafting; version control; Knowledge Vault upload/tag/search | AI generates MOU draft and saves as versioned document |
| **6** | 🟢 **Good** | Events & Tokenization | Event CRUD; calendar view; Google Calendar import; EventLead capture; TokenizationProject board with phases and resource assets | Import Google events; create tokenization project at phase 1 |
| **7** | 🟢 **Good** | Executive & Polish | Executive dashboard all widgets; PDF export; B2C campaign metrics; global search; UX polish; RLS policies; bug fixes | PDF report exports with real data; executive read-only works |
| **8** | ⬜ **Remaining** | **Launch + REG + SIG** | **REG module** (5 track types, CRUD, deal links); **SIG module** (graph, position history, relationships); E2E testing; seed 4 source PDFs; production deploy; onboarding | **All 12 modules live; REG + SIG pass P0 acceptance; 4 PDFs in vault; success criteria met** |

## **13.3 Daily Build Cadence (Recommended)**

- **Morning:** Pick 2–3 FR items from current week's milestone
- **Build:** Cursor-assisted implementation (schema → API → UI)
- **Evening:** Smoke test against acceptance criteria; commit to main

## **13.4 Launch Checklist (Week 8)**

- [ ] ⬜ **Remaining** — **REG module:** all FR-REG P0 requirements pass acceptance criteria
- [ ] ⬜ **Remaining** — **SIG module:** all FR-SIG P0 requirements pass acceptance criteria
- [ ] ⬜ **Remaining** — Supabase migration `20260628000001_regulatory_influence_rls.sql` applied in production
- [ ] ⬜ **Remaining** — All P0 functional requirements pass acceptance criteria (all modules)
- [ ] ⬜ **Remaining** — Supabase RLS policies verified for Commercial and Executive roles
- [ ] ⬜ **Remaining** — AWS S3 upload/download working in production
- [ ] ⬜ **Remaining** — Anthropic AI drafting working in production
- [ ] ⬜ **Remaining** — Google Calendar import tested with real calendar
- [ ] 🟢 **Good** — PDF executive report generates correctly
- [ ] 🟢 **Good** — DOCX executive report generates correctly *(added post–Week 7)*
- [ ] 🟢 **Good** — Pan-African territories and Ubuntu products seeded
- [ ] ⬜ **Remaining** — Admin user created; 2–5 commercial users invited
- [ ] ⬜ **Remaining** — Executive read-only account created and verified
- [ ] ⬜ **Remaining** — Environment variables secured in Netlify dashboard
- [ ] 🟢 **Good** — No secrets in client-side code
- [ ] 🟢 **Good** — Ubuntu Tribe logo (`download.svg`) and brand colors applied across app and PDF export
- [ ] ⬜ **Remaining** — All 4 source PDFs seeded in Knowledge Vault per Source Documents Index
- [ ] ⬜ **Remaining** — B2G deck, Pitch Deck, Whitepaper available as AI drafting templates
- [ ] ⬜ **Remaining** — Employment contract restricted to Admin role only
- [ ] ⬜ **Remaining** — Production deploy to Netlify complete
- [ ] ⬜ **Remaining** — End-to-end smoke test across all modules
- [ ] ⬜ **Remaining** — Team onboarding and README updated for launch

## **13.5 Week 8 Build Sequence (REG + SIG)**

Recommended implementation order (mirrors Weeks 2–7 patterns):

| Step | Deliverable | Pattern reference |
| --- | --- | --- |
| 1 | Types + constants + embeds for REG/SIG entities | `src/lib/types/`, `src/lib/constants/`, `src/lib/supabase/embeds.ts` |
| 2 | Migration `20260628000001_regulatory_influence_rls.sql` | Follow `20260627000001_reporting_rls.sql` RLS patterns |
| 3 | Server actions — REG CRUD (5 entity types) | `src/lib/actions/events.ts` list/detail pattern |
| 4 | Server actions — SIG (position history, relationships, graph query) | `src/lib/actions/contacts.ts` + graph aggregation |
| 5 | REG UI — list/detail pages under `/regulatory/*` | Events module UI |
| 6 | SIG UI — `/influence` graph + contact career tab + deal Influence tab | New graph component (e.g. react-force-graph or custom SVG) |
| 7 | Nav + dashboard widgets (FR-EXEC-12..15 P1 if time) | `src/components/layout/nav.tsx`, dashboard |
| 8 | Launch checklist remainder (PDF seed, deploy, E2E) | §13.4 |

---

# **14. RISKS & MITIGATIONS**

| Risk | Impact | Likelihood | Mitigation |
| --- | --- | --- | --- |
| 8-week solo build for 12 modules is aggressive | High | High | Strict P0-only scope; reuse UI patterns; CAP deferred; REG/SIG share list/detail patterns with Events/Pipeline |
| Google Calendar OAuth complexity | Medium | Medium | Use established library (googleapis); import-only reduces scope vs. two-way sync |
| AI drafting quality for legal docs | Medium | Medium | Position as "first draft" not final; always require human review; use Knowledge Vault templates as context |
| Supabase RLS misconfiguration | High | Medium | Test with two user accounts (Commercial + Executive) in Week 7 |
| S3 presigned URL security | High | Low | Short expiry; server-side generation only; bucket policy restricts public access |
| Anthropic API costs | Low | Low | Daily per-user cap; monitor usage in Week 5+ |
| Scope creep during build | High | Medium | This PRD is the scope contract; Week 8 pivot (#28) supersedes prior deferrals for REG/SIG only |
| Brand assets incomplete | Low | Low | Logo available at `download.svg`; colors extracted; see Website Reference doc |

---

# **15. ASSUMPTIONS & DEPENDENCIES**

## **15.1 Assumptions**

1. Chimezie has Netlify, Supabase, AWS, and Anthropic accounts with billing configured.
2. Ubuntu Tribe website (https://utribe.one/) and logo (`download.svg`) are available for brand implementation.
3. Google Cloud project can be created for Calendar API OAuth credentials.
4. No existing CRM data needs migration (greenfield pipeline data); **4 source PDFs seed Knowledge Vault at launch**.
5. Executive stakeholders will accept PDF reports (not automated email) in Phase 1.
6. Legal team will continue reviewing documents outside the platform until Phase 2 approval workflows.
7. 3–6 users is sufficient load for Supabase free/pro tier initially.

## **15.2 Dependencies**

| Dependency | Required By | Status |
| --- | --- | --- |
| ERM v1.0 finalized | Week 1 schema | 🟢 **Good** |
| Supabase project provisioned | Week 1 | 🟢 **Good** |
| AWS S3 bucket provisioned | Week 1 | 🟡 **Partial** — verify production |
| Netlify site connected to repo | Week 1 | 🟡 **Partial** — verify production deploy |
| Anthropic API key | Week 5 | 🟡 **Partial** — verify production |
| Google OAuth credentials | Week 6 | 🟡 **Partial** — verify production import |
| Ubuntu Tribe logo (`download.svg`) | Week 1 | 🟢 **Good** |
| Website reference doc | Week 1 | 🟢 **Good** |
| Source PDFs (4 files) | Week 8 seed | 🟡 **Partial** — files in repo; vault seed ⬜ **Remaining** |
| Source Documents Index | Week 1 | 🟢 **Good** |
| `seed.sql` (territories, products, tags) | Week 1 | 🟢 **Good** — applied in production |

---

# **16. SUCCESS METRICS (POST-LAUNCH)**

Measured 30 days after Week 8 launch.

| Metric | Target | Measurement |
| --- | --- | --- |
| Spreadsheet elimination | 0 Excel/Notion commercial trackers in use | Self-report + audit |
| Pipeline data freshness | 100% of active deals updated within 7 days | Last modified date |
| Government coverage | 100% of active B2G engagements in system | Manual audit |
| Stakeholder map coverage | ≥ 80% of active B2G deals have influence relationships mapped (SIG) | Deal audit |
| Regulatory coverage | 100% of active jurisdictions have open requirements tracked | REG audit |
| Weekly report time | ≤ 30 minutes | Timed exercise |
| User adoption | ≥ 3 commercial users active weekly | Supabase auth logs |
| Executive dashboard usage | ≥ 1 executive login per week | Auth logs |
| AI draft usage | ≥ 5 documents AI-drafted in first 30 days | Document records |
| Event lead conversion | ≥ 50% of EventLeads converted to deals or tasks | EventLead status |

---

# **17. GLOSSARY**

| Term | Definition |
| --- | --- |
| **GIFT** | Gold International Fungible Token — flagship gold-backed digital asset |
| **UbuntuVerse** | Tokenization-as-a-Service infrastructure layer |
| **Ubuntu Capital** | Capital formation and transaction advisory arm |
| **B2G** | Business-to-Government commercial motion |
| **COM** | Commercial Operating Model |
| **ERM** | Entity Relationship Model |
| **FSB** | Functional Specification Blueprint |
| **RLS** | Row Level Security (Supabase) |
| **RWA** | Real World Asset |
| **TaaS** | Tokenization-as-a-Service |
| **REG** | Regulatory Affairs module — meetings, submissions, consultations, licensing, requirements |
| **SIG** | Strategic Influence Graph — person-to-person relationships, position history, influence strength |

---

# **18. APPENDIX A — FUNCTIONAL REQUIREMENT TRACEABILITY**

| Module | P0 Count | P1 Count | Phase 1 Status |
| --- | --- | --- | --- |
| PLT | 5 | 2 | 🟢 **Good** |
| GOV | 9 | 1 | 🟡 **Partial** — FR-GOV-07 completes with SIG |
| ACC | 6 | 2 | 🟢 **Good** |
| DEAL | 12 | 7 | 🟡 **Partial** — FR-DEAL-16..19 remaining (COM §6 risk flags) |
| DOC | 7 | 2 | 🟡 **Partial** |
| EVT | 7 | 3 | 🟢 **Good** |
| TOK | 10 | 0 | 🟢 **Good** |
| CAP | 3 | 2 | ⬜ **Deferred** |
| KNW | 11 | 1 | 🟡 **Partial** |
| PRT | 4 | 2 | 🟢 **Good** |
| EXEC | 8 | 7 | 🟡 **Partial** — FR-EXEC-14..15 remaining (commercial risk widget) |
| REG | 12 | 2 | ⬜ **Remaining** |
| SIG | 12 | 2 | ⬜ **Remaining** |
| BRD | 6 | 0 | 🟢 **Good** |
| **Total** | **112** | **31** | **143 requirements** |

---

# **19. APPENDIX B — PHASE 2 BACKLOG (INITIAL)**

Items explicitly deferred from Phase 1 for future PRD revision.

1. Compliance & Due Diligence Center (KYC, due diligence checks, counterparty verification) — *distinct from REG regulatory affairs tracking*
2. Document approval workflow engine (sequential and parallel approvers)
3. Knowledge Vault semantic AI search (embeddings + retrieval)
4. Legal, Marketing, Operations user roles
5. Automated weekly email report delivery
6. CapitalRaise and InvestmentCommitment full tracker
7. RevenueRecord and TreasuryConversion tracking
8. On-chain wallet/token reference fields
9. Multi-currency support with FX
10. Two-way Google Calendar sync
11. Slack notifications for pipeline updates
12. AI copilot and predictive analytics (Phase 4)
13. Capital Formation basic (CAP) — investor CRUD deferred from Week 8
14. LinkedIn / external graph import for SIG

---

# **20. APPENDIX C — EXTERNAL & PROJECT REFERENCES**

| Reference | Location | Purpose |
| --- | --- | --- |
| **Ubuntu Tribe Website** | https://utribe.one/ | Public brand, messaging, product definitions |
| **Utribe Wallet** | https://gift.utribe.app | GIFT onboarding and wallet product |
| **Logo asset** | `download.svg` | App header, login, PDF reports, favicon source |
| **Website reference doc** | `UBUNTU TRIBE WEBSITE REFERENCE - utribe.one.md` | Curated brand/messaging guide for build |
| **Knowledge Base v1.0** | `UBUNTU TRIBE KNOWLEDGE BASE -v1.0.md` | Strategic context and B2G model |
| **Commercial Operating Model** | `UBUNTU COMMERCIAL OPERATING MODEL (COM v1.md` | Revenue engines, lifecycle, §6 commercial risk areas |
| **Commercial Risk Flags Spec** | `UBUNTU GROWTHOS COMMERCIAL RISK FLAGS SPEC v1.md` | COM §6 → FR-DEAL-16..19, FR-EXEC-14..15 implementation spec |
| **Functional Spec Blueprint** | `UBUNTU GROWTHOS FUNCTIONAL SPECIFICATION BLUEPRINT (FSB v1.md` | Module architecture |
| **Source Documents Index** | `UBUNTU GROWTHOS SOURCE DOCUMENTS INDEX.md` | 4 PDFs as source of truth; Knowledge Vault seed spec |
| **Source PDF — B2G Deck** | ` B2G Master Presentation  2.pdf` | B2G sovereign tokenization (29 pp) |
| **Source PDF — Pitch Deck** | `Generic Pitch Deck - March 2026.pdf` | Institutional/partner pitch (29 pp) |
| **Source PDF — Whitepaper** | `Mansa Musa (Ubuntu Tribe)Whitepaper_2026.pdf` | Product, tokenomics, compliance (28 pp) |
| **Source PDF — Contract** | `CHIMEZIE CHUTA CONTRAT  - Copy – Copie.pdf` | Role definition & Exhibit A (8 pp, restricted) |
| **ERM v1.0** | `UBUNTU GROWTHOS DATA ARCHITECTURE & ERM v1.0.md` | Data model and entities |

---

# **21. REVISION HISTORY**

| Version | Date | Author | Changes |
| --- | --- | --- | --- |
| 1.0 | 2026-06-20 | Chimezie Chuta | Initial PRD based on ERM v1.0 and discovery decisions |
| 1.1 | 2026-06-20 | Chimezie Chuta | Added website (utribe.one), logo (`download.svg`), brand tokens, FR-BRD requirements, Appendix C |
| 1.2 | 2026-06-20 | Chimezie Chuta | Build status legend; 🟢 **Good** / 🟡 **Partial** / ⬜ **Remaining** markers on weeks, modules, launch checklist |
| 1.2 | 2026-06-20 | Chimezie Chuta | Source PDFs as Knowledge Vault seeds; build context; FR-KNW-08–11; Source Documents Index |
| 1.3 | 2026-06-20 | Chimezie Chuta | **Week 8 pivot:** M11 Regulatory Affairs (REG) + M12 Strategic Influence Graph (SIG); §5.3 data model; FR-REG-01–14, FR-SIG-01–14; CAP deferred post-launch; Week 8 launch blocked on REG + SIG |
| 1.4 | 2026-06-22 | Chimezie Chuta | **COM §6 commercial risk flags:** `UBUNTU GROWTHOS COMMERCIAL RISK FLAGS SPEC v1.md`; FR-DEAL-16..19 (deal flags, severity, suggestions, pipeline filter); FR-EXEC-14..15 (dashboard widget) |

---

*This PRD is the authoritative product specification for Ubuntu GrowthOS Phase 1. All implementation work should trace back to FR IDs defined herein and entities defined in ERM v1.0.*
