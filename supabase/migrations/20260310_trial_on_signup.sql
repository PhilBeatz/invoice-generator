-- Automatically create a 7-day trial subscription when a new user signs up
-- This trigger fires after a new row is inserted into auth.users
--
-- HOW TO APPLY: Run this SQL in your Supabase Dashboard > SQL Editor

-- Ensure user_id has a unique constraint (needed for ON CONFLICT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.subscriptions'::regclass
    AND contype = 'u'
    AND array_length(conkey, 1) = 1
    AND conkey[1] = (
      SELECT attnum FROM pg_attribute
      WHERE attrelid = 'public.subscriptions'::regclass AND attname = 'user_id'
    )
  ) THEN
    ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- Create the function that inserts a trial subscription
CREATE OR REPLACE FUNCTION public.handle_new_user_trial()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status, trial_end, created_at, updated_at)
  VALUES (
    NEW.id,
    'trial',
    'trialing',
    NOW() + INTERVAL '7 days',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop the trigger if it already exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created_trial ON auth.users;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created_trial
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_trial();
