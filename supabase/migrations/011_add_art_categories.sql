-- Add Wall Paintings and Canvas Paintings as top-level categories
INSERT INTO categories (name, slug, description)
VALUES
  ('Wall Paintings', 'wall-paintings', 'Hand-painted Kalamkari wall art and panels'),
  ('Canvas Paintings', 'canvas-paintings', 'Authentic Kalamkari paintings on canvas')
ON CONFLICT (slug) DO NOTHING;
