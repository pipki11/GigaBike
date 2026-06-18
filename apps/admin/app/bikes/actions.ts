"use server";

import { revalidatePath } from "next/cache";
import { getCategories, type Condition } from "@gigabike/supabase";
import { createAdminClient, hasServiceKey } from "@/lib/supabase/admin";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

const BIKE_IMAGES_BUCKET = "bike-images";

export type BikeInput = {
  id?: string;
  slug: string;
  name: string;
  category_id: string;
  price: number;
  condition: Condition;
  featured: boolean;
  description: string;
  keywords: string[];
  image_urls: string[];
};

export type ActionResult =
  | { ok: true }
  | { ok: false; error: "required" | "slug" | "generic" | "noenv" };

function clean(input: BikeInput) {
  const rawSlug = input.slug.trim();
  return {
    // Always slugify server-side: never trust the client's slug, and keep
    // it strictly [a-z0-9-] so it's safe to use in a PostgREST filter string.
    slug: rawSlug ? slugify(rawSlug) : "",
    name: input.name.trim(),
    category_id: input.category_id,
    price: Math.max(0, Math.round(Number(input.price) || 0)),
    condition: input.condition === "Used" ? "Used" : "New",
    featured: Boolean(input.featured),
    description: input.description.trim(),
    keywords: input.keywords.map((k) => k.trim()).filter(Boolean),
    image_urls: (input.image_urls ?? []).filter(Boolean).slice(0, 4),
  };
}

function invalid(b: ReturnType<typeof clean>) {
  return !b.name || !b.slug || !b.category_id;
}

/** Postgres unique-violation code (duplicate slug). */
function isUniqueViolation(error: { code?: string } | null) {
  return error?.code === "23505";
}

type Sb = Awaited<ReturnType<typeof createClient>>;

function bikeImagePath(url: string): string | null {
  const marker = `/object/public/${BIKE_IMAGES_BUCKET}/`;

  try {
    const parsed = new URL(url);
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex === -1) return null;
    return decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length));
  } catch {
    const markerIndex = url.indexOf(marker);
    if (markerIndex === -1) return null;
    const path = url.slice(markerIndex + marker.length).split("?")[0];
    return path ? decodeURIComponent(path) : null;
  }
}

async function deleteStoredBikeImages(supabase: Sb, urls: string[]) {
  const paths = [
    ...new Set(urls.map(bikeImagePath).filter((path): path is string => Boolean(path))),
  ];
  if (paths.length === 0) return true;

  const storageClient = hasServiceKey() ? createAdminClient() : supabase;
  const { error } = await storageClient.storage.from(BIKE_IMAGES_BUCKET).remove(paths);
  return !error;
}

/** Return `base`, or `base-2`, `base-3`… if it's already taken by another
    bike. Same-name bikes therefore get distinct URLs automatically rather
    than erroring. `excludeId` skips the row being edited. */
async function uniqueSlug(supabase: Sb, base: string, excludeId?: string): Promise<string> {
  const { data } = await supabase
    .from("bikes")
    .select("id, slug")
    .or(`slug.eq.${base},slug.like.${base}-*`);
  const taken = new Set(
    (data ?? [])
      .filter((r: { id: string; slug: string }) => r.id !== excludeId)
      .map((r: { slug: string }) => r.slug),
  );
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export async function createBike(input: BikeInput): Promise<ActionResult> {
  if (!hasSupabaseEnv()) return { ok: false, error: "noenv" };
  const b = clean(input);
  if (invalid(b)) return { ok: false, error: "required" };

  const categories = await getCategories();
  const hue = categories.find((c) => c.id === b.category_id)?.hue ?? 293;

  const supabase = await createClient();
  const slug = await uniqueSlug(supabase, b.slug);
  const { error } = await supabase
    .from("bikes")
    .insert({ ...b, slug, gallery: 3, hue });

  if (error) return { ok: false, error: isUniqueViolation(error) ? "slug" : "generic" };

  revalidatePath("/bikes");
  revalidatePath("/");
  return { ok: true };
}

export async function updateBike(input: BikeInput): Promise<ActionResult> {
  if (!hasSupabaseEnv()) return { ok: false, error: "noenv" };
  if (!input.id) return { ok: false, error: "generic" };
  const b = clean(input);
  if (invalid(b)) return { ok: false, error: "required" };

  const categories = await getCategories();
  const hue = categories.find((c) => c.id === b.category_id)?.hue ?? 293;

  const supabase = await createClient();
  const { data: oldBike, error: readError } = await supabase
    .from("bikes")
    .select("image_urls")
    .eq("id", input.id)
    .single();
  if (readError) return { ok: false, error: "generic" };

  const slug = await uniqueSlug(supabase, b.slug, input.id);
  const { error } = await supabase
    .from("bikes")
    .update({ ...b, slug, hue })
    .eq("id", input.id);

  if (error) return { ok: false, error: isUniqueViolation(error) ? "slug" : "generic" };

  const kept = new Set(b.image_urls);
  const removedImages = (oldBike.image_urls ?? []).filter((url: string) => !kept.has(url));
  const imagesDeleted = await deleteStoredBikeImages(supabase, removedImages);
  if (!imagesDeleted) return { ok: false, error: "generic" };

  revalidatePath("/bikes");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteBike(id: string): Promise<ActionResult> {
  if (!hasSupabaseEnv()) return { ok: false, error: "noenv" };
  if (!id) return { ok: false, error: "generic" };

  const supabase = await createClient();
  const { data: bike, error: readError } = await supabase
    .from("bikes")
    .select("image_urls")
    .eq("id", id)
    .single();
  if (readError) return { ok: false, error: "generic" };

  const { error } = await supabase.from("bikes").delete().eq("id", id);
  if (error) return { ok: false, error: "generic" };

  const imagesDeleted = await deleteStoredBikeImages(supabase, bike.image_urls ?? []);
  if (!imagesDeleted) return { ok: false, error: "generic" };

  revalidatePath("/bikes");
  revalidatePath("/");
  return { ok: true };
}
