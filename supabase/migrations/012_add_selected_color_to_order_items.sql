-- Add selected_color column to order_items
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS selected_color TEXT;
