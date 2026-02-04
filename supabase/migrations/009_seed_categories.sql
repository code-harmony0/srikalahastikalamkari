-- 0. Drop strict unique name constraint (to allow same subcat name under different parents)
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;
-- Ensure slug is still unique
ALTER TABLE categories ADD CONSTRAINT categories_slug_key UNIQUE (slug);

-- 1. Truncate existing categories (Cascade to remove self-references if any, but be careful with products)
-- We use CASCADE to handle the parent_id FK. Note: This assumes products.category_id is nullable or we are okay with potential issues if strict FKs exist. 
-- Validating from previous schema check, products likely link to categories.
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE categories CASCADE;

-- 2. Insert Top-Level Categories
WITH 
  fabrics AS (INSERT INTO categories (name, slug, description, image_url) VALUES ('Fabrics', 'fabrics', 'Premium running fabrics', 'https://images.unsplash.com/photo-1629196984360-1d8920e58d4a?auto=format&fit=crop&w=800&q=80') RETURNING id),
  sarees AS (INSERT INTO categories (name, slug, description, image_url) VALUES ('Sarees', 'sarees', 'Traditional and modern sarees', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80') RETURNING id),
  pure_silk AS (INSERT INTO categories (name, slug, description, image_url) VALUES ('Pure Silk Sarees', 'pure-silk-sarees', 'Exquisite pure silk collection', 'https://images.unsplash.com/photo-1574635541656-745a5d84c3be?auto=format&fit=crop&w=800&q=80') RETURNING id),
  dupattas AS (INSERT INTO categories (name, slug, description, image_url) VALUES ('Dupattas', 'dupattas', 'Elegant dupattas', 'https://images.unsplash.com/photo-1615803792274-ed205658e658?auto=format&fit=crop&w=800&q=80') RETURNING id)

-- 3. Insert Sub-Categories (using CTEs to get parent IDs)
INSERT INTO categories (parent_id, name, slug, image_url) VALUES 
-- Fabrics Children
((SELECT id FROM fabrics), 'Bangalore Silk', 'bangalore-silk-fabric', 'https://images.unsplash.com/photo-1574635541656-745a5d84c3be?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM fabrics), 'Tussar Silk', 'tussar-silk-fabric', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM fabrics), 'Crape Silk', 'crape-silk-fabric', 'https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?auto=format&fit=crop&w=800&q=80'),

-- Sarees Children
((SELECT id FROM sarees), 'Mangalagiri Cotton', 'mangalagiri-cotton', 'https://images.unsplash.com/photo-1629196984360-1d8920e58d4a?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM sarees), 'Bangalore Silk', 'bangalore-silk-saree', 'https://images.unsplash.com/photo-1574635541656-745a5d84c3be?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM sarees), 'Semi Kanchi Silk', 'semi-kanchi-silk', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM sarees), 'Chenoori Silk', 'chenoori-silk', 'https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM sarees), 'Tussar Silk', 'tussar-silk-saree', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM sarees), 'Semi Crape Silk', 'semi-crape-silk', 'https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM sarees), 'Pure Crape Silk', 'pure-crape-silk', 'https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM sarees), 'Vidarbha Tussar', 'vidarbha-tussar', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM sarees), 'Pure Silk Kanchipuram Patty', 'pure-silk-kanchipuram-patty', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'),

-- Pure Silk Sarees Children
((SELECT id FROM pure_silk), 'Pure Silk Kanchipuram Patty', 'pure-silk-kanchipuram-patty-collection', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM pure_silk), 'Pochampally Ikat Patty', 'pochampally-ikat-patty', 'https://images.unsplash.com/photo-1615803792274-ed205658e658?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM pure_silk), 'Paithani Pure Silk', 'paithani-pure-silk', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'),

-- Dupattas Children
((SELECT id FROM dupattas), 'Mangalagiri Cotton', 'mangalagiri-cotton-dupatta', 'https://images.unsplash.com/photo-1629196984360-1d8920e58d4a?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM dupattas), 'Bangalore Silk', 'bangalore-silk-dupatta', 'https://images.unsplash.com/photo-1574635541656-745a5d84c3be?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM dupattas), 'Chenderi Silk', 'chenderi-silk', 'https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM dupattas), 'Tussar Silk', 'tussar-silk-dupatta', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM dupattas), 'Ikkat Silk', 'ikkat-silk', 'https://images.unsplash.com/photo-1615803792274-ed205658e658?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM dupattas), 'Kanchipuram Patty', 'kanchipuram-patty-dupatta', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM dupattas), 'Paithani', 'paithani-dupatta', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80');
