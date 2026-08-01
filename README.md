# Asana Care & Mental Wellness — website mock

Static mock for **asanacarementalwellness.com** — telepsychiatry practice of **Asana Aruna, MSN, APRN, PMHNP-BC** (Texas & California).

Live demo (GitHub Pages): the **main site** is the repo root; the **admin** is `admin.html`.

## Booking — goes to the practice's real scheduler accounts
The **Book your appointment** section shows two labeled links:
- **T — Book on Tebra** → `https://www.tebra.com/care/practice/asana-care-mental-wellness-884819`
- **Z — Book on Zocdoc** → `https://www.zocdoc.com/practice/asana-care-and-mental-wellness-144556`

Both open the practice's real scheduler so appointments land in the Tebra / Zocdoc accounts directly. A secondary **Send a request** form also emails the office (Web3Forms) and logs to the admin inbox.

## Pages
| File | What |
|---|---|
| `index.html` | Main site — SEO-tuned for Texas telepsychiatry, Tebra-style booking |
| `blog.html` | Blog — 10 shareable questions with **live comments** |
| `admin.html` | **Practice admin** — appointments inbox, blog add/update, comment moderation |
| `kit.html` | Public **marketing kit** — 5 flyers + 5 videos, share/print |
| `kit-admin.html` | **Kit manager** — edit flyer/video copy, grab share links |
| `data.js` | Shared data layer (Supabase when configured, else localStorage) |

Admin passcode (demo): **`asana2026`** — change `PASSCODE` in `admin.html` / `kit-admin.html` before real use.

## Real-time email (booking) — Web3Forms
The booking form emails **info@asanacarementalwellness.com** the moment a patient submits.
1. Go to [web3forms.com](https://web3forms.com), create an access key for `info@asanacarementalwellness.com`.
2. In `index.html` set the hidden `access_key` value, and in `data.js` set `WEB3FORMS_KEY`.
Until a key is set, the form falls back to a one-click `mailto:` to the office.

## Live & shared data (comments, appointments, blog) — Supabase (free)
Without keys, everything works in each visitor's browser (demo). To make comments/appointments/blog **live and shared for everyone**, add a free Supabase project:

1. Create a project at [supabase.com](https://supabase.com).
2. SQL editor → run:

```sql
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, question text not null, category text,
  excerpt text, body text, published boolean default true,
  created_at timestamptz default now());
create table comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null, name text not null, body text not null,
  status text default 'approved', created_at timestamptz default now());
create table appointments (
  id uuid primary key default gen_random_uuid(),
  reason text, first_name text, last_name text, email text, phone text,
  state text, patient_type text, preferred_date text, preferred_time text,
  message text, status text default 'new', created_at timestamptz default now());

alter table blog_posts enable row level security;
alter table comments enable row level security;
alter table appointments enable row level security;
-- Public read + public insert of comments/appointments (mock-friendly):
create policy "read posts"    on blog_posts   for select using (true);
create policy "read comments" on comments     for select using (true);
create policy "add comments"  on comments     for insert with check (true);
create policy "add appts"     on appointments for insert with check (true);
-- For a real launch, protect admin writes (post edits, moderation, appt updates)
-- behind Supabase Auth or a service role instead of the public anon key.
```

3. In `data.js` set `SUPABASE_URL` and `SUPABASE_ANON_KEY` (Project Settings → API).

## Hosting
Any static host. For GitHub Pages: Settings → Pages → deploy from `main` / root.

Brand: violet `#4a2a7a` + green `#6cb33f`. Serif display + system sans. 100% telehealth · Texas & California · Now accepting new patients.
