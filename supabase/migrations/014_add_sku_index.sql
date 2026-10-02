-- Migration: Backfill human-readable SKUs for all products
-- Format: {CATEGORY}-{MATERIAL}-{SEQ} e.g. SAR-TSK-001
-- 
-- This migration is run by the companion Node.js script (backfill-skus.mjs)
-- because the SKU prefix logic requires category + product name analysis
-- that is better handled in application code.
--
-- This SQL just ensures the sku column is properly set up:

-- Ensure sku column exists and is unique (already exists from 001_initial_schema.sql)
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE;

-- Create index for fast SKU lookups (if not already indexed)
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- Note: After running the backfill script, you can optionally make SKU NOT NULL:
-- ALTER TABLE public.products ALTER COLUMN sku SET NOT NULL;
