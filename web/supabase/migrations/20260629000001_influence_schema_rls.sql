-- Week 8: Strategic Influence Graph (SIG) — schema + RLS

CREATE TYPE influence_relationship_type AS ENUM (
  'REPORTS_TO', 'INFLUENCES', 'MENTORS', 'COLLEAGUE', 'ADVISES', 'INTRODUCED_BY', 'OTHER'
);

CREATE TYPE ubuntu_stance AS ENUM (
  'CHAMPION', 'SUPPORTER', 'NEUTRAL', 'SKEPTIC', 'BLOCKER'
);

-- Extend contacts with influence score (tier uses existing influence_level)
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS current_influence_score INTEGER
    CHECK (current_influence_score IS NULL OR current_influence_score BETWEEN 1 AND 100);

-- Career / position history
CREATE TABLE contact_position_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  owner_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Person-to-person influence edges
CREATE TABLE influence_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  target_contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  relationship_type influence_relationship_type NOT NULL,
  strength INTEGER NOT NULL CHECK (strength BETWEEN 1 AND 5),
  relationship_to_ubuntu ubuntu_stance,
  notes TEXT,
  last_verified_at DATE,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id),
  CHECK (source_contact_id <> target_contact_id)
);

CREATE INDEX idx_contact_position_history_contact ON contact_position_history(contact_id);
CREATE INDEX idx_influence_relationships_source ON influence_relationships(source_contact_id);
CREATE INDEX idx_influence_relationships_target ON influence_relationships(target_contact_id);
CREATE INDEX idx_influence_relationships_deal ON influence_relationships(deal_id);
CREATE INDEX idx_influence_relationships_org ON influence_relationships(organization_id);

-- Stakeholder maps (existing table — enable RLS)
ALTER TABLE stakeholder_maps ENABLE ROW LEVEL SECURITY;

-- Position history RLS
ALTER TABLE contact_position_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE influence_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY contact_position_history_select ON contact_position_history FOR SELECT TO authenticated
  USING (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid());

CREATE POLICY contact_position_history_insert ON contact_position_history FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('COMMERCIAL', 'ADMIN') AND owner_id = auth.uid());

CREATE POLICY contact_position_history_update ON contact_position_history FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

CREATE POLICY contact_position_history_delete ON contact_position_history FOR DELETE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

-- Influence relationships RLS
CREATE POLICY influence_relationships_select ON influence_relationships FOR SELECT TO authenticated
  USING (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid());

CREATE POLICY influence_relationships_insert ON influence_relationships FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('COMMERCIAL', 'ADMIN') AND owner_id = auth.uid());

CREATE POLICY influence_relationships_update ON influence_relationships FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

CREATE POLICY influence_relationships_delete ON influence_relationships FOR DELETE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

-- Stakeholder maps RLS (deal or organization scoped)
CREATE POLICY stakeholder_maps_select ON stakeholder_maps FOR SELECT TO authenticated
  USING (
    (deal_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = stakeholder_maps.deal_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR d.owner_id = auth.uid())
    ))
    OR EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = stakeholder_maps.organization_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR o.owner_id = auth.uid())
    )
  );

CREATE POLICY stakeholder_maps_insert ON stakeholder_maps FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('COMMERCIAL', 'ADMIN')
    AND (
      (deal_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM deals d
        WHERE d.id = deal_id
          AND (get_user_role() = 'ADMIN' OR d.owner_id = auth.uid())
      ))
      OR EXISTS (
        SELECT 1 FROM organizations o
        WHERE o.id = organization_id
          AND (get_user_role() = 'ADMIN' OR o.owner_id = auth.uid())
      )
    )
  );

CREATE POLICY stakeholder_maps_update ON stakeholder_maps FOR UPDATE TO authenticated
  USING (
    (deal_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = stakeholder_maps.deal_id
        AND (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR d.owner_id = auth.uid()))
    ))
    OR EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = stakeholder_maps.organization_id
        AND (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR o.owner_id = auth.uid()))
    )
  );

CREATE POLICY stakeholder_maps_delete ON stakeholder_maps FOR DELETE TO authenticated
  USING (
    (deal_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = stakeholder_maps.deal_id
        AND (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR d.owner_id = auth.uid()))
    ))
    OR EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = stakeholder_maps.organization_id
        AND (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR o.owner_id = auth.uid()))
    )
  );
