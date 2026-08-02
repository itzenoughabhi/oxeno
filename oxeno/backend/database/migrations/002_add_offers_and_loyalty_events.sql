-- Adds business-created offers and an auditable loyalty point history.
-- Run once after 001_add_customer_auth.sql:
--   psql "$DATABASE_URL" -f database/migrations/002_add_offers_and_loyalty_events.sql

BEGIN;

CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (btrim(title) <> ''),
  description TEXT,
  discount_label TEXT NOT NULL CHECK (btrim(discount_label) <> ''),
  coupon_code TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT offers_expiry_check CHECK (expires_at > created_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS offers_business_coupon_code_unique_idx
  ON offers (business_id, coupon_code)
  WHERE coupon_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS offers_business_active_expiry_idx
  ON offers (business_id, is_active, expires_at);

CREATE TABLE IF NOT EXISTS loyalty_point_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  loyalty_program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  points INTEGER NOT NULL CHECK (points <> 0),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS loyalty_point_events_customer_created_idx
  ON loyalty_point_events (customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS loyalty_point_events_business_created_idx
  ON loyalty_point_events (business_id, created_at DESC);

DROP TRIGGER IF EXISTS offers_set_updated_at ON offers;
CREATE TRIGGER offers_set_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
