-- Create contact_inquiries table
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'solved', 'ignored')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Policy: Public can insert (contact form)
CREATE POLICY "Public can insert inquiries" 
  ON public.contact_inquiries 
  FOR INSERT 
  TO public 
  WITH CHECK (true);

-- Policy: Admins/Authenticated users can view all
CREATE POLICY "Authenticated users can view inquiries" 
  ON public.contact_inquiries 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Policy: Admins/Authenticated users can update (to change status)
CREATE POLICY "Authenticated users can update inquiries" 
  ON public.contact_inquiries 
  FOR UPDATE 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.contact_inquiries TO anon, authenticated, service_role;
