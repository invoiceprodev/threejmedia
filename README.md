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
| `SUPABASE_URL` | Railway / server | Supabase project URL used by the Railway API |
| `SUPABASE_SERVICE_ROLE_KEY` | Railway / server | Supabase service role key used for secure inserts from the API |
| `SUPABASE_NEWSLETTER_TABLE` | Railway / server | Supabase table name for newsletter signups |
| `ALLOWED_ORIGIN` | Railway / server | Frontend origin allowed to call the Railway API, for example `https://threejmedia.co.za` in production or `http://localhost:5173` locally |
| `PORT` | Railway / server | Port used by the Railway API locally and in deployment |

3. In Supabase SQL Editor, run [`supabase/newsletter_subscribers.sql`](/Users/jerry/Desktop/threejmedia.co.za/supabase/newsletter_subscribers.sql).
4. Run the frontend with `npm run dev`.
5. Run the API with `npm run dev:api`.

## Railway setup

1. Create a new Railway service from this repo.
2. Railway will use [`railway.json`](/Users/jerry/Desktop/threejmedia.co.za/railway.json) and start `node api/index.js`.
3. Add these Railway variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_NEWSLETTER_TABLE`
   - `ALLOWED_ORIGIN`
   - `PORT`
4. Set `ALLOWED_ORIGIN` to your deployed frontend URL, for example `https://threejmedia.co.za`.

## Current API routes

- `GET /health`
- `POST /api/newsletter`

The newsletter form now posts to `VITE_API_BASE_URL/api/newsletter` and stores subscribers in Supabase.
