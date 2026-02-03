-- Enhanced Order Tracking System Database Schema
-- This migration adds comprehensive tracking, inventory, notification, and analytics capabilities

-- ============================================================================
-- 1. EXTEND ORDERS TABLE WITH ENHANCED TRACKING FIELDS
-- ============================================================================

-- Add missing customer information fields
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Add enhanced tracking timestamps (some may already exist from migration 004)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS packing_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS actual_delivery TIMESTAMPTZ;

-- Add notification preferences and communication tracking
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": false, "sms": false, "timing_preference": "milestone_only"}'::jsonb,
ADD COLUMN IF NOT EXISTS last_notification_sent TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS push_subscription JSONB;

-- Add business analytics fields
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS processing_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS customer_satisfaction_rating SMALLINT CHECK (customer_satisfaction_rating >= 1 AND customer_satisfaction_rating <= 5);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_estimated_delivery ON public.orders(estimated_delivery);
CREATE INDEX IF NOT EXISTS idx_orders_processing_time ON public.orders(processing_time_minutes);

-- ============================================================================
-- 2. INVENTORY RESERVATION SYSTEM
-- ============================================================================

-- Create inventory reservations table
CREATE TABLE IF NOT EXISTS public.inventory_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity_reserved INTEGER NOT NULL CHECK (quantity_reserved > 0),
    reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'confirmed', 'released', 'expired')),
    created_by TEXT,
    
    -- Enhanced tracking
    confirmation_method TEXT CHECK (confirmation_method IN ('auto', 'manual', 'packing_scan')),
    release_reason TEXT CHECK (release_reason IN ('cancellation', 'expiry', 'insufficient_stock', 'manual')),
    confirmed_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for inventory reservations
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_order_id ON public.inventory_reservations(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_product_id ON public.inventory_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_status ON public.inventory_reservations(status);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_expires_at ON public.inventory_reservations(expires_at);

-- Enable RLS for inventory reservations
ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and create new one
DROP POLICY IF EXISTS "Allow authenticated users to manage inventory reservations" ON public.inventory_reservations;
CREATE POLICY "Allow authenticated users to manage inventory reservations" ON public.inventory_reservations
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- 3. NOTIFICATION LOGGING SYSTEM
-- ============================================================================

-- Create notification logs table
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'push', 'sms')),
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'bounced')),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    content_template TEXT NOT NULL,
    recipient TEXT NOT NULL,
    
    -- Enhanced tracking
    engagement_data JSONB DEFAULT '{}'::jsonb,
    retry_count INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for notification logs
CREATE INDEX IF NOT EXISTS idx_notification_logs_order_id ON public.notification_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON public.notification_logs(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON public.notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON public.notification_logs(sent_at);

-- Enable RLS for notification logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones
DROP POLICY IF EXISTS "Allow authenticated users to view notification logs" ON public.notification_logs;
DROP POLICY IF EXISTS "Allow system to insert notification logs" ON public.notification_logs;

-- Allow authenticated users to view notification logs
CREATE POLICY "Allow authenticated users to view notification logs" ON public.notification_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow system to insert notification logs
CREATE POLICY "Allow system to insert notification logs" ON public.notification_logs
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 4. SELF-SERVICE REQUEST SYSTEM
-- ============================================================================

-- Create self-service requests table
CREATE TABLE IF NOT EXISTS public.self_service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('cancellation', 'address_change')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    customer_reason TEXT,
    admin_notes TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    processed_by TEXT,
    
    -- Request-specific data
    cancellation_data JSONB,
    address_change_data JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for self-service requests
CREATE INDEX IF NOT EXISTS idx_self_service_requests_order_id ON public.self_service_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_self_service_requests_type ON public.self_service_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_self_service_requests_status ON public.self_service_requests(status);
CREATE INDEX IF NOT EXISTS idx_self_service_requests_requested_at ON public.self_service_requests(requested_at);

-- Enable RLS for self-service requests
ALTER TABLE public.self_service_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones
DROP POLICY IF EXISTS "Allow customers to view own self-service requests" ON public.self_service_requests;
DROP POLICY IF EXISTS "Allow customers to create self-service requests" ON public.self_service_requests;
DROP POLICY IF EXISTS "Allow authenticated users to manage self-service requests" ON public.self_service_requests;

-- Allow customers to view their own requests
CREATE POLICY "Allow customers to view own self-service requests" ON public.self_service_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = self_service_requests.order_id
            AND (orders.user_id = auth.uid() OR orders.customer_email = auth.jwt() ->> 'email')
        )
    );

-- Allow customers to create requests for their orders
CREATE POLICY "Allow customers to create self-service requests" ON public.self_service_requests
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = self_service_requests.order_id
            AND (orders.user_id = auth.uid() OR orders.customer_email = auth.jwt() ->> 'email')
        )
    );

-- Allow authenticated users (admins) to manage all requests
CREATE POLICY "Allow authenticated users to manage self-service requests" ON public.self_service_requests
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- 5. ANALYTICS AND METRICS SYSTEM
-- ============================================================================

-- Create order metrics table
CREATE TABLE IF NOT EXISTS public.order_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL CHECK (metric_type IN ('processing_time', 'customer_satisfaction', 'delivery_accuracy', 'self_service_usage')),
    metric_value NUMERIC(10, 2) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Enhanced analytics
    stage_breakdown JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for order metrics
CREATE INDEX IF NOT EXISTS idx_order_metrics_order_id ON public.order_metrics(order_id);
CREATE INDEX IF NOT EXISTS idx_order_metrics_type ON public.order_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_order_metrics_recorded_at ON public.order_metrics(recorded_at);

-- Enable RLS for order metrics
ALTER TABLE public.order_metrics ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and create new one
DROP POLICY IF EXISTS "Allow authenticated users to manage order metrics" ON public.order_metrics;
CREATE POLICY "Allow authenticated users to manage order metrics" ON public.order_metrics
    FOR ALL USING (auth.role() = 'authenticated');

-- Create performance summaries table for aggregated analytics
CREATE TABLE IF NOT EXISTS public.performance_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
    date_range JSONB NOT NULL,
    total_orders INTEGER NOT NULL DEFAULT 0,
    average_processing_time NUMERIC(10, 2),
    bottlenecks JSONB DEFAULT '[]'::jsonb,
    customer_satisfaction_score NUMERIC(3, 2),
    self_service_usage_rate NUMERIC(5, 2),
    inventory_turnover_rate NUMERIC(5, 2),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance summaries
CREATE INDEX IF NOT EXISTS idx_performance_summaries_period ON public.performance_summaries(period);
CREATE INDEX IF NOT EXISTS idx_performance_summaries_created_at ON public.performance_summaries(created_at);

-- Enable RLS for performance summaries
ALTER TABLE public.performance_summaries ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and create new one
DROP POLICY IF EXISTS "Allow authenticated users to view performance summaries" ON public.performance_summaries;
CREATE POLICY "Allow authenticated users to view performance summaries" ON public.performance_summaries
    FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================================
-- 6. COURIER CONFIGURATION SYSTEM
-- ============================================================================

-- Create courier configurations table for extensible courier support
CREATE TABLE IF NOT EXISTS public.courier_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    courier_code TEXT NOT NULL UNIQUE,
    courier_name TEXT NOT NULL,
    tracking_url_pattern TEXT NOT NULL,
    delivery_timeframe_days INTEGER DEFAULT 3,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default courier configurations
INSERT INTO public.courier_configurations (courier_code, courier_name, tracking_url_pattern, delivery_timeframe_days) VALUES
    ('dtdc', 'DTDC', 'https://www.dtdc.in/tracking/tracking_results.asp?strCnno={trackingNumber}', 3),
    ('bluedart', 'Blue Dart', 'https://www.bluedart.com/web/guest/trackdartresult?trackFor=0&trackNo={trackingNumber}', 2),
    ('delhivery', 'Delhivery', 'https://www.delhivery.com/track/package/{trackingNumber}', 4),
    ('ecom', 'Ecom Express', 'https://ecomexpress.in/tracking/?awb_field={trackingNumber}', 5)
ON CONFLICT (courier_code) DO NOTHING;

-- Create index for courier configurations
CREATE INDEX IF NOT EXISTS idx_courier_configurations_code ON public.courier_configurations(courier_code);
CREATE INDEX IF NOT EXISTS idx_courier_configurations_active ON public.courier_configurations(is_active);

-- Enable RLS for courier configurations
ALTER TABLE public.courier_configurations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones
DROP POLICY IF EXISTS "Allow public read access for active couriers" ON public.courier_configurations;
DROP POLICY IF EXISTS "Allow authenticated users to manage courier configurations" ON public.courier_configurations;

-- Allow public read access for active couriers
CREATE POLICY "Allow public read access for active couriers" ON public.courier_configurations
    FOR SELECT USING (is_active = true);

-- Allow authenticated users to manage courier configurations
CREATE POLICY "Allow authenticated users to manage courier configurations" ON public.courier_configurations
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- 7. TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers for new tables
CREATE TRIGGER update_inventory_reservations_updated_at
    BEFORE UPDATE ON public.inventory_reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_self_service_requests_updated_at
    BEFORE UPDATE ON public.self_service_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_summaries_updated_at
    BEFORE UPDATE ON public.performance_summaries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courier_configurations_updated_at
    BEFORE UPDATE ON public.courier_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically expire inventory reservations
CREATE OR REPLACE FUNCTION expire_inventory_reservations()
RETURNS void AS $$
BEGIN
    UPDATE public.inventory_reservations
    SET status = 'expired',
        release_reason = 'expiry',
        released_at = NOW()
    WHERE status = 'active'
    AND expires_at < NOW();
END;
$$ language 'plpgsql';

-- Function to calculate order processing time
CREATE OR REPLACE FUNCTION calculate_order_processing_time(order_id UUID)
RETURNS INTEGER AS $$
DECLARE
    order_created TIMESTAMPTZ;
    order_delivered TIMESTAMPTZ;
    processing_minutes INTEGER;
BEGIN
    SELECT created_at, delivered_at
    INTO order_created, order_delivered
    FROM public.orders
    WHERE id = order_id;
    
    IF order_delivered IS NOT NULL THEN
        processing_minutes := EXTRACT(EPOCH FROM (order_delivered - order_created)) / 60;
        
        -- Update the order with processing time
        UPDATE public.orders
        SET processing_time_minutes = processing_minutes
        WHERE id = order_id;
        
        RETURN processing_minutes;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 8. VIEWS FOR ANALYTICS
-- ============================================================================

-- Create view for order processing analytics
CREATE OR REPLACE VIEW public.order_processing_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    status,
    COUNT(*) as order_count,
    AVG(processing_time_minutes) as avg_processing_time,
    AVG(total_amount) as avg_order_value,
    COUNT(CASE WHEN customer_satisfaction_rating IS NOT NULL THEN 1 END) as rated_orders,
    AVG(customer_satisfaction_rating) as avg_satisfaction
FROM public.orders
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), status
ORDER BY date DESC, status;

-- Create view for inventory reservation analytics
CREATE OR REPLACE VIEW public.inventory_analytics AS
SELECT 
    p.name as product_name,
    p.stock_quantity as current_stock,
    COALESCE(SUM(CASE WHEN ir.status = 'active' THEN ir.quantity_reserved END), 0) as reserved_quantity,
    p.stock_quantity - COALESCE(SUM(CASE WHEN ir.status = 'active' THEN ir.quantity_reserved END), 0) as available_quantity,
    COUNT(CASE WHEN ir.status = 'expired' THEN 1 END) as expired_reservations
FROM public.products p
LEFT JOIN public.inventory_reservations ir ON p.id = ir.product_id
GROUP BY p.id, p.name, p.stock_quantity
ORDER BY available_quantity ASC;

-- ============================================================================
-- 9. COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.inventory_reservations IS 'Tracks inventory reservations during order processing to prevent overselling';
COMMENT ON TABLE public.notification_logs IS 'Logs all customer notifications with delivery status and engagement tracking';
COMMENT ON TABLE public.self_service_requests IS 'Manages customer self-service requests like cancellations and address changes';
COMMENT ON TABLE public.order_metrics IS 'Stores detailed analytics metrics for order processing performance';
COMMENT ON TABLE public.performance_summaries IS 'Aggregated performance data for business analytics and reporting';
COMMENT ON TABLE public.courier_configurations IS 'Configurable courier service information for tracking link generation';

COMMENT ON COLUMN public.orders.notification_preferences IS 'Customer notification preferences in JSON format';
COMMENT ON COLUMN public.orders.processing_time_minutes IS 'Total time from order creation to delivery in minutes';
COMMENT ON COLUMN public.orders.customer_satisfaction_rating IS 'Customer satisfaction rating from 1-5';
COMMENT ON COLUMN public.inventory_reservations.expires_at IS 'Automatic expiry time for inventory reservations';
COMMENT ON COLUMN public.notification_logs.engagement_data IS 'Tracking data for email opens, clicks, etc.';
COMMENT ON COLUMN public.self_service_requests.cancellation_data IS 'JSON data specific to cancellation requests';
COMMENT ON COLUMN public.self_service_requests.address_change_data IS 'JSON data specific to address change requests';

-- ============================================================================
-- 10. INITIAL DATA SETUP
-- ============================================================================

-- Update existing orders with default notification preferences if null
UPDATE public.orders 
SET notification_preferences = '{"email": true, "push": false, "sms": false, "timing_preference": "milestone_only"}'::jsonb
WHERE notification_preferences IS NULL;

-- Create initial performance summary for current month
INSERT INTO public.performance_summaries (period, date_range, total_orders, average_processing_time)
SELECT 
    'monthly',
    json_build_object('start', DATE_TRUNC('month', NOW()), 'end', NOW()),
    COUNT(*),
    AVG(processing_time_minutes)
FROM public.orders
WHERE created_at >= DATE_TRUNC('month', NOW())
ON CONFLICT DO NOTHING;