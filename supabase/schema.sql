-- RIZZVERSE'26 — Database Schema
-- Run this file inside the Supabase SQL Editor:
--   https://supabase.com/dashboard/project/_/sql/new
--
-- Always run in this order: 1. ENUMS, 2. TABLE, 3. CONSTRAINTS/INDEXES,
-- 4. STORAGE BUCKET (run in Dashboard UI + separate SQL below for RLS),
-- 5. RLS POLICIES.

-- ===========================================================================
-- 1. Custom enum for payment status
-- ===========================================================================
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('Pending', 'Verified', 'Rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ===========================================================================
-- 2. Registrations table
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  college_email TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  department TEXT NOT NULL,
  year_of_study TEXT NOT NULL,
  upi_transaction_id TEXT NOT NULL,
  payment_proof_path TEXT NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'Pending',
  confirm_payment BOOLEAN NOT NULL DEFAULT TRUE,
  verification_note TEXT,
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================================================
-- 2b. Admin users table — controls who can access the admin dashboard.
--     An email in this table + an authenticated Supabase Auth session with
--     that email = admin access.
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================================================
-- 3. Unique constraints + indexes — prevent duplicate registrations
-- ===========================================================================
CREATE UNIQUE INDEX IF NOT EXISTS registrations_college_email_idx
  ON public.registrations (lower(college_email));

CREATE UNIQUE INDEX IF NOT EXISTS registrations_roll_number_idx
  ON public.registrations (upper(roll_number));

CREATE INDEX IF NOT EXISTS registrations_payment_status_idx
  ON public.registrations (payment_status);

CREATE INDEX IF NOT EXISTS registrations_created_at_idx
  ON public.registrations (created_at DESC);

-- ===========================================================================
-- 4. Automatic `updated_at` trigger
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_updated_at ON public.registrations;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ===========================================================================
-- 5. Row Level Security — lock down table to anonymous reads/writes
--    Only an API using the service-role key (or a logged-in admin) can touch
--    the data. The public anon key never has direct INSERT/SELECT access.
-- ===========================================================================
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies so we can recreate them cleanly.
DROP POLICY IF EXISTS "Service role full access" ON public.registrations;
DROP POLICY IF EXISTS "Anon no access" ON public.registrations;
DROP POLICY IF EXISTS "Admin read all registrations" ON public.registrations;
DROP POLICY IF EXISTS "Admin update payment status" ON public.registrations;
DROP POLICY IF EXISTS "Students read own registration" ON public.registrations;
DROP POLICY IF EXISTS "Admins read admin_users" ON public.admin_users;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admins can read the admin_users table (used to confirm email is allowed).
CREATE POLICY "Admins read admin_users"
  ON public.admin_users FOR SELECT
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users));

--
-- The registration API route uses the SERVICE ROLE key server-side, which
-- automatically bypasses RLS. The policies below are for the case where an
-- admin dashboard accesses the DB with a signed-in user:
--

-- Authenticated admins may READ every registration.
CREATE POLICY "Admin read all registrations"
  ON public.registrations FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND (auth.jwt() ->> 'email') IN (SELECT email FROM public.admin_users)
  );

-- Authenticated admins may UPDATE payment-related columns only.
-- (We intentionally disallow INSERT/DELETE from clients.)
CREATE POLICY "Admin update payment status"
  ON public.registrations FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND (auth.jwt() ->> 'email') IN (SELECT email FROM public.admin_users)
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (auth.jwt() ->> 'email') IN (SELECT email FROM public.admin_users)
  );

-- ===========================================================================
-- 5b. Promote the FIRST admin
--
-- The admin_users table is empty on a fresh install. There is no public sign
-- up. Run this block ONCE (after creating your first user in Supabase Auth
-- via the dashboard) to make them an admin.
--
-- 1. Go to Supabase Dashboard → Authentication → Users → Add user →
--    Create new user. Use your personal email + a strong password.
-- 2. Copy that exact email into the block below and run it in SQL Editor.
-- ===========================================================================
--
-- INSERT INTO public.admin_users (email, display_name)
-- VALUES ('you@college.edu.in', 'Main Organizer')
-- ON CONFLICT (email) DO NOTHING;
--
-- Add more organizers the same way:
-- INSERT INTO public.admin_users (email, display_name)
-- VALUES ('coorganizer@college.edu.in', 'Co-Organizer')
-- ON CONFLICT (email) DO NOTHING;

-- Until admin_users is populated and admin auth is used, all traffic to
-- `registrations` goes via /api/register + /api/admin/* (service-role key,
-- server-side only).

-- ===========================================================================
-- 6. Storage — payment-proof bucket (MUST create the bucket in the UI first)
--
-- In Supabase Dashboard: Storage → Create new bucket
--   Name: payment-proofs
--   Make the bucket PRIVATE (toggle OFF "Public bucket").
--
-- After creating the bucket, run the RLS policies below via SQL Editor.
-- ===========================================================================

-- By default storage.objects has RLS enabled. We add these restrictive
-- policies to make 100% sure files can only be written via the service-role
-- key upload (used by /api/register) and read only by admins.

-- NOTE: Storage policies live on the storage.objects table.
-- https://supabase.com/docs/guides/storage/access-control

-- Run these AFTER creating the private `payment-proofs` bucket in the UI.

-- Nobody (public) can list objects in the payment-proofs bucket
DROP POLICY IF EXISTS "Anon cannot list payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Anon cannot read payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Anon cannot upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins read payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Service role upload payment proofs" ON storage.objects;

-- Admins (via Supabase Auth + email in admin_users) can read payment proofs.
CREATE POLICY "Admins read payment proofs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-proofs'
    AND (
      auth.role() = 'service_role'
      OR (auth.jwt() ->> 'email') IN (SELECT email FROM public.admin_users)
    )
  );

-- Only the service role can INSERT into payment-proofs (registration API).
CREATE POLICY "Service role upload payment proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-proofs' AND auth.role() = 'service_role');

-- ===========================================================================
-- 7. Quick verification query (run after setup)
-- ===========================================================================
-- SELECT
--   id,
--   full_name,
--   college_email,
--   roll_number,
--   payment_status,
--   created_at
-- FROM public.registrations
-- ORDER BY created_at DESC
-- LIMIT 20;
