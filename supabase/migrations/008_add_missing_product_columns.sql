-- Add missing columns to products table

-- 1. Add sub_category_id
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sub_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_products_sub_category_id ON public.products(sub_category_id);

-- 2. Add barcode
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS barcode TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);

-- 3. Add original_price
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price NUMERIC(10, 2);

-- 4. Add colors
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS colors TEXT[];
