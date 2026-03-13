create extension if not exists pgcrypto;

create table if not exists public.client_signups (
  id uuid primary key default gen_random_uuid(),
  signup_reference uuid not null unique,
  company_name text not null,
  client_full_name text not null,
  email text not null,
  plan_id text not null,
  plan_name text not null,
  amount_zar integer not null,
  auth0_user_id text,
  payment_reference text unique,
  payment_status text not null default 'initialized',
  payment_provider text not null default 'paystack',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists client_signups_email_idx on public.client_signups (email);
create index if not exists client_signups_created_at_idx on public.client_signups (created_at desc);

alter table public.client_signups enable row level security;

create policy "Allow service role to manage client signups"
on public.client_signups
as permissive
for all
to service_role
using (true)
with check (true);
