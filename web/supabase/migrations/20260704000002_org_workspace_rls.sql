-- P1: Organization (account / government) workspace parity.
-- Enables organization-scoped tasks and notes so account & government detail
-- pages get the same activities/tasks/notes panels as deals and partnerships.
--
-- Activities and documents already support organization scoping via existing
-- owner-based policies (activities_select org branch, documents owner policies),
-- so only tasks and notes need new organization-scoped policies here.
--
-- Org-scoped tasks are identified by: deal_id IS NULL AND partnership_id IS NULL
-- AND organization_id IS NOT NULL (so they never overlap deal/partnership tasks
-- which also carry a denormalized organization_id).

-- ---------------------------------------------------------------------------
-- Tasks: organization-scoped
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS tasks_select_org ON tasks;
CREATE POLICY tasks_select_org ON tasks FOR SELECT TO authenticated
  USING (
    tasks.deal_id IS NULL
    AND tasks.partnership_id IS NULL
    AND tasks.organization_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = tasks.organization_id
        AND o.deleted_at IS NULL
        AND can_view_owned(o.owner_id)
    )
  );

DROP POLICY IF EXISTS tasks_insert_org ON tasks;
CREATE POLICY tasks_insert_org ON tasks FOR INSERT TO authenticated
  WITH CHECK (
    (is_contributor() OR get_user_role() = 'EXECUTIVE')
    AND deal_id IS NULL
    AND partnership_id IS NULL
    AND organization_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = organization_id
        AND o.deleted_at IS NULL
        AND can_view_owned(o.owner_id)
    )
  );

DROP POLICY IF EXISTS tasks_update_org ON tasks;
CREATE POLICY tasks_update_org ON tasks FOR UPDATE TO authenticated
  USING (
    tasks.deal_id IS NULL
    AND tasks.partnership_id IS NULL
    AND tasks.organization_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = tasks.organization_id
        AND can_view_owned(o.owner_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Notes: organization entity type
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS notes_select_org ON notes;
CREATE POLICY notes_select_org ON notes FOR SELECT TO authenticated
  USING (
    notes.entity_type = 'organization' AND EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = notes.entity_id::uuid
        AND o.deleted_at IS NULL
        AND can_view_owned(o.owner_id)
    )
  );

DROP POLICY IF EXISTS notes_insert_org ON notes;
CREATE POLICY notes_insert_org ON notes FOR INSERT TO authenticated
  WITH CHECK (
    (is_contributor() OR get_user_role() = 'EXECUTIVE')
    AND author_id = auth.uid()
    AND entity_type = 'organization'
    AND EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = entity_id::uuid
        AND o.deleted_at IS NULL
        AND can_view_owned(o.owner_id)
    )
  );
