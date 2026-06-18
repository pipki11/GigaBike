/* ===========================================================
   Public (anon) Supabase client — read-only access for both apps.
   Returns null when env is unset so callers can fall back to seed.
   =========================================================== */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let _client: SupabaseClient<Database> | null | undefined;

export function getPublicClient(): SupabaseClient<Database> | null {
  if (_client !== undefined) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes("YOUR-PROJECT")) {
    _client = null;
    return _client;
  }

  _client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

export function isSupabaseConfigured(): boolean {
  return getPublicClient() !== null;
}
