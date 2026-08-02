-- Oxeno PostgreSQL schema
-- Run once against an empty database:
--   psql "$DATABASE_URL" -f database/schema.sql
--
-- Never store plain-text passwords or verification codes in this database.
-- Passwords must be hashed by the API (for example, with bcrypt or argon2)
-- before they are saved in app_users.password_hash.

BEGIN;

CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  monthly_price NUMERIC(10, 2),
  customer_limit INTEGER,
  whatsapp_message_limit INTEGER,
  ai_voice_minutes_limit INTEGER,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT plans_id_check CHECK (id IN ('starter', 'growth', 'pro')),
  CONSTRAINT plans_price_check CHECK (monthly_price IS NULL OR monthly_price >= 0)
);

INSERT INTO plans (
  id, name, monthly_price, customer_limit, whatsapp_message_limit,
  ai_voice_minutes_limit, features
)
VALUES
  ('starter', 'Starter', 0.00, 500, 500, 0,
   '["1 QR loyalty program", "Basic analytics"]'::jsonb),
  ('growth', 'Growth', 49.00, 10000, 5000, 200,
   '["Unlimited QR programs", "AI campaigns & automation", "Advanced analytics"]'::jsonb),
  ('pro', 'Pro', NULL, NULL, NULL, NULL,
   '["Multi-store management", "Dedicated success manager"]'::jsonb)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  monthly_price = EXCLUDED.monthly_price,
  customer_limit = EXCLUDED.customer_limit,
  whatsapp_message_limit = EXCLUDED.whatsapp_message_limit,
  ai_voice_minutes_limit = EXCLUDED.ai_voice_minutes_limit,
  features = EXCLUDED.features;

CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (btrim(name) <> ''),
  business_type TEXT NOT NULL CHECK (btrim(business_type) <> ''),
  email CITEXT NOT NULL UNIQUE,
  mobile TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL CHECK (btrim(full_name) <> ''),
  email CITEXT NOT NULL UNIQUE,
  mobile TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'staff')),
  email_verified_at TIMESTAMPTZ,
  mobile_verified_at TIMESTAMPTZ,
  terms_accepted_at TIMESTAMPTZ,
  privacy_accepted_at TIMESTAMPTZ,
  google_subject TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keeps this schema compatible with databases initialized before consent
-- timestamps were added to the signup flow.
ALTER TABLE app_users
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS google_subject TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS app_users_google_subject_unique_idx
  ON app_users (google_subject)
  WHERE google_subject IS NOT NULL;

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'expired')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  renews_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT subscriptions_dates_check CHECK (
    renews_at IS NULL OR renews_at >= started_at
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_one_current_per_business
  ON subscriptions (business_id)
  WHERE status IN ('trialing', 'active', 'past_due');

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL CHECK (btrim(full_name) <> ''),
  email CITEXT,
  mobile TEXT,
  birth_date DATE,
  anniversary_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say', 'other')),
  city TEXT,
  is_married BOOLEAN NOT NULL DEFAULT FALSE,
  password_hash TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  marketing_consent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT customers_contact_check CHECK (email IS NOT NULL OR mobile IS NOT NULL),
  CONSTRAINT customers_email_per_business UNIQUE (business_id, email),
  CONSTRAINT customers_mobile_per_business UNIQUE (business_id, mobile)
);

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS is_married BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'customers_gender_check'
  ) THEN
    ALTER TABLE customers
      ADD CONSTRAINT customers_gender_check
      CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say', 'other'));
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS loyalty_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (btrim(name) <> ''),
  points_per_currency_unit NUMERIC(10, 2) NOT NULL DEFAULT 1,
  reward_threshold INTEGER NOT NULL DEFAULT 100 CHECK (reward_threshold > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT loyalty_programs_points_check CHECK (points_per_currency_unit > 0)
);

CREATE TABLE IF NOT EXISTS loyalty_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loyalty_program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  points_balance INTEGER NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT loyalty_memberships_unique UNIQUE (loyalty_program_id, customer_id)
);

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

CREATE TABLE IF NOT EXISTS loyalty_point_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  loyalty_program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  points INTEGER NOT NULL CHECK (points <> 0),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loyalty_program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS qr_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (btrim(name) <> ''),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'ai_voice', 'email', 'sms')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'live', 'paused', 'completed', 'cancelled')),
  message_body TEXT,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'sent', 'delivered', 'opened', 'redeemed', 'failed', 'opted_out')),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT campaign_recipients_unique UNIQUE (campaign_id, customer_id)
);

CREATE TABLE IF NOT EXISTS review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'completed', 'cancelled')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('whatsapp_message', 'ai_voice_minute')),
  units NUMERIC(12, 2) NOT NULL DEFAULT 1 CHECK (units > 0),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Store only a hash of the code. Delete expired/consumed codes with a scheduled job.
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT,
  mobile TEXT,
  purpose TEXT NOT NULL CHECK (purpose IN ('signup', 'login', 'password_reset')),
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT verification_codes_contact_check CHECK (email IS NOT NULL OR mobile IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS app_users_business_id_idx
  ON app_users (business_id);
CREATE INDEX IF NOT EXISTS customers_business_joined_idx
  ON customers (business_id, joined_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS customers_mobile_unique_idx
  ON customers (mobile)
  WHERE mobile IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS customers_email_unique_idx
  ON customers (email)
  WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS customers_business_birth_date_idx
  ON customers (business_id, birth_date)
  WHERE birth_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS customers_business_anniversary_date_idx
  ON customers (business_id, anniversary_date)
  WHERE anniversary_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS loyalty_programs_business_id_idx
  ON loyalty_programs (business_id);
CREATE INDEX IF NOT EXISTS offers_business_active_expiry_idx
  ON offers (business_id, is_active, expires_at);
CREATE INDEX IF NOT EXISTS loyalty_point_events_customer_created_idx
  ON loyalty_point_events (customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS loyalty_point_events_business_created_idx
  ON loyalty_point_events (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS qr_scans_scanned_at_idx
  ON qr_scans (scanned_at DESC);
CREATE INDEX IF NOT EXISTS campaigns_business_status_idx
  ON campaigns (business_id, status, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS review_requests_business_status_idx
  ON review_requests (business_id, status);
CREATE INDEX IF NOT EXISTS usage_events_business_occurred_idx
  ON usage_events (business_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS verification_codes_expires_at_idx
  ON verification_codes (expires_at)
  WHERE consumed_at IS NULL;

DROP TRIGGER IF EXISTS businesses_set_updated_at ON businesses;
CREATE TRIGGER businesses_set_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS app_users_set_updated_at ON app_users;
CREATE TRIGGER app_users_set_updated_at
  BEFORE UPDATE ON app_users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS subscriptions_set_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_set_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS customers_set_updated_at ON customers;
CREATE TRIGGER customers_set_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS loyalty_programs_set_updated_at ON loyalty_programs;
CREATE TRIGGER loyalty_programs_set_updated_at
  BEFORE UPDATE ON loyalty_programs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS loyalty_memberships_set_updated_at ON loyalty_memberships;
CREATE TRIGGER loyalty_memberships_set_updated_at
  BEFORE UPDATE ON loyalty_memberships
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS offers_set_updated_at ON offers;
CREATE TRIGGER offers_set_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS campaigns_set_updated_at ON campaigns;
CREATE TRIGGER campaigns_set_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
