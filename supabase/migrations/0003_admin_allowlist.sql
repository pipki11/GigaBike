-- ===========================================================
-- GigaBike - restrict admin writes to explicit allowlisted users
--
-- After this migration, being merely "authenticated" is not enough
-- to edit catalog/settings/storage. Add your real admin auth user id
-- to public.admin_users after creating the user in Supabase Auth:
--
--   insert into public.admin_users (user_id)
--   values ('00000000-0000-0000-0000-000000000000');
-- ===========================================================

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Security-definer helper lets policies check the allowlist without
-- exposing the admin_users table through broad select policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Replace old broad write policies.
drop policy if exists "admin write categories" on public.categories;
drop policy if exists "admin write bikes" on public.bikes;
drop policy if exists "admin write repair_groups" on public.repair_groups;
drop policy if exists "admin write repair_services" on public.repair_services;
drop policy if exists "admin write shop_settings" on public.shop_settings;

create policy "admin write categories"
  on public.categories for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin write bikes"
  on public.bikes for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin write repair_groups"
  on public.repair_groups for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin write repair_services"
  on public.repair_services for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin write shop_settings"
  on public.shop_settings for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Storage writes are mostly done by the server-side service role, but
-- keep direct authenticated storage access limited to allowlisted admins.
drop policy if exists "admin insert bike-images" on storage.objects;
drop policy if exists "admin update bike-images" on storage.objects;
drop policy if exists "admin delete bike-images" on storage.objects;

create policy "admin insert bike-images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'bike-images' and public.is_admin());

create policy "admin update bike-images"
  on storage.objects for update to authenticated
  using (bucket_id = 'bike-images' and public.is_admin())
  with check (bucket_id = 'bike-images' and public.is_admin());

create policy "admin delete bike-images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'bike-images' and public.is_admin());
