-- Approval-required onboarding + activate specialist roles (Legal/Marketing/Operations)
--
-- 1. New signups land inactive and must be approved by an admin.
-- 2. Specialist roles become first-class contributors:
--      - read visibility across all records (like executives)
--      - write access on collaborative records (activities, tasks, notes,
--        documents, document versions, partnership milestones/members) and,
--        for Marketing/Operations, events.
--    Pipeline ownership (creating deals / organizations / partnerships /
--    tokenization projects) stays with Commercial/Admin.

-- ---------------------------------------------------------------------------
-- 1. Approval-required onboarding gate
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'COMMERCIAL'::public.user_role,
    false
  );
  RETURN NEW;
END;
$$;
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- ---------------------------------------------------------------------------
-- 2. Role helpers
-- ---------------------------------------------------------------------------
-- Read visibility: specialists + executives + admins see everything;
-- commercial users see their own records plus their direct reports'.
CREATE OR REPLACE FUNCTION can_view_owned(owner uuid)
RETURNS boolean AS $$
  SELECT
    get_user_role() IN ('EXECUTIVE', 'ADMIN', 'LEGAL', 'MARKETING', 'OPERATIONS')
    OR owner = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = owner AND p.reports_to_id = auth.uid()
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Contributors can create/edit working records (everyone except read-only execs).
CREATE OR REPLACE FUNCTION is_contributor()
RETURNS boolean AS $$
  SELECT get_user_role() IN ('ADMIN', 'COMMERCIAL', 'LEGAL', 'MARKETING', 'OPERATIONS');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---------------------------------------------------------------------------
-- 3. Collaborative writes — activities / tasks / notes (deal + partnership)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS activities_insert ON activities;
CREATE POLICY activities_insert ON activities FOR INSERT TO authenticated
  WITH CHECK (
    (is_contributor() OR get_user_role() = 'EXECUTIVE')
    AND logged_by_id = auth.uid()
  );

DROP POLICY IF EXISTS activities_insert_partnership ON activities;
CREATE POLICY activities_insert_partnership ON activities FOR INSERT TO authenticated
  WITH CHECK (
    (is_contributor() OR get_user_role() = 'EXECUTIVE')
    AND logged_by_id = auth.uid()
    AND partnership_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = partnership_id AND can_view_owned(p.owner_id)
    )
  );

DROP POLICY IF EXISTS tasks_insert ON tasks;
CREATE POLICY tasks_insert ON tasks FOR INSERT TO authenticated
  WITH CHECK (
    (is_contributor() OR get_user_role() = 'EXECUTIVE')
    AND EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = deal_id AND can_view_owned(d.owner_id)
    )
  );

DROP POLICY IF EXISTS tasks_update ON tasks;
CREATE POLICY tasks_update ON tasks FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = tasks.deal_id AND can_view_owned(d.owner_id)
    )
  );

DROP POLICY IF EXISTS tasks_insert_partnership ON tasks;
CREATE POLICY tasks_insert_partnership ON tasks FOR INSERT TO authenticated
  WITH CHECK (
    (is_contributor() OR get_user_role() = 'EXECUTIVE')
    AND partnership_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = partnership_id AND can_view_owned(p.owner_id)
    )
  );

DROP POLICY IF EXISTS tasks_update_partnership ON tasks;
CREATE POLICY tasks_update_partnership ON tasks FOR UPDATE TO authenticated
  USING (
    tasks.partnership_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = tasks.partnership_id AND can_view_owned(p.owner_id)
    )
  );

DROP POLICY IF EXISTS notes_insert ON notes;
CREATE POLICY notes_insert ON notes FOR INSERT TO authenticated
  WITH CHECK (
    (is_contributor() OR get_user_role() = 'EXECUTIVE')
    AND author_id = auth.uid()
    AND entity_type = 'deal'
    AND EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = entity_id::uuid AND can_view_owned(d.owner_id)
    )
  );

DROP POLICY IF EXISTS notes_insert_partnership ON notes;
CREATE POLICY notes_insert_partnership ON notes FOR INSERT TO authenticated
  WITH CHECK (
    (is_contributor() OR get_user_role() = 'EXECUTIVE')
    AND author_id = auth.uid()
    AND entity_type = 'partnership'
    AND EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = entity_id::uuid AND can_view_owned(p.owner_id)
    )
  );

-- ---------------------------------------------------------------------------
-- 4. Partnership milestones + members + document versions writes
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS pm_milestone_insert ON partnership_milestones;
CREATE POLICY pm_milestone_insert ON partnership_milestones FOR INSERT TO authenticated
  WITH CHECK (
    is_contributor() AND EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = partnership_id AND can_view_owned(p.owner_id)
    )
  );

DROP POLICY IF EXISTS pm_milestone_update ON partnership_milestones;
CREATE POLICY pm_milestone_update ON partnership_milestones FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = partnership_milestones.partnership_id AND can_view_owned(p.owner_id)
    )
  );

DROP POLICY IF EXISTS pm_milestone_delete ON partnership_milestones;
CREATE POLICY pm_milestone_delete ON partnership_milestones FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = partnership_milestones.partnership_id AND can_view_owned(p.owner_id)
    )
  );

DROP POLICY IF EXISTS pm_insert ON partnership_members;
CREATE POLICY pm_insert ON partnership_members FOR INSERT TO authenticated
  WITH CHECK (
    is_contributor() AND EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = partnership_id AND can_view_owned(p.owner_id)
    )
  );

DROP POLICY IF EXISTS pm_delete ON partnership_members;
CREATE POLICY pm_delete ON partnership_members FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = partnership_members.partnership_id AND can_view_owned(p.owner_id)
    )
  );

DROP POLICY IF EXISTS doc_version_insert ON document_versions;
CREATE POLICY doc_version_insert ON document_versions FOR INSERT TO authenticated
  WITH CHECK (
    is_contributor() AND EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_id AND can_view_owned(d.owner_id)
    )
  );

-- ---------------------------------------------------------------------------
-- 5. Documents: specialists can create and edit
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS documents_insert ON documents;
CREATE POLICY documents_insert ON documents FOR INSERT TO authenticated
  WITH CHECK (is_contributor() AND owner_id = auth.uid());

DROP POLICY IF EXISTS documents_update ON documents;
CREATE POLICY documents_update ON documents FOR UPDATE TO authenticated
  USING (is_contributor() AND can_view_owned(owner_id));

DROP POLICY IF EXISTS documents_delete ON documents;
CREATE POLICY documents_delete ON documents FOR DELETE TO authenticated
  USING (get_user_role() = 'ADMIN' OR owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 6. Events: Marketing/Operations are first-class; broaden read to specialists
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS events_select ON events;
CREATE POLICY events_select ON events FOR SELECT TO authenticated
  USING (can_view_owned(owner_id));

DROP POLICY IF EXISTS events_insert ON events;
CREATE POLICY events_insert ON events FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('COMMERCIAL', 'ADMIN', 'MARKETING', 'OPERATIONS')
    AND owner_id = auth.uid()
  );

DROP POLICY IF EXISTS events_update ON events;
CREATE POLICY events_update ON events FOR UPDATE TO authenticated
  USING (
    get_user_role() IN ('ADMIN', 'MARKETING', 'OPERATIONS')
    OR owner_id = auth.uid()
  );

DROP POLICY IF EXISTS events_delete ON events;
CREATE POLICY events_delete ON events FOR DELETE TO authenticated
  USING (
    get_user_role() IN ('ADMIN', 'MARKETING', 'OPERATIONS')
    OR owner_id = auth.uid()
  );

DROP POLICY IF EXISTS event_participants_select ON event_participants;
CREATE POLICY event_participants_select ON event_participants FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_participants.event_id AND can_view_owned(e.owner_id)
    )
  );

DROP POLICY IF EXISTS event_participants_insert ON event_participants;
CREATE POLICY event_participants_insert ON event_participants FOR INSERT TO authenticated
  WITH CHECK (
    is_contributor() AND EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_id AND can_view_owned(e.owner_id)
    )
  );

DROP POLICY IF EXISTS event_participants_delete ON event_participants;
CREATE POLICY event_participants_delete ON event_participants FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_participants.event_id AND can_view_owned(e.owner_id)
    )
  );

DROP POLICY IF EXISTS event_leads_select ON event_leads;
CREATE POLICY event_leads_select ON event_leads FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_leads.event_id AND can_view_owned(e.owner_id)
    )
  );

DROP POLICY IF EXISTS event_leads_insert ON event_leads;
CREATE POLICY event_leads_insert ON event_leads FOR INSERT TO authenticated
  WITH CHECK (
    is_contributor() AND EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_id AND can_view_owned(e.owner_id)
    )
  );

DROP POLICY IF EXISTS event_leads_update ON event_leads;
CREATE POLICY event_leads_update ON event_leads FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_leads.event_id AND can_view_owned(e.owner_id)
    )
  );

DROP POLICY IF EXISTS event_leads_delete ON event_leads;
CREATE POLICY event_leads_delete ON event_leads FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_leads.event_id AND can_view_owned(e.owner_id)
    )
  );

-- ---------------------------------------------------------------------------
-- 7. Read parity for tokenization tree (specialists can view, writes unchanged)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS tokenization_select ON tokenization_projects;
CREATE POLICY tokenization_select ON tokenization_projects FOR SELECT TO authenticated
  USING (can_view_owned(owner_id));

DROP POLICY IF EXISTS resource_assets_select ON resource_assets;
CREATE POLICY resource_assets_select ON resource_assets FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tokenization_projects tp
      WHERE tp.id = resource_assets.tokenization_project_id AND can_view_owned(tp.owner_id)
    )
  );

DROP POLICY IF EXISTS phase_history_select ON project_phase_history;
CREATE POLICY phase_history_select ON project_phase_history FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tokenization_projects tp
      WHERE tp.id = project_phase_history.tokenization_project_id AND can_view_owned(tp.owner_id)
    )
  );
