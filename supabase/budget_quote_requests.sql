create extension if not exists pgcrypto;

create table if not exists public.budget_quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  website_type_id text not null,
  addon_ids text[] not null default '{}',
  hosting_plan_id text not null,
  domain_option_id text not null,
  once_off_total integer not null default 0,
  monthly_total integer not null default 0,
  yearly_total integer not null default 0,
  summary jsonb,
  submitted_at timestamptz not null default timezone('utc', now())
);

create index if not exists budget_quote_requests_email_idx on public.budget_quote_requests (email);
create index if not exists budget_quote_requests_submitted_at_idx on public.budget_quote_requests (submitted_at desc);

alter table public.budget_quote_requests enable row level security;

create policy "Allow service role to manage budget quote requests"
on public.budget_quote_requests
as permissive
for all
to service_role
using (true)
with check (true);
