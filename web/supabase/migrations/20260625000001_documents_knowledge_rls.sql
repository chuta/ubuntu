-- Week 5: RLS for documents and knowledge junction table

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_asset_tags ENABLE ROW LEVEL SECURITY;

-- Documents: owner-based access (same as deals)
CREATE POLICY documents_select ON documents FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid()
  );

CREATE POLICY documents_insert ON documents FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('COMMERCIAL', 'ADMIN') AND owner_id = auth.uid()
  );

CREATE POLICY documents_update ON documents FOR UPDATE TO authenticated
  USING (
    get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid()
  );

CREATE POLICY documents_delete ON documents FOR DELETE TO authenticated
  USING (
    get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid()
  );

-- Document versions: inherit from parent document
CREATE POLICY doc_version_select ON document_versions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_versions.document_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR d.owner_id = auth.uid())
    )
  );

CREATE POLICY doc_version_insert ON document_versions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR d.owner_id = auth.uid())
    )
  );

-- Knowledge asset tags
CREATE POLICY kat_select ON knowledge_asset_tags FOR SELECT TO authenticated USING (true);

CREATE POLICY kat_insert ON knowledge_asset_tags FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('COMMERCIAL', 'ADMIN', 'EXECUTIVE')
    AND EXISTS (
      SELECT 1 FROM knowledge_assets ka
      WHERE ka.id = knowledge_asset_id
        AND (ka.is_restricted = false OR get_user_role() = 'ADMIN')
    )
  );

CREATE POLICY kat_delete ON knowledge_asset_tags FOR DELETE TO authenticated
  USING (get_user_role() IN ('COMMERCIAL', 'ADMIN', 'EXECUTIVE'));

-- Allow knowledge asset updates
CREATE POLICY knowledge_update ON knowledge_assets FOR UPDATE TO authenticated
  USING (
    is_restricted = false OR get_user_role() = 'ADMIN'
  );

CREATE POLICY knowledge_delete ON knowledge_assets FOR DELETE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL'));
