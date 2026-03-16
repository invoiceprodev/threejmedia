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

create table if not exists public.admin_subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.admin_clients(id) on delete cascade,
  signup_reference uuid,
  plan_id text not null,
  plan_name text not null,
  status text not null default 'draft',
  billing_cycle text not null default 'once_off',
  amount_zar integer not null default 0,
  currency text not null default 'ZAR',
  payment_provider text not null default 'paystack',
  payment_reference text,
  starts_at timestamptz,
  renews_at timestamptz,
  paid_at timestamptz,
  cancelled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.admin_subscriptions add column if not exists client_id uuid;
alter table public.admin_subscriptions add column if not exists signup_reference uuid;
alter table public.admin_subscriptions add column if not exists plan_id text;
alter table public.admin_subscriptions add column if not exists plan_name text;
alter table public.admin_subscriptions add column if not exists status text not null default 'draft';
alter table public.admin_subscriptions add column if not exists billing_cycle text not null default 'once_off';
alter table public.admin_subscriptions add column if not exists amount_zar integer not null default 0;
alter table public.admin_subscriptions add column if not exists currency text not null default 'ZAR';
alter table public.admin_subscriptions add column if not exists payment_provider text not null default 'paystack';
alter table public.admin_subscriptions add column if not exists payment_reference text;
alter table public.admin_subscriptions add column if not exists starts_at timestamptz;
alter table public.admin_subscriptions add column if not exists renews_at timestamptz;
alter table public.admin_subscriptions add column if not exists paid_at timestamptz;
alter table public.admin_subscriptions add column if not exists cancelled_at timestamptz;
alter table public.admin_subscriptions add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.admin_subscriptions add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.admin_subscriptions add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.admin_subscriptions
  drop constraint if exists admin_subscriptions_client_id_fkey;

alter table public.admin_subscriptions
  add constraint admin_subscriptions_client_id_fkey
  foreign key (client_id) references public.admin_clients(id) on delete cascade;

create index if not exists admin_subscriptions_client_id_idx on public.admin_subscriptions (client_id);
create index if not exists admin_subscriptions_status_idx on public.admin_subscriptions (status);
create index if not exists admin_subscriptions_renews_at_idx on public.admin_subscriptions (renews_at);
create index if not exists admin_subscriptions_created_at_idx on public.admin_subscriptions (created_at desc);
create unique index if not exists admin_subscriptions_payment_reference_idx on public.admin_subscriptions (payment_reference)
where payment_reference is not null;

drop trigger if exists set_admin_subscriptions_updated_at on public.admin_subscriptions;
create trigger set_admin_subscriptions_updated_at
before update on public.admin_subscriptions
for each row
execute function public.set_updated_at();

alter table public.admin_subscriptions enable row level security;

create policy "Allow service role to manage admin subscriptions"
on public.admin_subscriptions
as permissive
for all
to service_role
using (true)
with check (true);
