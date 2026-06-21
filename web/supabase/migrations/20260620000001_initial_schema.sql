-- Ubuntu GrowthOS — Initial Schema (ERM v1.0)
-- Run in Supabase SQL Editor or via CLI

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role AS ENUM ('EXECUTIVE', 'COMMERCIAL', 'LEGAL', 'MARKETING', 'OPERATIONS', 'ADMIN');
CREATE TYPE customer_segment AS ENUM ('B2G', 'B2B', 'B2C', 'INSTITUTIONAL', 'ECOSYSTEM');
CREATE TYPE revenue_engine AS ENUM ('GIFT_ADOPTION', 'TOKENIZATION_TaaS', 'CAPITAL_FORMATION', 'STRATEGIC_PARTNERSHIP', 'FINANCIAL_INFRASTRUCTURE');
CREATE TYPE deal_stage AS ENUM (
  'LEAD', 'QUALIFIED', 'DISCOVERY', 'STAKEHOLDER_MAPPING', 'NDA', 'PROPOSAL', 'MOU',
  'NEGOTIATION', 'CONTRACT', 'WON', 'IMPLEMENTATION', 'REVENUE_REALIZATION', 'EXPANSION', 'LOST', 'ON_HOLD'
);
CREATE TYPE organization_type AS ENUM ('GOVERNMENT', 'INSTITUTIONAL', 'PARTNER', 'INVESTOR', 'OTHER');
CREATE TYPE organization_status AS ENUM ('PROSPECT', 'ACTIVE', 'DORMANT', 'CHURNED');
CREATE TYPE organization_tier AS ENUM ('STRATEGIC', 'TIER_1', 'TIER_2', 'TIER_3');
CREATE TYPE product_code AS ENUM ('GIFT', 'UTRIBE_WALLET', 'UBUNTUVERSE', 'UBUNTU_CAPITAL');
CREATE TYPE document_type AS ENUM ('NDA', 'MOU', 'PROPOSAL', 'GOVERNMENT_BRIEF', 'PARTNERSHIP_AGREEMENT', 'INVESTOR_DECK', 'CONTRACT', 'SOW', 'OTHER');
CREATE TYPE document_status AS ENUM ('DRAFT', 'IN_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'SIGNED', 'EXECUTED', 'EXPIRED', 'TERMINATED');
CREATE TYPE event_type AS ENUM ('CONFERENCE', 'ROUNDTABLE', 'EXECUTIVE_MEETING', 'GOVERNMENT_BRIEFING', 'WORKSHOP', 'WEBINAR', 'INTERNAL', 'OTHER');
CREATE TYPE tokenization_asset_type AS ENUM ('GOLD', 'SILVER', 'LITHIUM', 'COPPER', 'RARE_EARTH', 'REAL_ESTATE', 'INFRASTRUCTURE', 'CARBON', 'COMMUNITY_DEVELOPMENT', 'OTHER');
CREATE TYPE b2g_project_phase AS ENUM ('RESOURCE_DISCOVERY', 'RESOURCE_VALUATION', 'DIGITAL_ASSET_STRUCTURING', 'CAPITAL_FORMATION', 'DEVELOPMENT_DEPLOYMENT');
CREATE TYPE partnership_type AS ENUM ('DISTRIBUTION', 'STRATEGIC_ALLIANCE', 'JOINT_VENTURE', 'TECHNOLOGY', 'LISTING', 'CUSTODY', 'REVENUE_SHARE', 'REFERRAL', 'OTHER');
CREATE TYPE knowledge_asset_type AS ENUM ('WHITEPAPER', 'PITCH_DECK', 'SOP', 'LEGAL_TEMPLATE', 'MARKET_RESEARCH', 'REGULATORY_BRIEF', 'PLAYBOOK', 'OTHER');

-- =============================================================================
-- PROFILES (extends auth.users)
-- =============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'COMMERCIAL',
  title TEXT,
  department TEXT,
  reports_to_id UUID REFERENCES profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- PLATFORM
-- =============================================================================

CREATE TABLE territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT,
  country_code CHAR(2),
  priority TEXT CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code product_code NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  revenue_engine revenue_engine NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- CORE CRM
-- =============================================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  legal_name TEXT,
  organization_type organization_type NOT NULL,
  segment customer_segment NOT NULL,
  website TEXT,
  headquarters_country CHAR(2),
  headquarters_city TEXT,
  territory_id UUID REFERENCES territories(id),
  owner_id UUID NOT NULL REFERENCES profiles(id),
  status organization_status NOT NULL DEFAULT 'PROSPECT',
  tier organization_tier,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE government_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  government_level TEXT NOT NULL CHECK (government_level IN ('NATIONAL', 'STATE', 'REGIONAL', 'LOCAL', 'SOVEREIGN_INSTITUTION', 'TRADITIONAL_KINGDOM')),
  entity_subtype TEXT CHECK (entity_subtype IN ('MINISTRY', 'AGENCY', 'REGULATORY_BODY', 'DEVELOPMENT_AUTHORITY', 'SOVEREIGN_WEALTH_FUND')),
  jurisdiction TEXT,
  parent_government_id UUID REFERENCES organizations(id),
  resource_endowment TEXT,
  engagement_priority TEXT CHECK (engagement_priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  regulatory_environment_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE account_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  account_subtype TEXT NOT NULL,
  aum_range TEXT,
  treasury_interest_level TEXT CHECK (treasury_interest_level IN ('NONE', 'EXPLORING', 'ACTIVE', 'COMMITTED')),
  gift_adoption_status TEXT CHECK (gift_adoption_status IN ('NONE', 'EVALUATING', 'PILOT', 'LIVE')),
  wallet_integration_status TEXT CHECK (wallet_integration_status IN ('NONE', 'IN_PROGRESS', 'LIVE')),
  annual_revenue_potential NUMERIC(15, 2),
  decision_cycle_months INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE partner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  partner_subtype TEXT,
  partnership_type partnership_type,
  distribution_reach TEXT,
  strategic_value_score INTEGER CHECK (strategic_value_score BETWEEN 1 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE investor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  investor_type TEXT NOT NULL,
  investment_thesis TEXT,
  typical_check_size_min NUMERIC(15, 2),
  typical_check_size_max NUMERIC(15, 2),
  preferred_asset_classes TEXT[],
  relationship_warmth TEXT CHECK (relationship_warmth IN ('COLD', 'WARM', 'HOT', 'LP')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT,
  department TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  contact_role TEXT CHECK (contact_role IN ('DECISION_MAKER', 'INFLUENCER', 'CHAMPION', 'GATEKEEPER', 'LEGAL', 'TECHNICAL', 'OTHER')),
  influence_level TEXT CHECK (influence_level IN ('HIGH', 'MEDIUM', 'LOW')),
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE stakeholder_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  relationship_to_ubuntu TEXT CHECK (relationship_to_ubuntu IN ('CHAMPION', 'SUPPORTER', 'NEUTRAL', 'SKEPTIC', 'BLOCKER')),
  relationship_to_decision TEXT,
  reports_to_contact_id UUID REFERENCES contacts(id),
  engagement_score INTEGER CHECK (engagement_score BETWEEN 1 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- PIPELINE
-- =============================================================================

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  owner_id UUID NOT NULL REFERENCES profiles(id),
  segment customer_segment NOT NULL,
  revenue_engine revenue_engine NOT NULL,
  product_id UUID REFERENCES products(id),
  stage deal_stage NOT NULL DEFAULT 'LEAD',
  probability NUMERIC(5, 2) DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  estimated_value NUMERIC(15, 2),
  currency TEXT NOT NULL DEFAULT 'USD',
  expected_close_date DATE,
  actual_close_date DATE,
  source TEXT CHECK (source IN ('INBOUND', 'OUTBOUND', 'EVENT', 'REFERRAL', 'PARTNER', 'GOVERNMENT', 'OTHER')),
  source_event_id UUID,
  source_partner_id UUID REFERENCES organizations(id),
  tokenization_project_id UUID,
  capital_raise_id UUID,
  partnership_id UUID,
  priority TEXT CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  loss_reason TEXT,
  next_step TEXT,
  next_step_date DATE,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE deal_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  from_stage deal_stage,
  to_stage deal_stage NOT NULL,
  changed_by_id UUID NOT NULL REFERENCES profiles(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type TEXT NOT NULL CHECK (activity_type IN ('CALL', 'MEETING', 'EMAIL', 'SITE_VISIT', 'DEMO', 'PRESENTATION', 'OTHER')),
  subject TEXT NOT NULL,
  description TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  organization_id UUID REFERENCES organizations(id),
  deal_id UUID REFERENCES deals(id),
  event_id UUID,
  logged_by_id UUID NOT NULL REFERENCES profiles(id),
  outcome TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID NOT NULL REFERENCES profiles(id),
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  priority TEXT CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  deal_id UUID REFERENCES deals(id),
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_type TEXT NOT NULL CHECK (period_type IN ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  segment customer_segment,
  revenue_engine revenue_engine,
  forecast_amount NUMERIC(15, 2) NOT NULL,
  commit_amount NUMERIC(15, 2),
  best_case_amount NUMERIC(15, 2),
  submitted_by_id UUID NOT NULL REFERENCES profiles(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- PARTNERSHIPS
-- =============================================================================

CREATE TABLE partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  partnership_type partnership_type NOT NULL,
  status TEXT NOT NULL DEFAULT 'DISCUSSION' CHECK (status IN ('DISCUSSION', 'MOU', 'ACTIVE', 'PAUSED', 'TERMINATED')),
  primary_partner_id UUID NOT NULL REFERENCES organizations(id),
  owner_id UUID NOT NULL REFERENCES profiles(id),
  start_date DATE,
  end_date DATE,
  revenue_share_terms TEXT,
  strategic_objectives TEXT,
  deal_id UUID REFERENCES deals(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE partnership_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES partnerships(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  role_in_partnership TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- DOCUMENTS (Phase 1 schema, UI Week 5)
-- =============================================================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  document_type document_type NOT NULL,
  status document_status NOT NULL DEFAULT 'DRAFT',
  organization_id UUID REFERENCES organizations(id),
  deal_id UUID REFERENCES deals(id),
  partnership_id UUID REFERENCES partnerships(id),
  current_version_id UUID,
  owner_id UUID NOT NULL REFERENCES profiles(id),
  effective_date DATE,
  expiration_date DATE,
  signed_date DATE,
  external_storage_url TEXT,
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  storage_url TEXT NOT NULL,
  file_hash TEXT,
  change_summary TEXT,
  created_by_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(document_id, version_number)
);

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL UNIQUE REFERENCES documents(id) ON DELETE CASCADE,
  contract_number TEXT NOT NULL,
  contract_value NUMERIC(15, 2),
  payment_terms TEXT,
  renewal_date DATE,
  auto_renew BOOLEAN DEFAULT false,
  termination_clause_summary TEXT,
  governing_law TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- EVENTS
-- =============================================================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  event_type event_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  location TEXT,
  country_code CHAR(2),
  territory_id UUID REFERENCES territories(id),
  description TEXT,
  budget NUMERIC(15, 2),
  actual_cost NUMERIC(15, 2),
  ubuntu_role TEXT CHECK (ubuntu_role IN ('SPEAKER', 'SPONSOR', 'EXHIBITOR', 'ATTENDEE', 'HOST')),
  owner_id UUID NOT NULL REFERENCES profiles(id),
  roi_notes TEXT,
  google_event_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  participant_type TEXT NOT NULL CHECK (participant_type IN ('UBUNTU_USER', 'CONTACT', 'ORGANIZATION')),
  user_id UUID REFERENCES profiles(id),
  contact_id UUID REFERENCES contacts(id),
  organization_id UUID REFERENCES organizations(id),
  role_at_event TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE event_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  organization_id UUID REFERENCES organizations(id),
  deal_id UUID REFERENCES deals(id),
  lead_quality TEXT CHECK (lead_quality IN ('HOT', 'WARM', 'COLD')),
  follow_up_status TEXT DEFAULT 'PENDING' CHECK (follow_up_status IN ('PENDING', 'CONTACTED', 'CONVERTED', 'DISCARDED')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- TOKENIZATION
-- =============================================================================

CREATE TABLE tokenization_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  government_profile_id UUID REFERENCES government_profiles(id),
  asset_type tokenization_asset_type NOT NULL,
  current_phase b2g_project_phase NOT NULL DEFAULT 'RESOURCE_DISCOVERY',
  estimated_asset_value NUMERIC(15, 2),
  tokenization_readiness_score INTEGER CHECK (tokenization_readiness_score BETWEEN 1 AND 100),
  opportunity_score INTEGER CHECK (opportunity_score BETWEEN 1 AND 100),
  jurisdiction TEXT,
  status TEXT NOT NULL DEFAULT 'PROSPECT' CHECK (status IN ('PROSPECT', 'ACTIVE', 'STRUCTURING', 'LIVE', 'PAUSED', 'COMPLETED')),
  owner_id UUID NOT NULL REFERENCES profiles(id),
  description TEXT,
  deal_id UUID REFERENCES deals(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE resource_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tokenization_project_id UUID NOT NULL REFERENCES tokenization_projects(id) ON DELETE CASCADE,
  asset_name TEXT NOT NULL,
  asset_type tokenization_asset_type NOT NULL,
  estimated_reserves TEXT,
  valuation_amount NUMERIC(15, 2),
  valuation_date DATE,
  valuation_source TEXT,
  location TEXT,
  discovery_status TEXT CHECK (discovery_status IN ('IDENTIFIED', 'MAPPED', 'ASSESSED', 'VERIFIED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE project_phase_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tokenization_project_id UUID NOT NULL REFERENCES tokenization_projects(id) ON DELETE CASCADE,
  phase b2g_project_phase NOT NULL,
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  outcome_summary TEXT
);

-- =============================================================================
-- KNOWLEDGE VAULT
-- =============================================================================

CREATE TABLE knowledge_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE knowledge_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  asset_type knowledge_asset_type NOT NULL,
  storage_url TEXT NOT NULL,
  summary TEXT,
  segment customer_segment,
  product_id UUID REFERENCES products(id),
  territory_id UUID REFERENCES territories(id),
  version TEXT,
  author_id UUID REFERENCES profiles(id),
  is_template BOOLEAN DEFAULT false,
  is_restricted BOOLEAN DEFAULT false,
  source_filename TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE knowledge_asset_tags (
  knowledge_asset_id UUID NOT NULL REFERENCES knowledge_assets(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES knowledge_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (knowledge_asset_id, tag_id)
);

-- =============================================================================
-- DEFERRED FKs (circular refs)
-- =============================================================================

ALTER TABLE stakeholder_maps ADD CONSTRAINT stakeholder_maps_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE;
ALTER TABLE deals ADD CONSTRAINT deals_tokenization_project_id_fkey FOREIGN KEY (tokenization_project_id) REFERENCES tokenization_projects(id);
ALTER TABLE deals ADD CONSTRAINT deals_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES partnerships(id);
ALTER TABLE deals ADD CONSTRAINT deals_source_event_id_fkey FOREIGN KEY (source_event_id) REFERENCES events(id);
ALTER TABLE activities ADD CONSTRAINT activities_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_deals_org ON deals(organization_id);
CREATE INDEX idx_organizations_segment ON organizations(segment);
CREATE INDEX idx_organizations_owner ON organizations(owner_id);
CREATE INDEX idx_contacts_org ON contacts(organization_id);
CREATE INDEX idx_activities_deal ON activities(deal_id, occurred_at DESC);
CREATE INDEX idx_events_start ON events(start_date);
CREATE INDEX idx_knowledge_assets_type ON knowledge_assets(asset_type);

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'COMMERCIAL'::public.user_role
  );
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
    GRANT ALL ON public.profiles TO supabase_auth_admin;
    GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
  END IF;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_assets ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: read own; executives/admins read all
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (id = auth.uid() OR get_user_role() IN ('EXECUTIVE', 'ADMIN'));
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (id = auth.uid() OR get_user_role() = 'ADMIN');
CREATE POLICY profiles_insert_signup ON profiles FOR INSERT WITH CHECK (true);

-- Reference data: all authenticated users can read
CREATE POLICY territories_select ON territories FOR SELECT TO authenticated USING (true);
CREATE POLICY products_select ON products FOR SELECT TO authenticated USING (true);

-- Organizations: commercial users see owned; executives see all
CREATE POLICY organizations_select ON organizations FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL AND (
      get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid()
    )
  );
CREATE POLICY organizations_insert ON organizations FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('COMMERCIAL', 'ADMIN') AND owner_id = auth.uid());
CREATE POLICY organizations_update ON organizations FOR UPDATE TO authenticated
  USING (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid());

-- Deals: same pattern
CREATE POLICY deals_select ON deals FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL AND (
      get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid()
    )
  );
CREATE POLICY deals_insert ON deals FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('COMMERCIAL', 'ADMIN') AND owner_id = auth.uid());
CREATE POLICY deals_update ON deals FOR UPDATE TO authenticated
  USING (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid());

-- Knowledge: restricted assets admin only
CREATE POLICY knowledge_select ON knowledge_assets FOR SELECT TO authenticated
  USING (
    is_restricted = false OR get_user_role() = 'ADMIN'
  );
CREATE POLICY knowledge_insert ON knowledge_assets FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('COMMERCIAL', 'ADMIN', 'EXECUTIVE'));
