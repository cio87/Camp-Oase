-- Camp Oase checkout preparation
-- Run this in Supabase SQL editor when you are ready to prepare future orders.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_address jsonb default '{}'::jsonb,
  billing_address jsonb default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  shipping_cost numeric not null default 0,
  total numeric not null default 0,
  payment_status text not null default 'unpaid',
  order_status text not null default 'draft',
  payment_provider text,
  payment_reference text,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "Admins can manage orders" on public.orders;
create policy "Admins can manage orders"
on public.orders
for all
to authenticated
using (true)
with check (true);

-- Optional for later guest checkout:
-- This allows anonymous visitors to create orders, but not read them.
-- Keep this policy disabled until the public checkout form is intentionally enabled.
-- create policy "Guests can create orders"
-- on public.orders
-- for insert
-- to anon
-- with check (true);

alter table public.site_settings
  add column if not exists checkout_enabled boolean not null default false,
  add column if not exists payment_enabled boolean not null default false,
  add column if not exists checkout_notice text;
