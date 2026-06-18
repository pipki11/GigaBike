// Canonical public origin, used by robots.ts / sitemap.ts and any absolute-URL
// metadata. Set NEXT_PUBLIC_SITE_URL in the web app's env (e.g. on Vercel) to the
// production domain; falls back to the live domain for local builds.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gigabike.ge"
).replace(/\/$/, "");
