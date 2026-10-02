-- Dedicated staff identities for the dashboard. This table is deliberately
-- service-role only: browser clients must never read password verifiers.
CREATE TYPE public.admin_role AS ENUM ('super_admin', 'operations', 'sales_staff');

CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 2 AND 100),
  email TEXT NOT NULL UNIQUE CHECK (email = lower(trim(email))),
  password_hash TEXT NOT NULL,
  role public.admin_role NOT NULL DEFAULT 'sales_staff',
  permissions TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_admin_users_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW EXECUTE FUNCTION public.set_admin_users_updated_at();
