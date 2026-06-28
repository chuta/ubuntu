-- Deal qualification scorecard
--
-- Structured qualification on deals across five dimensions plus a free-text
-- success criteria field and a stored composite score (0-100) for ranking and
-- filtering. Positive dimensions (mutual value, technical fit, strategic
-- alignment) score higher = better; cost dimensions (legal complexity, cost to
-- test) are inverted at the application layer so a higher composite is always
-- better. Each dimension is 1-5; composite is the average of normalized
-- dimensions, rounded to 0-100. NULL composite means "not yet scored".

ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS qual_mutual_value smallint
    CHECK (qual_mutual_value BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS qual_technical_fit smallint
    CHECK (qual_technical_fit BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS qual_legal_complexity smallint
    CHECK (qual_legal_complexity BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS qual_cost_to_test smallint
    CHECK (qual_cost_to_test BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS qual_strategic_alignment smallint
    CHECK (qual_strategic_alignment BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS qual_success_criteria text,
  ADD COLUMN IF NOT EXISTS qual_score smallint
    CHECK (qual_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS qual_updated_at timestamptz;

CREATE INDEX IF NOT EXISTS deals_qual_score_idx
  ON deals (qual_score DESC NULLS LAST)
  WHERE deleted_at IS NULL;
