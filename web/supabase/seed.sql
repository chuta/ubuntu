-- Seed territories (pan-African focus)
INSERT INTO territories (name, region, country_code, priority) VALUES
  ('Nigeria', 'West Africa', 'NG', 'HIGH'),
  ('Ghana', 'West Africa', 'GH', 'HIGH'),
  ('Kenya', 'East Africa', 'KE', 'HIGH'),
  ('South Africa', 'Southern Africa', 'ZA', 'HIGH'),
  ('Senegal', 'West Africa', 'SN', 'MEDIUM'),
  ('Côte d''Ivoire', 'West Africa', 'CI', 'MEDIUM'),
  ('Rwanda', 'East Africa', 'RW', 'MEDIUM'),
  ('Pan-Africa', 'Africa', NULL, 'HIGH'),
  ('Global', 'Global', NULL, 'MEDIUM');

-- Seed Ubuntu ecosystem products
INSERT INTO products (code, name, description, revenue_engine) VALUES
  ('GIFT', 'GIFT — Gold International Fungible Token', 'Flagship gold-backed digital asset', 'GIFT_ADOPTION'),
  ('UTRIBE_WALLET', 'Utribe Wallet', 'Mobile-first wallet and distribution gateway', 'FINANCIAL_INFRASTRUCTURE'),
  ('UBUNTUVERSE', 'UbuntuVerse', 'Tokenization-as-a-Service infrastructure', 'TOKENIZATION_TaaS'),
  ('UBUNTU_CAPITAL', 'Ubuntu Capital', 'Capital formation and transaction advisory', 'CAPITAL_FORMATION');

-- Seed knowledge tags
INSERT INTO knowledge_tags (name, category) VALUES
  ('source-of-truth', 'meta'),
  ('b2g', 'segment'),
  ('b2b', 'segment'),
  ('pitch-deck', 'type'),
  ('whitepaper', 'type'),
  ('tokenization', 'topic'),
  ('gift', 'product'),
  ('wallet', 'product'),
  ('confidential', 'access'),
  ('restricted', 'access'),
  ('nigeria', 'territory'),
  ('regulation', 'topic'),
  ('sovereign', 'segment'),
  ('role-definition', 'meta');
