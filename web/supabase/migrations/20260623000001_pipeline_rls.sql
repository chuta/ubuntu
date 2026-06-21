-- Week 3: RLS for pipeline child tables

ALTER TABLE deal_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;

-- Stage history
CREATE POLICY dsh_select ON deal_stage_history FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = deal_stage_history.deal_id
        AND d.deleted_at IS NULL
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR d.owner_id = auth.uid())
    )
  );

CREATE POLICY dsh_insert ON deal_stage_history FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = deal_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR d.owner_id = auth.uid())
    )
  );

-- Activities
CREATE POLICY activities_select ON activities FOR SELECT TO authenticated
  USING (
    (deal_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = activities.deal_id
        AND d.deleted_at IS NULL
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR d.owner_id = auth.uid())
    ))
    OR (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = activities.organization_id
        AND o.deleted_at IS NULL
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR o.owner_id = auth.uid())
    ))
  );

CREATE POLICY activities_insert ON activities FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('COMMERCIAL', 'ADMIN', 'EXECUTIVE')
    AND logged_by_id = auth.uid()
  );

-- Tasks
CREATE POLICY tasks_select ON tasks FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = tasks.deal_id
        AND d.deleted_at IS NULL
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR d.owner_id = auth.uid())
    )
  );

CREATE POLICY tasks_insert ON tasks FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('COMMERCIAL', 'ADMIN', 'EXECUTIVE')
    AND EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = deal_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR d.owner_id = auth.uid())
    )
  );

CREATE POLICY tasks_update ON tasks FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = tasks.deal_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR d.owner_id = auth.uid())
    )
  );

-- Notes
CREATE POLICY notes_select ON notes FOR SELECT TO authenticated
  USING (
    entity_type = 'deal' AND EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = notes.entity_id::uuid
        AND d.deleted_at IS NULL
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR d.owner_id = auth.uid())
    )
  );

CREATE POLICY notes_insert ON notes FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('COMMERCIAL', 'ADMIN', 'EXECUTIVE')
    AND author_id = auth.uid()
    AND entity_type = 'deal'
    AND EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = entity_id::uuid
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR d.owner_id = auth.uid())
    )
  );

CREATE POLICY notes_delete ON notes FOR DELETE TO authenticated
  USING (
    author_id = auth.uid() OR get_user_role() IN ('EXECUTIVE', 'ADMIN')
  );

-- Forecasts
CREATE POLICY forecasts_select ON forecasts FOR SELECT TO authenticated USING (true);

CREATE POLICY forecasts_insert ON forecasts FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('COMMERCIAL', 'ADMIN', 'EXECUTIVE')
    AND submitted_by_id = auth.uid()
  );

CREATE POLICY forecasts_update ON forecasts FOR UPDATE TO authenticated
  USING (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR submitted_by_id = auth.uid());
