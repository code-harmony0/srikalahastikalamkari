-- Migration: Add Additional Courier Services
-- Description: Extends courier_configurations with additional popular courier services
-- Requirements: 2.1, 2.2, 2.4, 2.5

-- Add additional courier configurations for international and popular services
INSERT INTO public.courier_configurations (courier_code, courier_name, tracking_url_pattern, delivery_timeframe_days) VALUES
    ('fedex', 'FedEx', 'https://www.fedex.com/fedextrack/?tracknum={trackingNumber}', 2),
    ('ups', 'UPS', 'https://www.ups.com/track?tracknum={trackingNumber}', 3),
    ('dhl', 'DHL', 'https://www.dhl.com/in-en/home/tracking/tracking-express.html?submit=1&tracking-id={trackingNumber}', 4),
    ('aramex', 'Aramex', 'https://www.aramex.com/us/en/track/shipments?ShipmentNumber={trackingNumber}', 5),
    ('manual', 'Manual Delivery', '', NULL),
    ('instore', 'In-Store Pickup', '', NULL)
ON CONFLICT (courier_code) DO UPDATE SET
    courier_name = EXCLUDED.courier_name,
    tracking_url_pattern = EXCLUDED.tracking_url_pattern,
    delivery_timeframe_days = EXCLUDED.delivery_timeframe_days,
    updated_at = NOW();

-- Update existing courier configurations with better tracking URLs if needed
UPDATE public.courier_configurations 
SET 
    tracking_url_pattern = 'https://ecomexpress.in/tracking/?awb_field={trackingNumber}',
    updated_at = NOW()
WHERE courier_code = 'ecom' AND tracking_url_pattern != 'https://ecomexpress.in/tracking/?awb_field={trackingNumber}';

-- Ensure all courier configurations are active by default (except manual and instore which don't need tracking)
UPDATE public.courier_configurations 
SET is_active = true, updated_at = NOW()
WHERE courier_code IN ('dtdc', 'bluedart', 'delhivery', 'ecom', 'fedex', 'ups', 'dhl', 'aramex');

-- Manual and instore deliveries are active but don't have tracking URLs
UPDATE public.courier_configurations 
SET is_active = true, tracking_url_pattern = '', updated_at = NOW()
WHERE courier_code IN ('manual', 'instore');

-- Add comment for documentation
COMMENT ON TABLE public.courier_configurations IS 'Configurable courier service information for tracking link generation. Supports both domestic and international courier services.';