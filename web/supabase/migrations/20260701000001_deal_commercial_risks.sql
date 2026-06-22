CREATE TYPE commercial_risk_type AS ENUM (
  'REGULATORY_DELAY',
  'PROCUREMENT_CYCLE',
  'INSTITUTIONAL_DD',
  'TOKEN_LIQUIDITY',
  'MARKET_VOLATILITY',
  'COUNTERPARTY'
);

CREATE TYPE commercial_risk_severity AS ENUM (
  'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
);

ALTER TABLE deals
  ADD COLUMN commercial_risk_flags commercial_risk_type[] NOT NULL DEFAULT '{}',
  ADD COLUMN commercial_risk_severity commercial_risk_severity,
  ADD COLUMN commercial_risk_notes TEXT,
  ADD COLUMN commercial_risk_mitigation TEXT,
  ADD COLUMN commercial_risk_review_date DATE,
  ADD COLUMN commercial_risk_updated_at TIMESTAMPTZ;

CREATE INDEX idx_deals_commercial_risk_flags
  ON deals USING GIN (commercial_risk_flags);
