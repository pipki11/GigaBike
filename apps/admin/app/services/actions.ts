"use server";

import { revalidatePath } from "next/cache";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export type PriceUpdate = { id: string; price: string };
export type ServicesResult = { ok: true } | { ok: false; error: "noenv" | "generic" };

export async function updateServicePrices(updates: PriceUpdate[]): Promise<ServicesResult> {
  if (!hasSupabaseEnv()) return { ok: false, error: "noenv" };
  if (updates.length === 0) return { ok: true };

  const supabase = await createClient();
  for (const u of updates) {
    const { error } = await supabase
      .from("repair_services")
      .update({ price: u.price.trim() })
      .eq("id", u.id);
    if (error) return { ok: false, error: "generic" };
  }

  revalidatePath("/services");
  revalidatePath("/repair");
  revalidatePath("/");
  return { ok: true };
}
