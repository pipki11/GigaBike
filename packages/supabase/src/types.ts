/* ===========================================================
   GigaBike — shared domain types (mirror the Supabase schema)
   =========================================================== */

export type Locale = "ka" | "en" | "ru";
export const LOCALES: Locale[] = ["ka", "en", "ru"];
export const DEFAULT_LOCALE: Locale = "ka";

export type Condition = "New" | "Used";

export interface Category {
  id: string;
  name_en: string;
  name_ka: string;
  name_ru: string;
  blurb: string;
  hue: number;
  sort: number;
}

export interface Bike {
  id: string;
  slug: string;
  name: string;
  category_id: string;
  price: number;
  condition: Condition;
  featured: boolean;
  description: string;
  keywords: string[];
  gallery: number;
  hue: number;
  image_urls: string[];
}

export interface RepairServiceItem {
  id: string;
  group_id: string;
  /** e.g. "15 ₾" — empty string means "ask for price" */
  price: string;
  name_en: string;
  name_ka: string;
  name_ru: string;
  sort: number;
}

export interface RepairGroup {
  id: string;
  icon: string;
  title_en: string;
  title_ka: string;
  title_ru: string;
  blurb_en: string;
  blurb_ka: string;
  blurb_ru: string;
  sort: number;
  items: RepairServiceItem[];
}

export interface ShopSettings {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  facebook: string;
  email: string;
  address: string;
  hours: string;
}

/* ---------- localized accessors ---------- */
export function categoryName(c: Category | undefined, locale: Locale): string {
  if (!c) return "";
  return locale === "ka" ? c.name_ka : locale === "ru" ? c.name_ru : c.name_en;
}

export function serviceName(it: RepairServiceItem, locale: Locale): string {
  return locale === "ka" ? it.name_ka : locale === "ru" ? it.name_ru : it.name_en;
}

export function groupTitle(g: RepairGroup, locale: Locale): string {
  return locale === "ka" ? g.title_ka : locale === "ru" ? g.title_ru : g.title_en;
}

export function groupBlurb(g: RepairGroup, locale: Locale): string {
  return locale === "ka" ? g.blurb_ka : locale === "ru" ? g.blurb_ru : g.blurb_en;
}
