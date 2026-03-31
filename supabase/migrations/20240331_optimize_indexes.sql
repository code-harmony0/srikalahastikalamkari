-- Database Performance Optimization Indexes
-- Run these in Supabase SQL Editor for faster dashboard queries

-- 1. Orders table indexes for dashboard KPI queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at);

-- 2. Composite index for month-over-month queries
CREATE INDEX IF NOT EXISTS idx_orders_created_amount ON orders(created_at, total_amount);

-- 3. Order items indexes for revenue calculations
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- 4. Products indexes for stock queries
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- 5. Categories index for joins
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- 6. Partial index for active orders only (excludes cancelled)
CREATE INDEX IF NOT EXISTS idx_orders_active ON orders(created_at, status) 
WHERE status != 'cancelled';

-- 7. Index for recent orders query (last 7 days optimization)
CREATE INDEX IF NOT EXISTS idx_orders_recent ON orders(created_at DESC, status) 
WHERE created_at > NOW() - INTERVAL '30 days';

-- 8. Covering index for order dashboard queries
CREATE INDEX IF NOT EXISTS idx_orders_dashboard ON orders(id, created_at, status, total_amount, customer_name);

-- 9. Foreign key indexes for faster joins
CREATE INDEX IF NOT EXISTS idx_products_category_fk ON products(category_id);

-- 10. GIN index for JSON/JSONB columns if using metadata
-- CREATE INDEX IF NOT EXISTS idx_orders_metadata ON orders USING GIN (metadata);

-- Statistics update for query planner
ANALYZE orders;
ANALYZE order_items;
ANALYZE products;
ANALYZE categories;
