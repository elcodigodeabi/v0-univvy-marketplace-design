-- Adds support for PayPal Payouts as an alternative payout method for advisors.
-- Advisors choose exactly one active payout method at a time: 'stripe' or 'paypal'.

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS payout_method TEXT CHECK (payout_method IN ('stripe', 'paypal'));

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS paypal_email TEXT;

-- Backfill: advisors who already completed Stripe onboarding default to 'stripe'.
UPDATE profiles
SET payout_method = 'stripe'
WHERE stripe_account_id IS NOT NULL
  AND payout_method IS NULL;
