-- Remove Stripe integration columns
-- Run this in Supabase SQL Editor to clean up Stripe-related columns

-- user_profiles: remove Stripe Connect columns
ALTER TABLE IF EXISTS user_profiles
  DROP COLUMN IF EXISTS stripe_account_id,
  DROP COLUMN IF EXISTS stripe_onboarding_complete;

-- invoice_shares: remove payment link column
ALTER TABLE IF EXISTS invoice_shares
  DROP COLUMN IF EXISTS payment_link_enabled;

-- invoice_emails: remove payment link column
ALTER TABLE IF EXISTS invoice_emails
  DROP COLUMN IF EXISTS payment_link_enabled;

-- subscriptions: remove Stripe subscription ID
ALTER TABLE IF EXISTS subscriptions
  DROP COLUMN IF EXISTS stripe_subscription_id;

-- Drop invoice_payments table (Stripe-only)
DROP TABLE IF EXISTS invoice_payments;
