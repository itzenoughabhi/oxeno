-- Adds customer profile fields, password login, and WhatsApp storage to an existing Oxeno database.
-- Run once with:
--   psql "$DATABASE_URL" -f database/migrations/001_add_customer_auth.sql

BEGIN;

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

CREATE UNIQUE INDEX IF NOT EXISTS customers_mobile_unique_idx
  ON customers (mobile)
  WHERE mobile IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS customers_email_unique_idx
  ON customers (email)
  WHERE email IS NOT NULL;

COMMIT;
