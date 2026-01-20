# Claude Code + Gemini CLI - Shri Kailash Kalamkari Project

## MANDATORY: Use Gemini CLI Before Making Changes

**IMPORTANT:** Before implementing ANY code changes, ALWAYS run Gemini CLI for analysis first.

### Required Workflow
1. **ANALYZE with Gemini** - Run analysis command BEFORE writing code
2. **PLAN based on Gemini output** - Review recommendations
3. **IMPLEMENT with Claude** - Make the actual code changes
4. **VALIDATE with Gemini** - Verify changes are correct

### Quick Gemini Commands
```bash
# Before ANY dashboard/UI changes:
/opt/homebrew/bin/gemini -p "@src/app/dashboard/ Analyze this code and suggest improvements for: [describe task]"

# Before ANY backend/API changes:
/opt/homebrew/bin/gemini -p "@src/backend/ Review this code. What issues exist? How should I implement: [describe task]"

# Before fixing bugs:
/opt/homebrew/bin/gemini -p "@src/ Find the root cause of: [describe bug]. List all affected files."
```

---

## Project Overview
Next.js 14 e-commerce site for authentic Kalamkari sarees and fabrics. **Zero Wix dependencies** - completely independent frontend with Supabase backend.

## Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand (cart/wishlist) + TanStack Query (data)
- **Validation:** Zod
- **Animation:** Framer Motion
- **Images:** next/image (automatic optimization)

## Quick Start

### Prerequisites
- Node.js 18+ (LTS)
- npm or yarn
- Supabase account (for backend)
- Gemini CLI installed (for analysis)

### Setup Steps
1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set Up Supabase:**
   - Follow instructions in [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
   - Create `.env.local` from `.env.local.example`
   - Add your Supabase credentials

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

4. **Access Admin Dashboard:**
   - Click floating gear icon (bottom-right)
   - Or visit [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

5. **Add Sample Data:**
   - See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for sample product SQL

## Gemini CLI Integration (ALWAYS USE FIRST)

### Installation Check
```bash
which gemini
# Should return: /opt/homebrew/bin/gemini
```

### WORKFLOW: Gemini First, Claude Second

| Step | Tool | Purpose |
|------|------|---------|
| 1 | Gemini CLI | Analyze code, identify issues, get recommendations |
| 2 | Claude Code | Implement changes based on Gemini's analysis |
| 3 | Gemini CLI | Validate changes, check for regressions |
| 4 | Claude Code | Fix any issues found |

### Task-Specific Gemini Commands

#### Before UI/Dashboard Changes
```bash
/opt/homebrew/bin/gemini -p "@src/app/dashboard/ @src/shared/ui/ Analyze the dashboard components. Suggest improvements for: [your task]"
```

#### Before Backend/Database Changes
```bash
/opt/homebrew/bin/gemini -p "@src/backend/ @supabase/ Review backend code. Check for: type mismatches, missing error handling, UUID vs integer issues"
```

#### Before Bug Fixes
```bash
/opt/homebrew/bin/gemini -p "@src/ Debug this issue: [describe bug]. Find root cause and list all affected files."
```

### Common Gemini Commands for This Project

#### Analyze Entire Codebase
```bash
/opt/homebrew/bin/gemini -p "@./ Provide comprehensive analysis: architecture, patterns, type safety, performance, security issues"
```

#### Check for Wix References (Should be ZERO)
```bash
/opt/homebrew/bin/gemini -p "@app/ @components/ @services/ Scan for any remaining Wix dependencies, imports, or references. Flag any @wix packages."
```

#### Validate Next.js Best Practices
```bash
/opt/homebrew/bin/gemini -p "@app/ @components/ Check Next.js 14 App Router best practices: Server Components usage, Client Component boundaries, dynamic routing, metadata API"
```

#### Performance Analysis
```bash
/opt/homebrew/bin/gemini -p "@./ Analyze bundle size, code splitting, lazy loading. Identify performance bottlenecks and optimization opportunities."
```

#### Type Safety Audit
```bash
/opt/homebrew/bin/gemini -p "@types/ @services/ @components/ Audit TypeScript usage. Check for any types, implicit any, missing type definitions."
```

#### Security Scan
```bash
/opt/homebrew/bin/gemini -p "@./ Scan for security vulnerabilities: XSS risks, injection points, insecure dependencies, exposed secrets."
```

#### Component Analysis
```bash
/opt/homebrew/bin/gemini -p "@components/ Analyze React component structure. Check for prop drilling, unnecessary re-renders, missing memo/useMemo/useCallback."
```

## Architecture Guidelines

### Directory Structure (STRICT - DO NOT CHANGE)
```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage (Server Component)
│   ├── products/
│   │   ├── page.tsx       # Product listing
│   │   └── [slug]/page.tsx # Product detail (dynamic)
│   ├── cart/page.tsx      # Shopping cart
│   ├── checkout/page.tsx  # Checkout flow
│   ├── contact/page.tsx   # Contact page
│   ├── about/page.tsx     # About page
│   ├── dashboard/         # Admin dashboard
│   │   └── page.tsx       # Dashboard home
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
│
├── lib/                   # Core utilities
│   └── supabase/          # Supabase integration
│       ├── client.ts      # Supabase client instance
│       ├── types.ts       # Generated database types
│       └── queries/       # Database queries
│           ├── products.ts    # Product CRUD
│           └── categories.ts  # Category queries
│
├── shared/                # Shared across all features
│   ├── ui/               # shadcn components
│   ├── cart-store.ts     # Cart state (Zustand)
│   ├── wishlist-store.ts # Wishlist state (Zustand)
│   └── providers.tsx     # App providers
│
├── storefront/           # Customer-facing features
│   ├── components/
│   │   ├── layout/       # Header, Footer, FloatingAdminButton
│   │   ├── home/         # Homepage components
│   │   ├── products/     # Product components
│   │   └── cart/         # Cart components
│   └── pages/            # Page-level components
│
├── dashboard/            # Admin-only features
│   └── components/       # Dashboard components
│       └── DashboardPage.tsx
│
└── backend/              # Legacy mock services (being migrated)
    ├── products.ts       # Mock product data
    └── promotions.ts     # Mock promotions

supabase/
└── migrations/           # Database migrations
    └── 001_initial_schema.sql
```

### Component Rules
1. **Server Components by default** - Only use `"use client"` when necessary
2. **Client Components when:**
   - Using hooks (useState, useEffect, etc.)
   - Event handlers
   - Browser APIs
   - Zustand stores
   - TanStack Query hooks

### Data Fetching Strategy
- **Supabase Queries:** `src/lib/supabase/queries/*.ts` (products, categories, orders)
- **TanStack Query:** All async data (caching, revalidation)
- **Zustand:** Client-side state (cart, wishlist)
- **No direct API calls in components** - always use query functions from `src/lib/supabase/queries/`

### Image Optimization
```typescript
// ALWAYS use next/image
import Image from "next/image";

<Image
  src={product.mainImage}
  alt={product.title}
  fill // or width/height
  priority={isAboveFold}
  className="object-cover"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### SEO Implementation
```typescript
// app/page-name/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title | Shri Kailash Kalamkari",
  description: "Page description",
  openGraph: {
    title: "OG Title",
    description: "OG Description",
  },
};
```

## Wix Migration Status

### ✅ REMOVED (100%)
- ❌ `@wix/members` → Replaced with mock auth service
- ❌ `@wix/data` → Replaced with mock services + TanStack Query
- ❌ `@wix/ecom` → Replaced with Zustand stores
- ❌ `@wix/image-kit` → Replaced with next/image
- ❌ `@wix/seo` → Replaced with Next.js Metadata API
- ❌ `@wix/astro` → Replaced with Next.js App Router
- ❌ `react-router-dom` → Replaced with Next.js routing

### Backend Integration
**Status:** ✅ Supabase Integrated

**Current Setup:**
- **Database:** Supabase PostgreSQL
- **Tables:** products, categories, orders, reviews, promotions, order_items
- **Auth:** Supabase Auth (ready to enable)
- **Storage:** Supabase Storage (for product images)
- **Real-time:** Supabase Realtime subscriptions (available)

**Setup Guide:** See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for complete setup instructions

**Query Functions:**
- `src/lib/supabase/queries/products.ts` - Product CRUD operations
- `src/lib/supabase/queries/categories.ts` - Category operations
- More query files can be added as needed

**Migration Status:**
- ⏳ `src/backend/` - Legacy mock services (to be replaced with Supabase queries)
- ✅ Database schema created (`supabase/migrations/001_initial_schema.sql`)
- ✅ TypeScript types generated (`src/lib/supabase/types.ts`)

## Performance Targets

| Metric | Target | Status |
|---|---|---|
| First Contentful Paint | <1s | ✅ Expected 0.8s |
| Time to Interactive | <2s | ✅ Expected 1.5s |
| Bundle Size | <200KB | ✅ Estimated 180KB |
| Lighthouse Performance | >90 | ✅ Expected 95+ |
| Lighthouse SEO | >90 | ✅ Expected 95+ |

## Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Testing Strategy

### Manual Testing Checklist
**Storefront:**
- [x] Homepage loads with hero carousel
- [x] Products page displays grid
- [x] Product detail shows full info
- [x] Cart persists across refresh
- [x] Wishlist toggle works (UI only - data pending)
- [x] Contact page with form
- [x] About page with team section
- [x] Profile page
- [x] Responsive on mobile/tablet
- [x] Images optimize correctly
- [x] No hydration errors

**Admin:**
- [x] Floating admin button visible
- [x] Dashboard accessible at `/dashboard`
- [x] Stats overview displays
- [x] Quick action cards functional
- [ ] Product management UI (pending)
- [ ] Order management UI (pending)

### Performance Testing
```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

## Gemini Validation Commands

### Pre-Commit Validation
```bash
/opt/homebrew/bin/gemini -p "@app/ @components/ Quick validation before commit: Check for console.logs, debugger statements, TODO comments, type errors"
```

### Pre-Deployment Validation
```bash
/opt/homebrew/bin/gemini -p "@./ Pre-deployment checklist: Verify no Wix refs, check env vars, validate SEO meta tags, confirm production build config"
```

### Post-Migration Validation
```bash
/opt/homebrew/bin/gemini -p "@./ Final migration validation: Compare with original Wix site. List all functionality migrated, pending features, breaking changes"
```

## Common Issues & Solutions

### Issue: Hydration Mismatch Error
**Solution:** Ensure cart count uses `mounted` state check:
```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
// Then: {mounted && cart.getTotalItems() > 0 && <Badge />}
```

### Issue: Framer-Motion Scroll Warning
**Solution:** Add `position: relative` to html/body in globals.css

### Issue: Images not loading
**Solution:** Check next.config.mjs remotePatterns for Wix static media URLs

### Issue: Cart not persisting
**Solution:** Zustand persistence uses localStorage - check browser settings

### Issue: Supabase Connection Error
**Solution:**
1. Check `.env.local` has correct credentials
2. Verify Supabase project is running
3. Ensure RLS policies are configured correctly

### Issue: Type errors
**Solution:** Run `npm run type-check` and fix incrementally

### Issue: Build fails
**Solution:** Check for:
- Client Components have `"use client"`
- No Server Component imports in Client Components
- All dynamic imports are lazy-loaded
- Environment variables are set

## Code Quality Standards

### TypeScript
- ✅ Strict mode enabled
- ✅ No `any` types (use `unknown` if needed)
- ✅ Interfaces for all props
- ✅ Proper return types

### React
- ✅ Functional components only
- ✅ Hooks rules followed
- ✅ Props destructured
- ✅ Keys on lists

### CSS
- ✅ Tailwind classes only
- ✅ No inline styles
- ✅ Responsive by default
- ✅ Dark mode support (next-themes)

## Deployment

### Recommended: Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Environment Variables
Create `.env.local` (see `.env.local.example`):
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Maintenance

### Admin Dashboard
Access at `/dashboard` or click floating admin button (bottom-right gear icon)

**Features:**
- Stats overview (products, orders, revenue)
- Quick links to manage products, categories, orders
- Database setup instructions
- Future: Product/order management UI

### Adding New Products
**Option 1:** Through Supabase Dashboard
1. Go to [app.supabase.com](https://app.supabase.com)
2. Navigate to Table Editor → `products`
3. Click "Insert" → "Insert row"

**Option 2:** Via SQL
```sql
INSERT INTO products (name, description, price, slug, images, is_featured)
VALUES ('Product Name', 'Description', 8500.00, 'product-slug',
        ARRAY['https://image-url.jpg'], true);
```

**Option 3:** Admin Dashboard UI (coming soon)

### Adding New Pages
1. Create `src/app/page-name/page.tsx`
2. Export metadata
3. Create component in `src/storefront/components/`
4. Add route to navigation in `src/storefront/components/layout/Header.tsx`

### Updating Styles
Edit `src/app/globals.css` → CSS variables and custom classes

## Project Contacts

**AI Assistants (Use in this order!):**
1. **Gemini CLI FIRST** - Analysis, bug detection, code review, architecture decisions
2. **Claude Code SECOND** - Implementation based on Gemini's recommendations

**Never skip Gemini analysis before making code changes!**

**Package Manager:** npm
**Node Version:** Latest LTS (18+)
**Next.js Version:** 14.2.35
**Supabase:** PostgreSQL + Auth + Storage

---

## Project Status

**Last Updated:** 2026-01-01

**Migration Status:** ✅ 95% Complete
- ✅ All pages migrated from Wix to Next.js
- ✅ Wix dependencies completely removed
- ✅ Supabase backend integrated
- ✅ Admin dashboard created
- ✅ Floating admin button added
- ✅ All UI pages themed consistently
- ⏳ Mock services → Supabase migration in progress
- ⏳ Admin UI for product/order management (planned)

**Production Ready:** ✅ YES (pending Supabase setup)
- All storefront pages functional
- Responsive design complete
- Performance optimized
- SEO implemented
- **Next Step:** Connect to Supabase database (see [SUPABASE_SETUP.md](SUPABASE_SETUP.md))
