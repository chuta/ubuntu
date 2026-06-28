-- Team governance: manager visibility (reports_to), profile directory, is_active support
--
-- Adds a central visibility helper so a manager can READ records owned by their
-- direct reports (in addition to EXECUTIVE/ADMIN see-all and owner-self). Writes
-- remain owner/admin only. Also opens the profiles table as an internal team
-- directory so assignee pickers and team management work.

-- ---------------------------------------------------------------------------
-- Central read-visibility helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION can_view_owned(owner uuid)
RETURNS boolean AS $$
  SELECT
    get_user_role() IN ('EXECUTIVE', 'ADMIN')
    OR owner = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = owner AND p.reports_to_id = auth.uid()
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---------------------------------------------------------------------------
-- Profiles: internal team directory (read), self/admin write
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS profiles_select_own ON profiles;
CREATE POLICY profiles_select_all ON profiles FOR SELECT TO authenticated USING (true);
-- profiles_update_own (own or ADMIN) and profiles_insert_signup remain unchanged.

-- ---------------------------------------------------------------------------
-- Core tables: SELECT now uses can_view_owned (adds manager visibility)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS organizations_select ON organizations;
CREATE POLICY organizations_select ON organizations FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL AND (
      can_view_owned(owner_id)
      OR (metadata->>'regulator_code') IS NOT NULL
    )
  );

DROP POLICY IF EXISTS deals_select ON deals;
CREATE POLICY deals_select ON deals FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND can_view_owned(owner_id));

DROP POLICY IF EXISTS partnerships_select ON partnerships;
CREATE POLICY partnerships_select ON partnerships FOR SELECT TO authenticated
  USING (can_view_owned(owner_id));

DROP POLICY IF EXISTS documents_select ON documents;
CREATE POLICY documents_select ON documents FOR SELECT TO authenticated
  USING (can_view_owned(owner_id));

-- ---------------------------------------------------------------------------
-- Child tables: inherit visibility through their parent owner
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS contacts_select ON contacts;
CREATE POLICY contacts_select ON contacts FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = contacts.organization_id
        AND o.deleted_at IS NULL
        AND can_view_owned(o.owner_id)
    )
  );

DROP POLICY IF EXISTS dsh_select ON deal_stage_history;
CREATE POLICY dsh_select ON deal_stage_history FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = deal_stage_history.deal_id
        AND d.deleted_at IS NULL
        AND can_view_owned(d.owner_id)
    )
  );

DROP POLICY IF EXISTS activities_select ON activities;
CREATE POLICY activities_select ON activities FOR SELECT TO authenticated
  USING (
    (activities.deal_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = activities.deal_id
        AND d.deleted_at IS NULL
        AND can_view_owned(d.owner_id)
    ))
    OR (activities.organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = activities.organization_id
        AND o.deleted_at IS NULL
        AND can_view_owned(o.owner_id)
    ))
  );

DROP POLICY IF EXISTS activities_select_partnership ON activities;
CREATE POLICY activities_select_partnership ON activities FOR SELECT TO authenticated
  USING (
    activities.partnership_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = activities.partnership_id
        AND can_view_owned(p.owner_id)
    )
  );

DROP POLICY IF EXISTS tasks_select ON tasks;
CREATE POLICY tasks_select ON tasks FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = tasks.deal_id
        AND d.deleted_at IS NULL
        AND can_view_owned(d.owner_id)
    )
  );

DROP POLICY IF EXISTS tasks_select_partnership ON tasks;
CREATE POLICY tasks_select_partnership ON tasks FOR SELECT TO authenticated
  USING (
    tasks.partnership_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = tasks.partnership_id
        AND can_view_owned(p.owner_id)
    )
  );

DROP POLICY IF EXISTS notes_select ON notes;
CREATE POLICY notes_select ON notes FOR SELECT TO authenticated
  USING (
    notes.entity_type = 'deal' AND EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = notes.entity_id::uuid
        AND d.deleted_at IS NULL
        AND can_view_owned(d.owner_id)
    )
  );

DROP POLICY IF EXISTS notes_select_partnership ON notes;
CREATE POLICY notes_select_partnership ON notes FOR SELECT TO authenticated
  USING (
    notes.entity_type = 'partnership' AND EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = notes.entity_id::uuid
        AND can_view_owned(p.owner_id)
    )
  );

DROP POLICY IF EXISTS pm_select ON partnership_members;
CREATE POLICY pm_select ON partnership_members FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = partnership_members.partnership_id
        AND can_view_owned(p.owner_id)
    )
  );

DROP POLICY IF EXISTS pm_milestone_select ON partnership_milestones;
CREATE POLICY pm_milestone_select ON partnership_milestones FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = partnership_milestones.partnership_id
        AND can_view_owned(p.owner_id)
    )
  );

DROP POLICY IF EXISTS doc_version_select ON document_versions;
CREATE POLICY doc_version_select ON document_versions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_versions.document_id
        AND can_view_owned(d.owner_id)
    )
  );
