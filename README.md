# mentor.ai

AI-powered LMS with custom voice companions, Supabase auth, and Stripe subscriptions.

## Table of Contents

1. [Stack](#stack)
2. [Features](#features)
3. [Local Setup](#local-setup)
4. [Environment Variables](#environment-variables)
5. [Supabase Setup](#supabase-setup)
6. [Google Auth Setup](#google-auth-setup)
7. [Stripe Setup](#stripe-setup)
8. [Build and Deploy](#build-and-deploy)
9. [Current Notes](#current-notes)

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth + PostgreSQL + Row Level Security)
- Stripe (checkout + webhooks)
- Vapi Web SDK for real-time voice sessions

## Features

1. Subscription checkout: Stripe-powered Free to Pro upgrade flow enables monetization.
2. Secure authentication: Supabase auth protects user accounts and private data access.
3. AI voice tutoring: Real-time Vapi sessions provide interactive, spoken learning support.
4. Companion builder: Users can create and manage personalized AI tutors by topic and style.
5. Companion discovery: Search and filter help learners quickly find relevant companions.
6. Session history: Past sessions are saved so learners can track their progress.
7. Bookmarks: Users can save favorite companions for faster repeat learning.
8. Google OAuth: One-click social sign-in reduces friction during onboarding.

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create env file

Use `.env.local` in the project root.

### 3. Setup database schema

Run SQL from [supabase/schema.sql](supabase/schema.sql) in Supabase SQL Editor.

### 4. Start dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Add these to `.env.local` (local) and Vercel project env vars (production):

```env
# Vapi
NEXT_PUBLIC_VAPI_WEB_TOKEN=
# Optional right now (not used by current code paths, but safe to keep)
VAPI_PRIVATE_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
# Set at least one of these two:
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=

# App limits
MAX_FREE_COMPANIONS=3

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
# Optional metadata/reference
STRIPE_PRODUCT_ID=

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Supabase Setup

1. Create a Supabase project.
2. Copy Project URL and Anon (or Publishable) key to env vars.
3. Open SQL Editor and run [supabase/schema.sql](supabase/schema.sql).
4. In Authentication -> URL Configuration:
	- Set Site URL (example: `https://youraimentor.vercel.app`)
	- Add Redirect URLs:
	  - `http://localhost:3000/auth/callback`
	  - `https://youraimentor.vercel.app/auth/callback`
5. Verify Row Level Security policies are enabled for companions, bookmarks, and session history tables (included in [supabase/schema.sql](supabase/schema.sql)).

## Google Auth Setup

1. In Supabase -> Authentication -> Providers, enable Google.
2. In Google Cloud Console:
	- Configure OAuth consent screen.
	- Create OAuth Client ID (Web application).
	- Add Authorized redirect URI:
	  - `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
3. Copy Google Client ID + Client Secret into Supabase Google provider settings.
4. Test sign-in from your auth page.

## Stripe Setup

1. Create or open your Stripe product.
2. Create a recurring Price for the Pro plan and copy its `price_...` id.
3. Set `STRIPE_PRO_PRICE_ID` with that value.
4. Create webhook endpoint:
	- Local: `http://localhost:3000/api/stripe/webhook`
	- Production: `https://youraimentor.vercel.app/api/stripe/webhook`
5. Subscribe at least these events:
	- `checkout.session.completed`
	- `customer.subscription.deleted`
6. Copy webhook signing secret (`whsec_...`) to `STRIPE_WEBHOOK_SECRET`.

### Optional but recommended Stripe events

- `customer.subscription.updated`
- `invoice.payment_failed`
- `invoice.paid`

## Build and Deploy

### Build locally

```bash
npm run build
```

### Deploy on Vercel

1. Import repository to Vercel.
2. Add all required environment variables.
3. Build command: `npm run build`
4. Install command: `npm install`
5. Redeploy after each env change.