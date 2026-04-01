# Shri Kailash Kalamkari

Heritage hand-painted Kalamkari sarees e-commerce platform built with Next.js 14.

## Deployment Guide

### Files to Include in ZIP

When deploying to Hostinger (or any shared hosting), zip these files:

```
.next/           # Build output (required)
public/          # Static assets (images, fonts)
package.json     # Dependencies
yarn.lock        # Lock file for exact versions
next.config.mjs  # Next.js configuration
.env.local       # Environment variables (Supabase keys, etc.)
```

### Create Deployment ZIP

Run this command in project root:

```bash
zip -r deploy.zip .next public package.json yarn.lock next.config.mjs .env.local
```

### What NOT to Include

- `tests/` - Test files (not needed in production)
- `node_modules/` - Will be installed on server
- `src/` - Already compiled into .next/
- `.git/` - Git history
- `.yarn/`, `.swc/`, `.vercel/` - Cache folders

### Hostinger Setup

1. Build the project: `yarn build`
2. Create zip using command above
3. Upload zip to Hostinger
4. Extract files
5. Run: `yarn install --production`
6. Start: `yarn start`

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
