-- ============================================================
-- Oasis Behavioral Health — Supabase setup
-- Run this ONCE in your Supabase project:
--   Supabase dashboard  ->  SQL Editor  ->  New query
--   paste all of this, click RUN.
-- It creates the shared content store the website reads/writes.
-- ============================================================

create table if not exists public.site_content (
  key        text primary key,
  value      jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

-- Public site may READ the content (needed so every visitor sees it)
drop policy if exists "oasis_read" on public.site_content;
create policy "oasis_read" on public.site_content
  for select to anon using (true);

-- Admin (passcode-gated in the app) may WRITE the content
drop policy if exists "oasis_insert" on public.site_content;
create policy "oasis_insert" on public.site_content
  for insert to anon with check (true);

drop policy if exists "oasis_update" on public.site_content;
create policy "oasis_update" on public.site_content
  for update to anon using (true) with check (true);

grant select, insert, update on public.site_content to anon;

-- Done. The website uses the key 'config' for contact/provider details.
