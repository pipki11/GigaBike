-- ===========================================================
-- GigaBike — initial schema + Row Level Security
-- Public (anon) read everywhere; writes require an authenticated
-- (admin) session. Mirrors packages/supabase domain types.
-- ===========================================================

-- ---------- categories ----------
create table if not exists public.categories (
  id      text primary key,
  name_en text not null,
  name_ka text not null default '',
  name_ru text not null default '',
  blurb   text not null default '',
  hue     int  not null default 293,
  sort    int  not null default 0
);

-- ---------- bikes ----------
create table if not exists public.bikes (
  id          text primary key default gen_random_uuid()::text,
  slug        text not null unique,
  name        text not null,
  category_id text not null references public.categories(id) on delete restrict,
  price       int  not null default 0,
  condition   text not null default 'New' check (condition in ('New','Used')),
  featured    boolean not null default false,
  description text not null default '',
  keywords    text[] not null default '{}',
  gallery     int  not null default 3,
  hue         int  not null default 293,
  image_urls  text[] not null default '{}',
  created_at  timestamptz not null default now()
);
create index if not exists bikes_category_idx on public.bikes(category_id);
create index if not exists bikes_featured_idx on public.bikes(featured);

-- ---------- repair groups ----------
create table if not exists public.repair_groups (
  id       text primary key,
  icon     text not null default 'wrench',
  title_en text not null,
  title_ka text not null default '',
  title_ru text not null default '',
  blurb_en text not null default '',
  blurb_ka text not null default '',
  blurb_ru text not null default '',
  sort     int  not null default 0
);

-- ---------- repair services ----------
create table if not exists public.repair_services (
  id       uuid primary key default gen_random_uuid(),
  group_id text not null references public.repair_groups(id) on delete cascade,
  price    text not null default '',
  name_en  text not null,
  name_ka  text not null default '',
  name_ru  text not null default '',
  sort     int  not null default 0
);
create index if not exists repair_services_group_idx on public.repair_services(group_id);

-- ---------- shop settings (single row) ----------
create table if not exists public.shop_settings (
  id       int primary key default 1 check (id = 1),
  name     text not null default 'GigaBike',
  tagline  text not null default '',
  phone    text not null default '',
  whatsapp text not null default '',
  facebook text not null default '',
  email    text not null default '',
  address  text not null default '',
  hours    text not null default ''
);

-- ===========================================================
-- Row Level Security
-- ===========================================================
alter table public.categories      enable row level security;
alter table public.bikes           enable row level security;
alter table public.repair_groups   enable row level security;
alter table public.repair_services enable row level security;
alter table public.shop_settings   enable row level security;

-- Public read for everyone (anon + authenticated)
create policy "public read categories"      on public.categories      for select using (true);
create policy "public read bikes"            on public.bikes           for select using (true);
create policy "public read repair_groups"    on public.repair_groups   for select using (true);
create policy "public read repair_services"  on public.repair_services for select using (true);
create policy "public read shop_settings"    on public.shop_settings   for select using (true);

-- Writes require an authenticated (admin) session
create policy "admin write categories"      on public.categories      for all to authenticated using (true) with check (true);
create policy "admin write bikes"            on public.bikes           for all to authenticated using (true) with check (true);
create policy "admin write repair_groups"    on public.repair_groups   for all to authenticated using (true) with check (true);
create policy "admin write repair_services"  on public.repair_services for all to authenticated using (true) with check (true);
create policy "admin write shop_settings"    on public.shop_settings   for all to authenticated using (true) with check (true);
