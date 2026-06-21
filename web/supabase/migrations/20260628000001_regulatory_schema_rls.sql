-- Week 8: Regulatory Affairs (REG) module — schema + RLS

CREATE TYPE regulatory_meeting_type AS ENUM ('IN_PERSON', 'VIRTUAL', 'WRITTEN');
CREATE TYPE regulatory_meeting_status AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');
CREATE TYPE regulatory_attendance_role AS ENUM ('REGULATOR', 'UBUNTU', 'ADVISOR', 'OTHER');
CREATE TYPE regulatory_submission_type AS ENUM (
  'POLICY_PROPOSAL', 'WHITEPAPER', 'COMMENT_LETTER', 'REGULATORY_FILING', 'OTHER'
);
CREATE TYPE regulatory_submission_status AS ENUM (
  'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'
);
CREATE TYPE regulatory_consultation_response_status AS ENUM (
  'NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'NOT_APPLICABLE'
);
CREATE TYPE license_type AS ENUM (
  'VASP', 'EXCHANGE', 'PAYMENT_SERVICE', 'CUSTODY', 'TOKEN_ISSUANCE', 'OTHER'
);
CREATE TYPE licensing_conversation_status AS ENUM (
  'EXPLORING', 'PRE_APPLICATION', 'APPLICATION_SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'DENIED', 'ON_HOLD'
);
CREATE TYPE regulatory_requirement_category AS ENUM (
  'LICENSING', 'AML_CFT', 'CONSUMER_PROTECTION', 'CAPITAL', 'REPORTING', 'OTHER'
);
CREATE TYPE regulatory_compliance_status AS ENUM (
  'IDENTIFIED', 'IN_PROGRESS', 'MET', 'NOT_APPLICABLE', 'AT_RISK'
);

-- Regulatory meetings
CREATE TABLE regulatory_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  meeting_type regulatory_meeting_type NOT NULL DEFAULT 'IN_PERSON',
  regulator_organization_id UUID REFERENCES organizations(id),
  territory_id UUID NOT NULL REFERENCES territories(id),
  status regulatory_meeting_status NOT NULL DEFAULT 'SCHEDULED',
  outcome_summary TEXT,
  next_steps TEXT,
  deal_id UUID REFERENCES deals(id),
  owner_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE regulatory_meeting_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES regulatory_meetings(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  attendance_role regulatory_attendance_role NOT NULL DEFAULT 'OTHER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (meeting_id, contact_id)
);

-- Policy submissions
CREATE TABLE regulatory_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  submission_type regulatory_submission_type NOT NULL,
  regulator_organization_id UUID REFERENCES organizations(id),
  territory_id UUID NOT NULL REFERENCES territories(id),
  submitted_at DATE,
  reference_number TEXT,
  status regulatory_submission_status NOT NULL DEFAULT 'DRAFT',
  document_id UUID REFERENCES documents(id),
  response_summary TEXT,
  deal_id UUID REFERENCES deals(id),
  owner_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Consultation papers
CREATE TABLE regulatory_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  regulator_organization_id UUID REFERENCES organizations(id),
  territory_id UUID NOT NULL REFERENCES territories(id),
  published_date DATE,
  response_deadline DATE,
  response_status regulatory_consultation_response_status NOT NULL DEFAULT 'NOT_STARTED',
  consultation_url TEXT,
  our_response_document_id UUID REFERENCES documents(id),
  notes TEXT,
  owner_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Licensing conversations
CREATE TABLE licensing_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  license_type license_type NOT NULL,
  territory_id UUID NOT NULL REFERENCES territories(id),
  regulator_organization_id UUID REFERENCES organizations(id),
  status licensing_conversation_status NOT NULL DEFAULT 'EXPLORING',
  target_timeline TEXT,
  primary_contact_id UUID REFERENCES contacts(id),
  deal_id UUID REFERENCES deals(id),
  notes TEXT,
  owner_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Compliance requirements
CREATE TABLE regulatory_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  territory_id UUID NOT NULL REFERENCES territories(id),
  product_id UUID REFERENCES products(id),
  category regulatory_requirement_category NOT NULL,
  compliance_status regulatory_compliance_status NOT NULL DEFAULT 'IDENTIFIED',
  due_date DATE,
  evidence_document_id UUID REFERENCES documents(id),
  owner_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_regulatory_meetings_date ON regulatory_meetings(meeting_date);
CREATE INDEX idx_regulatory_meetings_territory ON regulatory_meetings(territory_id);
CREATE INDEX idx_regulatory_submissions_territory ON regulatory_submissions(territory_id);
CREATE INDEX idx_regulatory_consultations_deadline ON regulatory_consultations(response_deadline);
CREATE INDEX idx_regulatory_requirements_due ON regulatory_requirements(due_date);

-- RLS
ALTER TABLE regulatory_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE licensing_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_requirements ENABLE ROW LEVEL SECURITY;

-- Regulatory meetings
CREATE POLICY regulatory_meetings_select ON regulatory_meetings FOR SELECT TO authenticated
  USING (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid());

CREATE POLICY regulatory_meetings_insert ON regulatory_meetings FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('COMMERCIAL', 'ADMIN') AND owner_id = auth.uid());

CREATE POLICY regulatory_meetings_update ON regulatory_meetings FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

CREATE POLICY regulatory_meetings_delete ON regulatory_meetings FOR DELETE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

-- Meeting attendees
CREATE POLICY regulatory_meeting_attendees_select ON regulatory_meeting_attendees FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM regulatory_meetings m
      WHERE m.id = regulatory_meeting_attendees.meeting_id
        AND (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR m.owner_id = auth.uid())
    )
  );

CREATE POLICY regulatory_meeting_attendees_insert ON regulatory_meeting_attendees FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM regulatory_meetings m
      WHERE m.id = meeting_id
        AND (get_user_role() IN ('COMMERCIAL', 'ADMIN') OR m.owner_id = auth.uid())
    )
  );

CREATE POLICY regulatory_meeting_attendees_delete ON regulatory_meeting_attendees FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM regulatory_meetings m
      WHERE m.id = regulatory_meeting_attendees.meeting_id
        AND (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR m.owner_id = auth.uid()))
    )
  );

-- Submissions
CREATE POLICY regulatory_submissions_select ON regulatory_submissions FOR SELECT TO authenticated
  USING (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid());

CREATE POLICY regulatory_submissions_insert ON regulatory_submissions FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('COMMERCIAL', 'ADMIN') AND owner_id = auth.uid());

CREATE POLICY regulatory_submissions_update ON regulatory_submissions FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

CREATE POLICY regulatory_submissions_delete ON regulatory_submissions FOR DELETE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

-- Consultations
CREATE POLICY regulatory_consultations_select ON regulatory_consultations FOR SELECT TO authenticated
  USING (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid());

CREATE POLICY regulatory_consultations_insert ON regulatory_consultations FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('COMMERCIAL', 'ADMIN') AND owner_id = auth.uid());

CREATE POLICY regulatory_consultations_update ON regulatory_consultations FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

CREATE POLICY regulatory_consultations_delete ON regulatory_consultations FOR DELETE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

-- Licensing conversations
CREATE POLICY licensing_conversations_select ON licensing_conversations FOR SELECT TO authenticated
  USING (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid());

CREATE POLICY licensing_conversations_insert ON licensing_conversations FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('COMMERCIAL', 'ADMIN') AND owner_id = auth.uid());

CREATE POLICY licensing_conversations_update ON licensing_conversations FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

CREATE POLICY licensing_conversations_delete ON licensing_conversations FOR DELETE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

-- Requirements
CREATE POLICY regulatory_requirements_select ON regulatory_requirements FOR SELECT TO authenticated
  USING (get_user_role() IN ('EXECUTIVE', 'ADMIN') OR owner_id = auth.uid());

CREATE POLICY regulatory_requirements_insert ON regulatory_requirements FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('COMMERCIAL', 'ADMIN') AND owner_id = auth.uid());

CREATE POLICY regulatory_requirements_update ON regulatory_requirements FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));

CREATE POLICY regulatory_requirements_delete ON regulatory_requirements FOR DELETE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'COMMERCIAL') AND (get_user_role() = 'ADMIN' OR owner_id = auth.uid()));
