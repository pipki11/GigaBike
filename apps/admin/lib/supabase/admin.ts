import { createClient } from "@supabase/supabase-js";

/* Privileged, server-ONLY Supabase client (service-role key). Used for
   Storage uploads, which bypass RLS. Never import this from a client
   component — the secret key must never reach the browser. Always gate
   callers behind an authenticated-user check first. */
export function hasServiceKey(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR-PROJECT"),
  );
}

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
