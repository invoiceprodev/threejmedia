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
  selected_domain_name text,
  selected_domain_extension text,
  selected_domain_full text,
  domain_registration_years integer not null default 1,
  domain_registration_starts_at timestamptz,
  domain_auto_renew_at timestamptz,
  domain_fulfillment_status text not null default 'awaiting_payment',
  domain_fulfillment_notes text,
  domain_fulfillment_requested_at timestamptz,
  domain_fulfillment_completed_at timestamptz,
  domain_onboarding_details jsonb,
  auth0_user_id text,
  payment_reference text unique,
  payment_status text not null default 'initialized',
  payment_provider text not null default 'paystack',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.client_signups add column if not exists selected_domain_name text;
alter table public.client_signups add column if not exists selected_domain_extension text;
alter table public.client_signups add column if not exists selected_domain_full text;
alter table public.client_signups add column if not exists domain_registration_years integer not null default 1;
alter table public.client_signups add column if not exists domain_registration_starts_at timestamptz;
alter table public.client_signups add column if not exists domain_auto_renew_at timestamptz;
alter table public.client_signups add column if not exists domain_fulfillment_status text not null default 'awaiting_payment';
alter table public.client_signups add column if not exists domain_fulfillment_notes text;
alter table public.client_signups add column if not exists domain_fulfillment_requested_at timestamptz;
alter table public.client_signups add column if not exists domain_fulfillment_completed_at timestamptz;
alter table public.client_signups add column if not exists domain_onboarding_details jsonb;

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
