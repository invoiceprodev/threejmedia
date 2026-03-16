create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.admin_clients (
  id uuid primary key default gen_random_uuid(),
  auth0_user_id text unique,
  signup_reference uuid unique,
  company_name text not null,
  primary_contact_name text,
  primary_email text not null,
  primary_phone text,
  status text not null default 'lead',
  source text not null default 'threejmedia.co.za',
  tags text[] not null default '{}',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.admin_clients add column if not exists auth0_user_id text;
alter table public.admin_clients add column if not exists signup_reference uuid;
alter table public.admin_clients add column if not exists company_name text;
alter table public.admin_clients add column if not exists primary_contact_name text;
alter table public.admin_clients add column if not exists primary_email text;
alter table public.admin_clients add column if not exists primary_phone text;
alter table public.admin_clients add column if not exists status text not null default 'lead';
alter table public.admin_clients add column if not exists source text not null default 'threejmedia.co.za';
alter table public.admin_clients add column if not exists tags text[] not null default '{}';
alter table public.admin_clients add column if not exists notes text;
alter table public.admin_clients add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.admin_clients add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.admin_clients add column if not exists updated_at timestamptz not null default timezone('utc', now());

create unique index if not exists admin_clients_auth0_user_id_idx on public.admin_clients (auth0_user_id);
create unique index if not exists admin_clients_signup_reference_idx on public.admin_clients (signup_reference);
create index if not exists admin_clients_primary_email_idx on public.admin_clients (primary_email);
create index if not exists admin_clients_company_name_idx on public.admin_clients (company_name);
create index if not exists admin_clients_status_idx on public.admin_clients (status);
create index if not exists admin_clients_created_at_idx on public.admin_clients (created_at desc);

drop trigger if exists set_admin_clients_updated_at on public.admin_clients;
create trigger set_admin_clients_updated_at
before update on public.admin_clients
for each row
execute function public.set_updated_at();

alter table public.admin_clients enable row level security;

create policy "Allow service role to manage admin clients"
on public.admin_clients
as permissive
for all
to service_role
using (true)
with check (true);
