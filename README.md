# Shri Kailash Kalamkari

Heritage hand-painted Kalamkari sarees e-commerce platform built with Next.js 14.

## Deployment Guide

### Recommended: GitHub auto deploy

Use the `main` branch as the production branch.

#### Vercel

This repo includes `.github/workflows/vercel-production.yml`, which deploys to Vercel production on every push to `main` after these GitHub repository secrets are added:

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

The local project is linked to Vercel project `srikalahasti-kalamkari`; use the matching Vercel project/org values when creating the secrets.

#### Hostinger

In Hostinger hPanel, deploy the app as a Node.js Web App from GitHub:

1. Connect GitHub repository `code-harmony0/shri_kailash_kalamkari`
2. Select branch `main`
3. Set Node.js version to `24.x`
4. Set build command:
   ```bash
   npm run build
   ```
5. Set start command or entry point:
   ```bash
   server.js
   ```
6. Add the environment variables listed below in Hostinger deployment settings.

After this, pushes to `main` should trigger the connected production deployment.

### Fallback: Create ZIP manually

```bash
npm run deploy
```

This builds the app, then zips the Next.js build output, source files, Supabase migration SQL files, and required runtime config for upload.

Upload to Hostinger only if GitHub auto deploy is unavailable:

1. Upload `deploy.zip` via File Manager to `.builds/source/`
2. Extract it
3. In Hostinger Node.js app settings, set **Entry Point** to:
   ```
   server.js
   ```
4. Hostinger will run `npm install` + `npm run build` automatically
   - Then it starts `server.js`

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
