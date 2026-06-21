-- Week 6: RLS for events and tokenization

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokenization_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_phase_history ENABLE ROW LEVEL SECURITY;

-- Google Calendar OAuth tokens (per user)
CREATE TABLE IF NOT EXISTS user_integrations (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  google_refresh_token TEXT,
  google_calendar_connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_integrations_own ON user_integrations FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Events
CREATE POLICY events_select ON events FOR SELECT TO authenticated
  USING (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid());

CREATE POLICY events_insert ON events FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('COMMERCIAL', 'ADMIN') AND owner_id = auth.uid());

CREATE POLICY events_update ON events FOR UPDATE TO authenticated
  USING (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid());

CREATE POLICY events_delete ON events FOR DELETE TO authenticated
  USING (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid());

-- Event participants
CREATE POLICY event_participants_select ON event_participants FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_participants.event_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR e.owner_id = auth.uid())
    )
  );

CREATE POLICY event_participants_insert ON event_participants FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR e.owner_id = auth.uid())
    )
  );

CREATE POLICY event_participants_delete ON event_participants FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_participants.event_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR e.owner_id = auth.uid())
    )
  );

-- Event leads
CREATE POLICY event_leads_select ON event_leads FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_leads.event_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR e.owner_id = auth.uid())
    )
  );

CREATE POLICY event_leads_insert ON event_leads FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_id
        AND (get_user_role() IN ('COMMERCIAL', 'ADMIN') OR e.owner_id = auth.uid())
    )
  );

CREATE POLICY event_leads_update ON event_leads FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_leads.event_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR e.owner_id = auth.uid())
    )
  );

CREATE POLICY event_leads_delete ON event_leads FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_leads.event_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR e.owner_id = auth.uid())
    )
  );

-- Tokenization projects
CREATE POLICY tokenization_select ON tokenization_projects FOR SELECT TO authenticated
  USING (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid());

CREATE POLICY tokenization_insert ON tokenization_projects FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('COMMERCIAL', 'ADMIN') AND owner_id = auth.uid());

CREATE POLICY tokenization_update ON tokenization_projects FOR UPDATE TO authenticated
  USING (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid());

CREATE POLICY tokenization_delete ON tokenization_projects FOR DELETE TO authenticated
  USING (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid());

-- Resource assets
CREATE POLICY resource_assets_select ON resource_assets FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tokenization_projects tp
      WHERE tp.id = resource_assets.tokenization_project_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR tp.owner_id = auth.uid())
    )
  );

CREATE POLICY resource_assets_insert ON resource_assets FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tokenization_projects tp
      WHERE tp.id = tokenization_project_id
        AND (get_user_role() IN ('COMMERCIAL', 'ADMIN') OR tp.owner_id = auth.uid())
    )
  );

CREATE POLICY resource_assets_update ON resource_assets FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tokenization_projects tp
      WHERE tp.id = resource_assets.tokenization_project_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR tp.owner_id = auth.uid())
    )
  );

CREATE POLICY resource_assets_delete ON resource_assets FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tokenization_projects tp
      WHERE tp.id = resource_assets.tokenization_project_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR tp.owner_id = auth.uid())
    )
  );

-- Phase history
CREATE POLICY phase_history_select ON project_phase_history FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tokenization_projects tp
      WHERE tp.id = project_phase_history.tokenization_project_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR tp.owner_id = auth.uid())
    )
  );

CREATE POLICY phase_history_insert ON project_phase_history FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tokenization_projects tp
      WHERE tp.id = tokenization_project_id
        AND (get_user_role() IN ('COMMERCIAL', 'ADMIN') OR tp.owner_id = auth.uid())
    )
  );
