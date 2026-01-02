# Supabase Integration Setup Guide

Complete guide to set up Supabase for your Kalamkari e-commerce site.

## ✅ What's Been Done

1. **Installed Supabase CLI** (`supabase` package)
2. **Created folder structure:**
   - `src/lib/supabase/` - Client configuration and types
   - `src/lib/supabase/queries/` - Database query functions
   - `supabase/migrations/` - SQL migration files
3. **Created database schema** (`001_initial_schema.sql`)
4. **Created Supabase client** (`src/lib/supabase/client.ts`)
5. **Created query functions** for products and categories
6. **Added floating admin button** (bottom-right corner)
7. **Created admin dashboard** at `/dashboard`

---

## 🚀 Quick Start

### Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Name:** Shri Kailash Kalamkari
   - **Database Password:** (choose a strong password)
   - **Region:** Choose closest to your users
5. Click "Create new project" and wait ~2 minutes

### Step 2: Get Your API Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
   - **service_role** key (also starts with `eyJ...` - KEEP SECRET!)

### Step 3: Set Environment Variables

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

### Step 4: Run Database Migration

1. Go to your Supabase project → **SQL Editor**
2. Click "+ New Query"
3. Open `supabase/migrations/001_initial_schema.sql`
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click "Run" (or press CMD/CTRL + Enter)
7. You should see "Success. No rows returned"

### Step 5: Verify Database Setup

1. In Supabase, go to **Table Editor**
2. You should see these tables:
   - `categories`
   - `products`
   - `promotions`
   - `reviews`
   - `orders`
   - `order_items`

### Step 6: Link Your Project (Optional but Recommended)

This allows you to auto-generate TypeScript types from your database schema:

```bash
# Login to Supabase
npx supabase login

# Link your project (get project ID from Supabase dashboard URL)
npx supabase link --project-ref YOUR_PROJECT_ID

# Generate TypeScript types
npx supabase gen types typescript --linked > src/lib/supabase/types.ts
```

### Step 7: Restart Dev Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) - you should see the site with no errors!

---

## 📦 Database Schema Overview

### Tables Created

1. **categories** - Product categories (Silk Sarees, Cotton, etc.)
2. **products** - All products with images, price, stock
3. **promotions** - Banner promotions and sales
4. **reviews** - Customer product reviews (requires auth)
5. **orders** - Customer orders
6. **order_items** - Products in each order

### Security (Row Level Security)

All tables have RLS enabled with these policies:
- **Products/Categories/Promotions:** Public read access
- **Reviews:** Users can add their own reviews
- **Orders:** Users can only see their own orders

---

## 🔐 Authentication Setup (Optional)

To enable user accounts and reviews:

1. In Supabase, go to **Authentication** → **Providers**
2. Enable desired providers:
   - Email (built-in)
   - Google OAuth
   - GitHub OAuth
   - etc.
3. Update auth configuration in `src/lib/supabase/client.ts` if needed

---

## 🎨 Admin Dashboard

Access the admin dashboard:
1. Click the floating settings icon (bottom-right)
2. Or visit [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

Current features:
- ✅ Stats overview
- ✅ Quick links to manage products, orders, categories
- ✅ Database setup instructions
- 🚧 Product management (coming soon)
- 🚧 Order management (coming soon)

---

## 📝 Adding Sample Data

To test the site with sample products:

1. Go to Supabase → **Table Editor** → **products**
2. Click "Insert" → "Insert row"
3. Add a sample product:
   ```
   name: Elegant Silk Kalamkari Saree
   description: Beautiful hand-painted traditional saree
   price: 8500.00
   slug: elegant-silk-kalamkari-saree
   stock_quantity: 10
   is_featured: true
   is_visible: true
   images: {"https://static.wixstatic.com/media/..."}
   ```

Or run this SQL in SQL Editor:

```sql
INSERT INTO public.products (name, description, price, slug, stock_quantity, is_featured, is_visible, images)
VALUES
  (
    'Elegant Silk Kalamkari Saree',
    'Exquisite hand-painted silk saree with traditional Kalamkari motifs',
    8500.00,
    'elegant-silk-kalamkari-saree',
    10,
    true,
    true,
    ARRAY['https://static.wixstatic.com/media/07221c_your-image-url.jpg']
  ),
  (
    'Cotton Kalamkari Dupatta',
    'Lightweight cotton dupatta with intricate hand-block prints',
    1200.00,
    'cotton-kalamkari-dupatta',
    25,
    true,
    true,
    ARRAY['https://static.wixstatic.com/media/07221c_your-image-url.jpg']
  );
```

---

## 🔧 Using Query Functions

Replace mock services with real Supabase queries:

```typescript
// Old way (mock)
import { getProducts } from '@/backend/services/products';

// New way (Supabase)
import { getProducts } from '@/lib/supabase/queries/products';
```

Available query functions:

### Products
- `getProducts()` - Get all visible products
- `getFeaturedProducts()` - Get featured products
- `getProductBySlug(slug)` - Get single product
- `searchProducts(query)` - Search products
- `createProduct(product)` - Add new product (admin)
- `updateProduct(id, updates)` - Update product (admin)
- `deleteProduct(id)` - Delete product (admin)

### Categories
- `getCategories()` - Get all categories
- `getCategoryBySlug(slug)` - Get single category
- `getTopLevelCategories()` - Get parent categories
- `getSubcategories(parentId)` - Get child categories

---

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"
**Solution:** Make sure `.env.local` exists with correct credentials

### Error: "relation 'products' does not exist"
**Solution:** Run the migration SQL in Step 4

### Empty products page
**Solution:** Add sample data (see "Adding Sample Data" section)

### TypeScript errors with `Database` type
**Solution:** Run `npx supabase gen types typescript --linked > src/lib/supabase/types.ts`

---

## 📚 Next Steps

1. **Migrate mock services:** Replace all mock data with Supabase queries
2. **Add product management UI:** Create forms to add/edit products in dashboard
3. **Set up authentication:** Enable user login/signup
4. **Add order management:** Allow customers to place orders
5. **Set up payment:** Integrate Razorpay/Stripe for payments

---

## 📖 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Dashboard](https://app.supabase.com)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Need Help?** Check the admin dashboard for live setup status and instructions.
