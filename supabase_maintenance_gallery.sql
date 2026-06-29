create table if not exists public.site_settings (
  id text primary key,
  announcement_enabled boolean default false,
  announcement_text text default '',
  announcement_mode text default 'static',
  announcement_link text,
  checkout_enabled boolean default false,
  payment_enabled boolean default false,
  checkout_notice text,
  maintenance_enabled boolean not null default false,
  maintenance_title text,
  maintenance_text text,
  updated_at timestamptz default now()
);

alter table public.site_settings
  add column if not exists maintenance_enabled boolean not null default false,
  add column if not exists maintenance_title text,
  add column if not exists maintenance_text text;

alter table public.products
  add column if not exists gallery_images jsonb not null default '[]'::jsonb;

alter table public.site_settings enable row level security;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated can insert site settings" on public.site_settings;
create policy "Authenticated can insert site settings"
on public.site_settings
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated can update site settings" on public.site_settings;
create policy "Authenticated can update site settings"
on public.site_settings
for update
to authenticated
using (true)
with check (true);

insert into public.site_settings (id)
values ('main')
on conflict (id) do nothing;
