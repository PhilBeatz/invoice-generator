-- Add Venmo and Cash App columns to payment_methods table
-- Run this in Supabase SQL Editor

ALTER TABLE IF EXISTS payment_methods
  ADD COLUMN IF NOT EXISTS venmo_handle text,
  ADD COLUMN IF NOT EXISTS cashapp_tag text;
