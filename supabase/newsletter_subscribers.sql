create extension if not exists pgcrypto;

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  source text not null default 'threejmedia.co.za',
  submitted_at timestamptz not null default timezone('utc', now())
);

create index if not exists newsletter_subscribers_submitted_at_idx
  on public.newsletter_subscribers (submitted_at desc);

alter table public.newsletter_subscribers enable row level security;

create policy "Allow service role to manage newsletter subscribers"
on public.newsletter_subscribers
as permissive
for all
to service_role
using (true)
with check (true);
