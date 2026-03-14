# Three J Media

Frontend: Vite + React
API: Railway-ready Node service in `api/`
Database: Supabase Postgres

## Local setup

1. Copy `.env.example` to `.env`.
2. Fill in the environment variables:

| Variable | Where it belongs | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Vercel / frontend | Primary base URL for the API, for example `https://api.threejmedia.co.za` in production. Leave it blank locally to use the Vite proxy |
| `VITE_API_FALLBACK_BASE_URL` | Vercel / frontend | Optional fallback API URL, for example `https://threejmedia-production.up.railway.app` while the custom domain is settling |
| `VITE_IMAGE_BASE_URL` | Vercel / frontend | Optional manual base URL for externally hosted frontend images, for example `https://cdn.example.com/threejmedia` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Vercel / frontend | Cloudinary cloud name used to build hosted marketing image URLs automatically |
| `VITE_CLOUDINARY_FOLDER` | Vercel / frontend | Optional Cloudinary folder that contains the marketing images |
| `VITE_SUPABASE_URL` | Vercel / frontend | Public Supabase project URL for client-side usage |
| `VITE_SUPABASE_ANON_KEY` | Vercel / frontend | Public Supabase anon key for browser-safe access |
| `VITE_AUTH0_DOMAIN` | Vercel / frontend | Auth0 domain for future login flows |
| `VITE_AUTH0_CLIENT_ID` | Vercel / frontend | Auth0 SPA application client ID |
| `VITE_AUTH0_AUDIENCE` | Vercel / frontend | Auth0 API audience used to request access tokens for the Railway API |
| `SUPABASE_URL` | Railway / server | Supabase project URL used by the Railway API |
| `SUPABASE_SERVICE_ROLE_KEY` | Railway / server | Supabase service role key used for secure inserts from the API |
| `SUPABASE_NEWSLETTER_TABLE` | Railway / server | Supabase table name for newsletter signups |
| `SUPABASE_SIGNUPS_TABLE` | Railway / server | Supabase table name for plan signup and payment records |
| `SUPABASE_BUDGET_QUOTES_TABLE` | Railway / server | Supabase table name for budget CTA quote requests |
| `ALLOWED_ORIGIN` | Railway / server | Frontend origins allowed to call the API. Use a comma-separated list such as `http://localhost:5173,https://threejmedia.co.za` |
| `AUTH0_DOMAIN` | Railway / server | Auth0 tenant domain used for database-connection signup |
| `AUTH0_CLIENT_ID` | Railway / server | Auth0 application client ID used for signup and server-side ID token verification |
| `AUTH0_CONNECTION` | Railway / server | Auth0 database connection name |
| `AUTH0_AUDIENCE` | Railway / server | Auth0 API audience expected by protected Railway endpoints |
| `PAYSTACK_PUBLIC_KEY` | Railway / server | Paystack public key for future frontend payment tooling |
| `PAYSTACK_SECRET_KEY` | Railway / server | Paystack secret key used to initialize transactions |
| `PAYSTACK_CALLBACK_URL` | Railway / server | Return URL after Paystack checkout completes |
| `RESEND_API_KEY` | Railway / server | Resend API key used for transactional emails |
| `RESEND_FROM_EMAIL` | Railway / server | Verified sender email used for quote confirmation emails |
| `RESEND_BUDGET_QUOTES_TO` | Railway / server | Comma-separated internal recipients for budget quote notifications |
| `DOMAIN_FULFILLMENT_ADMIN_TOKEN` | Railway / server | Shared secret required for the internal endpoint that submits stored onboarding details to HostAfrica |
| `PORT` | Railway / server | Port used by the Railway API locally and in deployment |

3. In Supabase SQL Editor, run [`supabase/newsletter_subscribers.sql`](/Users/jerry/Desktop/threejmedia.co.za/supabase/newsletter_subscribers.sql), [`supabase/client_signups.sql`](/Users/jerry/Desktop/threejmedia.co.za/supabase/client_signups.sql), and [`supabase/budget_quote_requests.sql`](/Users/jerry/Desktop/threejmedia.co.za/supabase/budget_quote_requests.sql).
4. Run both services together with `npm run dev:all`.
5. Or run them separately with `npm run dev` and `npm run dev:api`.
6. `npm run dev:all` starts the API without watch mode so it stays stable on machines with low file watcher limits.
7. The frontend dev server runs directly through Vite on `http://127.0.0.1:5173` for predictable local module serving.
8. For local frontend testing, leave `VITE_API_BASE_URL` empty so Vite proxies `/api/*` and `/health` to `http://localhost:3001` without browser CORS issues.
9. To serve marketing images from Cloudinary, upload the files with their current names such as `threejmedia_logo.png` and `portfolio-1.png`, then set `VITE_CLOUDINARY_CLOUD_NAME` and optionally `VITE_CLOUDINARY_FOLDER`.
10. If you prefer another CDN or storage provider, set `VITE_IMAGE_BASE_URL` to that folder URL instead. If both are blank, the app falls back to the bundled local images.

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
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `RESEND_BUDGET_QUOTES_TO`
   - `DOMAIN_FULFILLMENT_ADMIN_TOKEN`
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
- `AUTH0_CLIENT_ID` on Railway should match the SPA application client ID used by the frontend so the API can verify Auth0 ID tokens safely

## Security notes

- Protected API routes verify the Auth0 access token for API access and the Auth0 ID token for identity claims like `sub`, `email`, and `email_verified`
- The API no longer trusts browser-submitted email addresses, verification flags, or user IDs for signup continuation or dashboard lookup
- Keep `SUPABASE_SERVICE_ROLE_KEY`, `PAYSTACK_SECRET_KEY`, and `RESEND_API_KEY` only on Railway or local server env files, never in Vercel browser env vars
- For local frontend testing, leave `VITE_API_BASE_URL` empty so the Vite proxy handles `/api/*` and avoids unnecessary CORS exposure

## Current API routes

- `GET /health`
- `POST /api/newsletter`
- `POST /api/budget-quote`
- `POST /api/signup`
- `POST /api/signup/continue`
- `GET /api/paystack/verify`
- `GET /api/me`
- `POST /api/domain-fulfillment/onboarding`
- `POST /api/domain-fulfillment/submit`

The newsletter form now posts to `VITE_API_BASE_URL/api/newsletter` and stores subscribers in Supabase. The budget CTA posts to `VITE_API_BASE_URL/api/budget-quote` and stores custom quote requests in Supabase. Pricing signups now post to `VITE_API_BASE_URL/api/signup`, create an Auth0 user, and store the signup in a pending verification state. After the client confirms their email address, the app calls `POST /api/signup/continue` to initialize Paystack checkout. After Paystack returns, `/payment/success` verifies the transaction and the protected `/dashboard` uses Auth0 access tokens against `GET /api/me`.

For managed domain fulfillment:
- the customer submits registrant and nameserver details through `POST /api/domain-fulfillment/onboarding`
- an internal operator can then call `POST /api/domain-fulfillment/submit` with `X-Admin-Token: <DOMAIN_FULFILLMENT_ADMIN_TOKEN>`
- use `{"dryRun": true, "signupReference": "<uuid>"}` first, or replace `signupReference` with `domain`, to validate the stored payload before making a live HostAfrica submission
