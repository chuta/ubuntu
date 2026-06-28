-- Partnership workspace: activities/tasks scoped to partnerships + implementation milestones

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS partnership_id UUID REFERENCES partnerships(id) ON DELETE SET NULL;

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS partnership_id UUID REFERENCES partnerships(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_activities_partnership_id ON activities(partnership_id);
CREATE INDEX IF NOT EXISTS idx_tasks_partnership_id ON tasks(partnership_id);

CREATE TABLE partnership_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES partnerships(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED')),
  assignee_id UUID REFERENCES profiles(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_partnership_milestones_partnership ON partnership_milestones(partnership_id);

ALTER TABLE partnership_milestones ENABLE ROW LEVEL SECURITY;

-- Activities: partnership-scoped access (OR'd with existing deal/org policies)
CREATE POLICY activities_select_partnership ON activities FOR SELECT TO authenticated
  USING (
    partnership_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = activities.partnership_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR p.owner_id = auth.uid())
    )
  );

CREATE POLICY activities_insert_partnership ON activities FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('COMMERCIAL', 'ADMIN', 'EXECUTIVE')
    AND logged_by_id = auth.uid()
    AND partnership_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = partnership_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR p.owner_id = auth.uid())
    )
  );

-- Tasks: partnership-scoped access
CREATE POLICY tasks_select_partnership ON tasks FOR SELECT TO authenticated
  USING (
    partnership_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = tasks.partnership_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR p.owner_id = auth.uid())
    )
  );

CREATE POLICY tasks_insert_partnership ON tasks FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('COMMERCIAL', 'ADMIN', 'EXECUTIVE')
    AND partnership_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = partnership_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR p.owner_id = auth.uid())
    )
  );

CREATE POLICY tasks_update_partnership ON tasks FOR UPDATE TO authenticated
  USING (
    partnership_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = tasks.partnership_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR p.owner_id = auth.uid())
    )
  );

-- Notes: partnership entity type
CREATE POLICY notes_select_partnership ON notes FOR SELECT TO authenticated
  USING (
    entity_type = 'partnership' AND EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = notes.entity_id::uuid
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR p.owner_id = auth.uid())
    )
  );

CREATE POLICY notes_insert_partnership ON notes FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('COMMERCIAL', 'ADMIN', 'EXECUTIVE')
    AND author_id = auth.uid()
    AND entity_type = 'partnership'
    AND EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = entity_id::uuid
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR p.owner_id = auth.uid())
    )
  );

-- Milestones
CREATE POLICY pm_milestone_select ON partnership_milestones FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = partnership_milestones.partnership_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR p.owner_id = auth.uid())
    )
  );

CREATE POLICY pm_milestone_insert ON partnership_milestones FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('COMMERCIAL', 'ADMIN', 'EXECUTIVE')
    AND EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = partnership_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR p.owner_id = auth.uid())
    )
  );

CREATE POLICY pm_milestone_update ON partnership_milestones FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = partnership_milestones.partnership_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR p.owner_id = auth.uid())
    )
  );

CREATE POLICY pm_milestone_delete ON partnership_milestones FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = partnership_milestones.partnership_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR p.owner_id = auth.uid())
    )
  );
