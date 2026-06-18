# GigaBike — Supabase setup

The public site and admin panel share one Supabase project. Until it's connected,
`apps/web` renders from the bundled seed (`packages/supabase/src/seed.ts`), so you can
build the UI first and wire the database whenever you're ready.

## Option A — Hosted project (recommended for going live)

1. Create a project at [supabase.com](https://supabase.com) → **New project**. Note the
   project URL and the **anon** + **service_role** keys (Project Settings → API).
2. Open **SQL Editor** and run, in order:
   - `migrations/0001_init.sql`  (tables + Row Level Security)
   - `migrations/0002_storage.sql` (bike image storage bucket + policies)
   - `migrations/0003_admin_allowlist.sql` (only allowlisted admin users can write)
   - `seed.sql`                  (categories, bikes, repair services, shop record)
3. Create the admin user: **Authentication → Users → Add user** (email + password,
   "Auto Confirm"). This is the login for the admin panel.
4. Copy that user's UUID from **Authentication → Users**, then add it to the allowlist:
   ```sql
   insert into public.admin_users (user_id)
   values ('PASTE-AUTH-USER-UUID-HERE');
   ```
5. Disable public signup: **Authentication → Sign In / Providers → Email** and turn off
   **Allow new users to sign up**.
6. Fill env vars (copy `.env.example`):
   - `apps/web/.env.local` → `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `apps/admin/.env.local` → same two, **plus** `SUPABASE_SERVICE_ROLE_KEY`

## Option B — Local dev with the Supabase CLI

Requires Docker.

```bash
npm i -g supabase          # or: npx supabase ...
supabase init              # once, if supabase/config.toml is missing
supabase start             # boots local Postgres + Studio
supabase db reset          # applies migrations/ then seed.sql
supabase status            # prints the local URL + anon/service keys
```

Put the printed local URL + keys into the apps' `.env.local`.

## Regenerating TypeScript types

The hand-authored types live in `packages/supabase/src/database.types.ts`. Once a project
exists you can regenerate them:

```bash
supabase gen types typescript --project-id <ref> > packages/supabase/src/database.types.ts
# or local:
supabase gen types typescript --local > packages/supabase/src/database.types.ts
```

## Security model

- **Read**: `anon` can `SELECT` every public table — that's the website.
- **Write**: only authenticated users listed in `public.admin_users` can insert/update/delete.
- The `service_role` key is used **only** by the admin app, server-side. Never expose it to
  the public web app or the browser.
- Storage bucket `bike-images` is public-read. Direct authenticated writes are limited to
  allowlisted admins; server-side admin image actions still use the service-role key after
  checking the logged-in user.
