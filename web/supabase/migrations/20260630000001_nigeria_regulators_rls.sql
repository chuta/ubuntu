-- Shared Nigeria regulator organizations are visible to all authenticated users.
DROP POLICY IF EXISTS organizations_select ON organizations;
CREATE POLICY organizations_select ON organizations FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL AND (
      get_user_role() IN ('EXECUTIVE', 'ADMIN')
      OR owner_id = auth.uid()
      OR (metadata->>'regulator_code') IS NOT NULL
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_regulator_code
  ON organizations ((metadata->>'regulator_code'))
  WHERE (metadata->>'regulator_code') IS NOT NULL AND deleted_at IS NULL;
