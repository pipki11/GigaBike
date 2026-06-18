"use server";

import { revalidatePath } from "next/cache";
import type { ShopSettings } from "@gigabike/supabase";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export type SettingsResult = { ok: true } | { ok: false; error: "noenv" | "generic" };

export async function updateSettings(input: ShopSettings): Promise<SettingsResult> {
  if (!hasSupabaseEnv()) return { ok: false, error: "noenv" };

  const s = {
    name: input.name.trim(),
    tagline: input.tagline.trim(),
    phone: input.phone.trim(),
    whatsapp: input.whatsapp.trim(),
    facebook: input.facebook.trim(),
    email: input.email.trim(),
    address: input.address.trim(),
    hours: input.hours.trim(),
  };

  const supabase = await createClient();
  const { error } = await supabase.from("shop_settings").update(s).eq("id", 1);
  if (error) return { ok: false, error: "generic" };

  revalidatePath("/settings");
  revalidatePath("/");
  return { ok: true };
}
