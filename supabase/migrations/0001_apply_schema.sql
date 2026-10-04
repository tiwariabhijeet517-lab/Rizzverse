-- RIZZVERSE'26 — Applied schema (idempotent via IF NOT EXISTS)
-- Covers: enums, registrations/admin_users tables, unique indexes,
-- updated_at trigger, RLS + policies, admin_users seeding instructions,
-- Storage RLS policies for the private `payment-proofs` bucket.

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
-- 2b. Admin users table
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================================================
-- 3. Unique constraints + indexes
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
-- 5. Row Level Security
-- ===========================================================================
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON public.registrations;
DROP POLICY IF EXISTS "Anon no access" ON public.registrations;
DROP POLICY IF EXISTS "Admin read all registrations" ON public.registrations;
DROP POLICY IF EXISTS "Admin update payment status" ON public.registrations;
DROP POLICY IF EXISTS "Students read own registration" ON public.registrations;
DROP POLICY IF EXISTS "Admins read admin_users" ON public.admin_users;

CREATE POLICY "Admins read admin_users"
  ON public.admin_users FOR SELECT
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users));

CREATE POLICY "Admin read all registrations"
  ON public.registrations FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND (auth.jwt() ->> 'email') IN (SELECT email FROM public.admin_users)
  );

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
-- 6. Storage RLS policies for `payment-proofs` bucket (bucket MUST be created
--    in the Storage UI first, PRIVATE, name=payment-proofs).
-- ===========================================================================
DROP POLICY IF EXISTS "Anon cannot list payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Anon cannot read payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Anon cannot upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins read payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Service role upload payment proofs" ON storage.objects;

CREATE POLICY "Admins read payment proofs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-proofs'
    AND (
      auth.role() = 'service_role'
      OR (auth.jwt() ->> 'email') IN (SELECT email FROM public.admin_users)
    )
  );

CREATE POLICY "Service role upload payment proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-proofs' AND auth.role() = 'service_role');
