-- Week 7: B2C campaign metrics + executive read-only RLS fixes

CREATE TABLE IF NOT EXISTS b2c_campaign_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  campaign_name TEXT NOT NULL DEFAULT 'B2C GIFT Adoption',
  new_users INTEGER,
  wallet_downloads INTEGER,
  gift_purchases_usd NUMERIC(15, 2),
  notes TEXT,
  updated_by_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (period_start, period_end)
);

ALTER TABLE b2c_campaign_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY b2c_select ON b2c_campaign_metrics FOR SELECT TO authenticated USING (true);

CREATE POLICY b2c_insert ON b2c_campaign_metrics FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('COMMERCIAL', 'ADMIN'));

CREATE POLICY b2c_update ON b2c_campaign_metrics FOR UPDATE TO authenticated
  USING (get_user_role() IN ('COMMERCIAL', 'ADMIN'));

-- Executive read-only: remove write access on core commercial entities
DROP POLICY IF EXISTS deals_update ON deals;
CREATE POLICY deals_update ON deals FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

DROP POLICY IF EXISTS organizations_update ON organizations;
CREATE POLICY organizations_update ON organizations FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

DROP POLICY IF EXISTS events_update ON events;
CREATE POLICY events_update ON events FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

DROP POLICY IF EXISTS events_delete ON events;
CREATE POLICY events_delete ON events FOR DELETE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

DROP POLICY IF EXISTS tokenization_update ON tokenization_projects;
CREATE POLICY tokenization_update ON tokenization_projects FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

DROP POLICY IF EXISTS tokenization_delete ON tokenization_projects;
CREATE POLICY tokenization_delete ON tokenization_projects FOR DELETE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

DROP POLICY IF EXISTS documents_update ON documents;
CREATE POLICY documents_update ON documents FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

DROP POLICY IF EXISTS documents_delete ON documents;
CREATE POLICY documents_delete ON documents FOR DELETE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

DROP POLICY IF EXISTS partnerships_update ON partnerships;
CREATE POLICY partnerships_update ON partnerships FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

DROP POLICY IF EXISTS partnerships_delete ON partnerships;
CREATE POLICY partnerships_delete ON partnerships FOR DELETE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));
