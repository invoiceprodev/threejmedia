# Three J Media

Frontend: Vite + React
API: Railway-ready Node service in `api/`
Database: Supabase Postgres

## Local setup

1. Copy `.env.example` to `.env`.
2. Fill in the environment variables:

| Variable | Where it belongs | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Vercel / frontend | Base URL for the API, for example `https://api.threejmedia.co.za` in production or `http://localhost:3001` locally |
| `VITE_SUPABASE_URL` | Vercel / frontend | Public Supabase project URL for client-side usage |
| `VITE_SUPABASE_ANON_KEY` | Vercel / frontend | Public Supabase anon key for browser-safe access |
| `VITE_AUTH0_DOMAIN` | Vercel / frontend | Auth0 domain for future login flows |
| `VITE_AUTH0_CLIENT_ID` | Vercel / frontend | Auth0 SPA application client ID |
| `VITE_AUTH0_AUDIENCE` | Vercel / frontend | Auth0 API audience used to request access tokens for the Railway API |
| `SUPABASE_URL` | Railway / server | Supabase project URL used by the Railway API |
| `SUPABASE_SERVICE_ROLE_KEY` | Railway / server | Supabase service role key used for secure inserts from the API |
| `SUPABASE_NEWSLETTER_TABLE` | Railway / server | Supabase table name for newsletter signups |
| `SUPABASE_SIGNUPS_TABLE` | Railway / server | Supabase table name for plan signup and payment records |
| `ALLOWED_ORIGIN` | Railway / server | Frontend origin allowed to call the Railway API, for example `https://threejmedia.co.za` in production or `http://localhost:5173` locally |
| `AUTH0_DOMAIN` | Railway / server | Auth0 tenant domain used for database-connection signup |
| `AUTH0_CLIENT_ID` | Railway / server | Auth0 application client ID used for signup |
| `AUTH0_CONNECTION` | Railway / server | Auth0 database connection name |
| `AUTH0_AUDIENCE` | Railway / server | Auth0 API audience expected by protected Railway endpoints |
| `PAYSTACK_PUBLIC_KEY` | Railway / server | Paystack public key for future frontend payment tooling |
| `PAYSTACK_SECRET_KEY` | Railway / server | Paystack secret key used to initialize transactions |
| `PAYSTACK_CALLBACK_URL` | Railway / server | Return URL after Paystack checkout completes |
| `PORT` | Railway / server | Port used by the Railway API locally and in deployment |

3. In Supabase SQL Editor, run [`supabase/newsletter_subscribers.sql`](/Users/jerry/Desktop/threejmedia.co.za/supabase/newsletter_subscribers.sql) and [`supabase/client_signups.sql`](/Users/jerry/Desktop/threejmedia.co.za/supabase/client_signups.sql).
4. Run the frontend with `npm run dev`.
5. Run the API with `npm run dev:api`.

## Railway setup

1. Create a new Railway service from this repo.
2. Railway will use [`railway.json`](/Users/jerry/Desktop/threejmedia.co.za/railway.json) and start `node api/index.js`.
3. Add these Railway variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_NEWSLETTER_TABLE`
   - `SUPABASE_SIGNUPS_TABLE`
   - `ALLOWED_ORIGIN`
   - `AUTH0_DOMAIN`
   - `AUTH0_CLIENT_ID`
   - `AUTH0_CONNECTION`
   - `AUTH0_AUDIENCE`
   - `PAYSTACK_SECRET_KEY`
   - `PAYSTACK_CALLBACK_URL`
   - `PORT`
4. Set `ALLOWED_ORIGIN` to your deployed frontend URL, for example `https://threejmedia.co.za`.

## Auth0 settings

Use a SPA application for the frontend login flow and a regular Auth0 API identifier for Railway token protection.

- Allowed Callback URLs:
  - `http://localhost:5173/auth/callback`
  - `https://threejmedia.co.za/auth/callback`
- Allowed Logout URLs:
  - `http://localhost:5173`
  - `https://threejmedia.co.za`
- Allowed Web Origins:
  - `http://localhost:5173`
  - `https://threejmedia.co.za`
- `AUTH0_CONNECTION` should match your Auth0 database connection name
- `AUTH0_AUDIENCE` and `VITE_AUTH0_AUDIENCE` should match your Auth0 API Identifier

## Current API routes

- `GET /health`
- `POST /api/newsletter`
- `POST /api/signup`
- `GET /api/paystack/verify`
- `GET /api/me`

The newsletter form now posts to `VITE_API_BASE_URL/api/newsletter` and stores subscribers in Supabase. Pricing signups now post to `VITE_API_BASE_URL/api/signup`, create an Auth0 user, initialize Paystack checkout, and store the signup record in Supabase. After Paystack returns, `/payment/success` verifies the transaction and the protected `/dashboard` uses Auth0 access tokens against `GET /api/me`.
