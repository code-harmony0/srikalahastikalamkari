# Shri Kailash Kalamkari

Heritage hand-painted Kalamkari sarees e-commerce platform built with Next.js 14.

## Deployment Guide

### Step 1 — Create ZIP (run locally)

```bash
npm run deploy
```

This builds the app, copies static assets into the standalone bundle, then zips source files for upload.

### Step 2 — Upload to Hostinger

1. Upload `deploy.zip` via File Manager to `.builds/source/`
2. Extract it
3. In Hostinger Node.js app settings, set **Entry Point** to:
   ```
   .next/standalone/server.js
   ```
4. Hostinger will run `npm install` + `npm run build` automatically
   - `postbuild` script will copy static files into place
   - Then it starts `.next/standalone/server.js`

That's it — no manual commands needed.


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
