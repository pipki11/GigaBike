-- ===========================================================
-- GigaBike — Storage: bike-images bucket
-- Public read (served via the public object URL); writes are done
-- server-side with the service-role key from the admin app, so the
-- authenticated policies below are belt-and-suspenders for any future
-- client-side uploads. Run once on a fresh project (the policy
-- statements error if they already exist). The bucket insert is
-- idempotent. On an already-set-up project the bucket may already
-- exist (created via the Storage API) — that's fine.
-- ===========================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bike-images', 'bike-images', true, 5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

-- Public can read objects in this bucket
create policy "public read bike-images"
  on storage.objects for select
  using (bucket_id = 'bike-images');

-- Authenticated (admin) sessions may add / change / remove objects
create policy "admin insert bike-images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'bike-images');
create policy "admin update bike-images"
  on storage.objects for update to authenticated
  using (bucket_id = 'bike-images');
create policy "admin delete bike-images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'bike-images');
