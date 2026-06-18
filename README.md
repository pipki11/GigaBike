# GigaBike

A family bicycle shop + repair workshop in Tbilisi — public website and admin panel.
Built as a **pnpm + Turborepo monorepo** with **Next.js 15 (App Router)** and **Supabase**.

The site sells by contact (Call / WhatsApp / Facebook) — there is **no cart/checkout**.
It is trilingual: **Georgian (default) · English · Russian**.

## Structure

```
apps/
  web/      Public site        → gigabike.ge
  admin/    Admin panel        → admin.gigabike.ge   (auth gate + login; CRUD next pass)
packages/
  ui/       Design tokens (oklch) + base CSS + shared Icon
  supabase/ Domain types, typed data accessors, seed data, public client
supabase/   SQL migrations, seed, setup README
```

Two apps deploy as **two Vercel projects from this one repo** → two subdomains. Auth cookies
are scoped to the admin subdomain, and the apps deploy independently while sharing the design
system and Supabase types.

## Tech

- **Next.js 15 / React 19 / TypeScript**, App Router, RSC by default with small client islands.
- **i18n**: locale-prefixed routes (`/ka`, `/en`, `/ru`) + middleware default-locale redirect.
  UI strings live in `apps/web/lib/messages/*.json`; product & repair-service names are stored
  **per-locale in the database** (real names stay real across languages).
- **Fonts** via `next/font`: Source Serif 4 + Hanken Grotesk (Latin), Noto Serif/Sans Georgian
  (Georgian glyphs render in a soft humanist face — the fix the design iterated to).
- **Supabase**: Postgres (bikes, categories, repair groups/services, shop settings) with Row
  Level Security (public read, admin write), Auth (email/password) for the admin.
- **Styling**: the approved design's hand-written CSS + oklch token system, ported as-is.

## Getting started

```bash
pnpm install
pnpm dev            # web on :3000, admin on :3001
# or individually:
pnpm dev:web
pnpm dev:admin
```

**The web app runs with no setup** — without Supabase env it renders from the bundled seed
(`packages/supabase/src/seed.ts`), so the public site is fully browsable immediately.

### Connecting Supabase

See [`supabase/README.md`](supabase/README.md). In short: create a project, run
`supabase/migrations/0001_init.sql` then `supabase/seed.sql`, add an admin user, and set:

- `apps/web/.env.local` → `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `apps/admin/.env.local` → the same two, plus `SUPABASE_SERVICE_ROLE_KEY`

Copy `.env.example` for the full list.

## Scripts

| command | what |
|---|---|
| `pnpm dev` | run both apps (Turbo) |
| `pnpm build` | build both apps |
| `pnpm typecheck` | type-check all packages/apps |
| `pnpm lint` | lint |

## Status (this pass)

- ✅ Public site: Home, Catalog (search/filter/sort + mobile drawer), Product, Repair — all
  trilingual, reading from Supabase with a seed fallback. Responsive, pixel-faithful to the design.
- ✅ Supabase schema, seed, RLS, setup docs.
- ✅ Admin app scaffolded: real Supabase Auth, middleware guard, branded login screen.
- ⏭️ Next: admin CRUD (bikes, repair prices, settings), image upload to Supabase Storage,
  standalone About/Contact pages, and deploy config (two Vercel projects + subdomain DNS).
