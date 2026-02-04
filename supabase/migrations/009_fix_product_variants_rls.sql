-- Fix RLS policies for product_variants

-- 1. Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.product_variants;

-- 2. Create a more robust policy for authenticated users that covers INSERT, UPDATE, DELETE
CREATE POLICY "Enable insert for authenticated users" ON public.product_variants
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.product_variants
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON public.product_variants
    FOR DELETE TO authenticated USING (true);

-- 3. Ensure public read access remains
DROP POLICY IF EXISTS "Public read access for variants" ON public.product_variants;
CREATE POLICY "Public read access for variants" ON public.product_variants
    FOR SELECT USING (true);
