-- Fix RLS Policies for Categories and Sub-Categories
-- Allowing 'anon' (unauthenticated) access because the app uses Firebase Auth
-- and does not sync tokens to Supabase. Supabase sees requests as anonymous.

-- 1. Policies for CATEGORIES
-- Allow public (anon + authenticated) to insert
CREATE POLICY "Allow public insert" ON public.categories
FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow public to update
CREATE POLICY "Allow public update" ON public.categories
FOR UPDATE TO anon, authenticated USING (true);

-- Allow public to delete
CREATE POLICY "Allow public delete" ON public.categories
FOR DELETE TO anon, authenticated USING (true);


-- 2. Policies for SUB_CATEGORIES
-- Ensure RLS is enabled first
ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;

-- Allow public insert
CREATE POLICY "Allow public insert sub_categories" ON public.sub_categories
FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow public update
CREATE POLICY "Allow public update sub_categories" ON public.sub_categories
FOR UPDATE TO anon, authenticated USING (true);

-- Allow public delete
CREATE POLICY "Allow public delete sub_categories" ON public.sub_categories
FOR DELETE TO anon, authenticated USING (true);
