-- Adds support for two ways an advisor can get paid:
--   'express'  -> Univvy creates the Stripe Connect account for them (existing flow)
--   'standard' -> the advisor connects a Stripe account they already own via OAuth
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_account_type TEXT CHECK (stripe_account_type IN ('express', 'standard'));

-- Backfill: every account created before this migration was created through the
-- Express onboarding flow, so any profile that already has a stripe_account_id
-- is an Express account.
UPDATE profiles
SET stripe_account_type = 'express'
WHERE stripe_account_id IS NOT NULL
  AND stripe_account_type IS NULL;

-- Verify the migration
SELECT stripe_account_type, count(*)
FROM profiles
GROUP BY stripe_account_type;
