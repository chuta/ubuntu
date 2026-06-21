-- Week 4: RLS for partnerships

ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY partnerships_select ON partnerships FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid()
  );

CREATE POLICY partnerships_insert ON partnerships FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('COMMERCIAL', 'ADMIN') AND owner_id = auth.uid()
  );

CREATE POLICY partnerships_update ON partnerships FOR UPDATE TO authenticated
  USING (
    get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid()
  );

CREATE POLICY partnerships_delete ON partnerships FOR DELETE TO authenticated
  USING (
    get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid()
  );

CREATE POLICY pm_select ON partnership_members FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = partnership_members.partnership_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR p.owner_id = auth.uid())
    )
  );

CREATE POLICY pm_insert ON partnership_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = partnership_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR p.owner_id = auth.uid())
    )
  );

CREATE POLICY pm_delete ON partnership_members FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = partnership_members.partnership_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR p.owner_id = auth.uid())
    )
  );
