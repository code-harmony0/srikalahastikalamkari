-- Add specifications and variants support

-- 1. Add specifications JSONB and material to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS material TEXT;

-- 2. Create product_variants table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT, -- e.g., "XL / Blue"
    size TEXT,
    color TEXT,
    sku TEXT UNIQUE,
    price_modifier NUMERIC(10, 2) DEFAULT 0,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Public read access for variants
CREATE POLICY "Public read access for variants" ON public.product_variants
    FOR SELECT USING (TRUE);

-- Authenticated write access
CREATE POLICY "Enable all for authenticated users" ON public.product_variants
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON public.product_variants(sku);

-- 6. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
