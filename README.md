# Shri Kailash Kalamkari

Heritage hand-painted Kalamkari sarees e-commerce platform built with Next.js 14.

## Deployment Guide

### Step 1 — Create ZIP (run locally)

```bash
npm run deploy
```

This builds the app, then zips the Next.js build output, source files, Supabase migration SQL files, and required runtime config for upload.

### Step 2 — Upload to Hostinger

1. Upload `deploy.zip` via File Manager to `.builds/source/`
2. Extract it
3. In Hostinger Node.js app settings, set **Entry Point** to:
   ```
   server.js
   ```
4. Hostinger will run `npm install` + `npm run build` automatically
   - Then it starts `server.js`

That's it — no manual commands needed.

## Database

This project uses Supabase as the hosted production database, so there is no local SQLite/database file to upload to Hostinger. The deploy zip includes `supabase/migrations/*.sql` as schema reference files only; production data remains in the Supabase project configured by the environment variables.


## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CF_IMAGES_HASH=
CF_ACCOUNT_ID=
CF_IMAGES_TOKEN=
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
