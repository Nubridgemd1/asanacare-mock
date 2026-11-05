-- ============================================================
-- Oasis Behavioral Health — Photo storage setup
-- Run ONCE in Supabase: SQL Editor -> New query -> paste -> RUN.
-- Enables admin photo uploads (reel + About) that show on every device.
-- ============================================================

-- Public bucket that holds uploaded site photos
insert into storage.buckets (id, name, public)
values ('site-photos', 'site-photos', true)
on conflict (id) do update set public = true;

-- Anyone may READ photos (needed so visitors can see them)
drop policy if exists "oasis_photos_read" on storage.objects;
create policy "oasis_photos_read" on storage.objects
  for select to anon using (bucket_id = 'site-photos');

-- Admin (passcode-gated in the app) may UPLOAD / REPLACE photos
drop policy if exists "oasis_photos_insert" on storage.objects;
create policy "oasis_photos_insert" on storage.objects
  for insert to anon with check (bucket_id = 'site-photos');

drop policy if exists "oasis_photos_update" on storage.objects;
create policy "oasis_photos_update" on storage.objects
  for update to anon using (bucket_id = 'site-photos') with check (bucket_id = 'site-photos');

-- Done. Admin -> Photos tab can now upload images from any device.
