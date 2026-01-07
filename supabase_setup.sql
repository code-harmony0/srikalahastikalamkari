-- ============================================================================
-- SUPABASE DATABASE SETUP FOR SHRI KAILASH KALAMKARI
-- Run this SQL in your Supabase SQL Editor
-- ============================================================================

-- NOTE: categories table already exists with UUID id
-- We only need to create sub_categories table with matching UUID type

-- 1. CREATE SUB_CATEGORIES TABLE (categories already exists)
CREATE TABLE IF NOT EXISTS public.sub_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "subCatName" TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;

-- Also ensure categories has RLS enabled (if not already)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. DROP EXISTING POLICIES IF THEY EXIST (to avoid conflicts)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.categories;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.sub_categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.sub_categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.sub_categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.sub_categories;

-- 4. CREATE RLS POLICIES FOR PUBLIC READ ACCESS
-- Allow anyone to read categories
CREATE POLICY "Enable read access for all users" ON public.categories
  FOR SELECT
  USING (true);

-- Allow anyone to read sub_categories
CREATE POLICY "Enable read access for all users" ON public.sub_categories
  FOR SELECT
  USING (true);

-- 5. CREATE RLS POLICIES FOR AUTHENTICATED WRITE ACCESS
-- Only authenticated users can insert categories
CREATE POLICY "Enable insert for authenticated users only" ON public.categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update categories
CREATE POLICY "Enable update for authenticated users only" ON public.categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users can delete categories
CREATE POLICY "Enable delete for authenticated users only" ON public.categories
  FOR DELETE
  TO authenticated
  USING (true);

-- Only authenticated users can insert sub_categories
CREATE POLICY "Enable insert for authenticated users only" ON public.sub_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update sub_categories
CREATE POLICY "Enable update for authenticated users only" ON public.sub_categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users can delete sub_categories
CREATE POLICY "Enable delete for authenticated users only" ON public.sub_categories
  FOR DELETE
  TO authenticated
  USING (true);

-- 6. CREATE INDEXES FOR BETTER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_sub_categories_category_id
  ON public.sub_categories(category_id);

-- 7. GRANT PERMISSIONS
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.sub_categories TO authenticated;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.sub_categories TO anon;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify everything is set up correctly:

-- Check if tables exist and their column types
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('categories', 'sub_categories')
ORDER BY table_name, ordinal_position;

-- Check RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('categories', 'sub_categories')
ORDER BY tablename, policyname;

-- Check foreign key constraints
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('categories', 'sub_categories');
