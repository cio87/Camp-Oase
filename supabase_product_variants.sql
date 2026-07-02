alter table public.products
  add column if not exists product_variants jsonb not null default '[]'::jsonb;
