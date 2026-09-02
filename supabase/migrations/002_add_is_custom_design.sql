-- Add is_custom_design column to products table
ALTER TABLE public.products ADD COLUMN is_custom_design BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX idx_products_is_custom_design ON public.products(is_custom_design);
