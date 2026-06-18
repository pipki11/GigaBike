/* ===========================================================
   Typed data accessors. Each tries Supabase; on missing env or
   any error it falls back to the bundled seed so the site always
   renders. Safe to call from React Server Components.
   =========================================================== */
import { getPublicClient } from "./client";
import { SEED_BIKES, SEED_CATEGORIES, SEED_REPAIR_GROUPS, SEED_SHOP } from "./seed";
import type { Bike, Category, RepairGroup, RepairServiceItem, ShopSettings } from "./types";

export async function getCategories(): Promise<Category[]> {
  const sb = getPublicClient();
  if (!sb) return SEED_CATEGORIES;
  const { data, error } = await sb.from("categories").select("*").order("sort");
  if (error || !data || data.length === 0) return SEED_CATEGORIES;
  return data as Category[];
}

export async function getBikes(): Promise<Bike[]> {
  const sb = getPublicClient();
  if (!sb) return SEED_BIKES;
  const { data, error } = await sb
    .from("bikes")
    .select("*")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return SEED_BIKES;
  return data as Bike[];
}

export async function getFeaturedBikes(limit = 4): Promise<Bike[]> {
  const bikes = await getBikes();
  return bikes.filter((b) => b.featured).slice(0, limit);
}

export async function getBikeBySlug(slug: string): Promise<Bike | null> {
  const sb = getPublicClient();
  if (!sb) return SEED_BIKES.find((b) => b.slug === slug) ?? null;
  const { data, error } = await sb.from("bikes").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return SEED_BIKES.find((b) => b.slug === slug) ?? null;
  return data as Bike;
}

export async function getRepairGroups(): Promise<RepairGroup[]> {
  const sb = getPublicClient();
  if (!sb) return SEED_REPAIR_GROUPS;
  const { data, error } = await sb
    .from("repair_groups")
    .select("*, repair_services(*)")
    .order("sort")
    .order("sort", { referencedTable: "repair_services" });
  if (error || !data || data.length === 0) return SEED_REPAIR_GROUPS;

  return data.map((g: Record<string, unknown>): RepairGroup => {
    const items = ((g.repair_services as RepairServiceItem[]) ?? [])
      .slice()
      .sort((a, b) => a.sort - b.sort);
    return {
      id: g.id as string,
      icon: g.icon as string,
      title_en: g.title_en as string,
      title_ka: g.title_ka as string,
      title_ru: g.title_ru as string,
      blurb_en: g.blurb_en as string,
      blurb_ka: g.blurb_ka as string,
      blurb_ru: g.blurb_ru as string,
      sort: g.sort as number,
      items,
    };
  });
}

export async function getShop(): Promise<ShopSettings> {
  const sb = getPublicClient();
  if (!sb) return SEED_SHOP;
  const { data, error } = await sb.from("shop_settings").select("*").limit(1).maybeSingle();
  if (error || !data) return SEED_SHOP;
  return {
    name: data.name,
    tagline: data.tagline,
    phone: data.phone,
    whatsapp: data.whatsapp,
    facebook: data.facebook,
    email: data.email,
    address: data.address,
    hours: data.hours,
  };
}
