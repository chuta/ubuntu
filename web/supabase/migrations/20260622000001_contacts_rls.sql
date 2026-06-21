-- Week 2: RLS for contacts and profile extension tables

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE government_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_profiles ENABLE ROW LEVEL SECURITY;

-- Contacts: visible when parent org is visible
CREATE POLICY contacts_select ON contacts FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = contacts.organization_id
        AND o.deleted_at IS NULL
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR o.owner_id = auth.uid())
    )
  );

CREATE POLICY contacts_insert ON contacts FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = organization_id
        AND o.deleted_at IS NULL
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN', 'COMMERCIAL') AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR o.owner_id = auth.uid()))
    )
  );

CREATE POLICY contacts_update ON contacts FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = contacts.organization_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR o.owner_id = auth.uid())
    )
  );

CREATE POLICY contacts_delete ON contacts FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = contacts.organization_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR o.owner_id = auth.uid())
    )
  );

-- Government profiles
CREATE POLICY gov_profile_select ON government_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY gov_profile_insert ON government_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY gov_profile_update ON government_profiles FOR UPDATE TO authenticated USING (true);

-- Account profiles
CREATE POLICY acc_profile_select ON account_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY acc_profile_insert ON account_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY acc_profile_update ON account_profiles FOR UPDATE TO authenticated USING (true);
