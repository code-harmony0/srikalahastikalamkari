-- Add missing tracking and timestamp fields to orders table
-- These fields are referenced in the admin dashboard but don't exist in the schema

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS packed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS tracking_id TEXT,
ADD COLUMN IF NOT EXISTS shipping_company TEXT,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Add barcode field to products table for PackingMode scanning
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS barcode TEXT UNIQUE;

-- Create index for barcode lookups
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);

-- Create packing_sessions table for PackingMode functionality
CREATE TABLE IF NOT EXISTS public.packing_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    admin_email TEXT NOT NULL,
    scan_progress JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    packing_duration_minutes INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for packing_sessions
CREATE INDEX IF NOT EXISTS idx_packing_sessions_order_id ON public.packing_sessions(order_id);
CREATE INDEX IF NOT EXISTS idx_packing_sessions_status ON public.packing_sessions(status);

-- Enable RLS for packing_sessions
ALTER TABLE public.packing_sessions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage packing sessions
CREATE POLICY "Allow authenticated users to manage packing sessions" ON public.packing_sessions
    FOR ALL USING (auth.role() = 'authenticated');

-- Add comment for documentation
COMMENT ON TABLE public.packing_sessions IS 'Tracks barcode scanning progress during order packing process';
COMMENT ON COLUMN public.orders.packed_at IS 'Timestamp when order packing was completed';
COMMENT ON COLUMN public.orders.shipped_at IS 'Timestamp when order was shipped';
COMMENT ON COLUMN public.orders.delivered_at IS 'Timestamp when order was delivered';
COMMENT ON COLUMN public.orders.tracking_id IS 'Shipping carrier tracking number';
COMMENT ON COLUMN public.orders.shipping_company IS 'Name of shipping carrier (DTDC, BlueDart, etc.)';
COMMENT ON COLUMN public.orders.cancellation_reason IS 'Reason provided when order was cancelled';
COMMENT ON COLUMN public.products.barcode IS 'Product barcode for scanning during packing';