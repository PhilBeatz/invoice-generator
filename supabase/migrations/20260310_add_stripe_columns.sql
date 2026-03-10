-- Re-add Stripe columns to subscriptions table for payment processing
-- Run this in Supabase SQL Editor

-- Add Stripe IDs to subscriptions
ALTER TABLE IF EXISTS subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS stripe_price_id text,
  ADD COLUMN IF NOT EXISTS billing_period text DEFAULT 'monthly';

-- Index for quick lookups by Stripe customer/subscription ID
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
