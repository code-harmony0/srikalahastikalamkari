# Shri Kailash Kalamkari

Heritage hand-painted Kalamkari sarees e-commerce platform built with Next.js 14.

## Deployment Guide

### Files to Include in ZIP

When deploying to Hostinger (or any shared hosting), zip these files:

```
src/              # Source code (required for build)
.next/standalone/ # Server bundle (pre-built)
.next/static/     # Static assets (pre-built)
public/           # Public assets (images, fonts)
package.json      # Dependencies
package-lock.json # Lock file for exact versions
next.config.mjs   # Next.js configuration
.env.local        # Environment variables (Supabase keys, etc.)
```

### Create Deployment ZIP

```bash
npm run build && zip -r deploy.zip src .next/standalone .next/static public package.json package-lock.json next.config.mjs tsconfig.json .env.local -x "*.DS_Store"
```

### What NOT to Include

- `tests/` - Test files (not needed in production)
- `node_modules/` - Will be installed on server
- `.git/` - Git history
- `.yarn/`, `.swc/`, `.vercel/` - Cache folders

### Hostinger Setup (IMPORTANT)

**The Problem:** Hostinger's file manager extracts zips into a nested folder like `shri_kalahsti_kalamkari/`. This breaks the build.

**The Fix - Step by Step:**

1. **Upload** `deploy.zip` via File Manager

2. **Extract** the zip (it will create a folder like `shri_kalahsti_kalamkari/`)

3. **Move files to root** - Run these commands in Hostinger Terminal:

```bash
cd /home/u445841538/domains/srikalahastikalamkari.in/public_html/.builds/source/

# Move files from nested folder to root
mv shri_kalahsti_kalamkari/* .
mv shri_kalahsti_kalamkari/.[!.]* . 2>/dev/null || true
rmdir shri_kalahsti_kalamkari 2>/dev/null || rm -rf shri_kalahsti_kalamkari

# Verify structure
ls -la
# You should see: src/  .next/  public/  package.json  (at root level)
```

4. **Install & Build:**

```bash
npm ci --production
npm run build
npm start
```


## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

## WhatsApp Number

Business WhatsApp: +91 72888 48881

## Tech Stack

- Next.js 14.2.35 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase
- Razorpay
