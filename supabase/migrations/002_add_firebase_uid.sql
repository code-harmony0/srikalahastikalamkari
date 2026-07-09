-- Add firebase_uid column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS firebase_uid TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_firebase_uid ON public.orders(firebase_uid);

-- Add firebase_uid column to reviews table (optional, but good for future-proofing)
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS firebase_uid TEXT;
CREATE INDEX IF NOT EXISTS idx_reviews_firebase_uid ON public.reviews(firebase_uid);
