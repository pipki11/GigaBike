import type { MetadataRoute } from "next";
import { getBikes } from "@gigabike/supabase";
import { LOCALES } from "@gigabike/supabase/types";
import { SITE_URL } from "@/lib/site";

// Static, locale-prefixed routes (no trailing path = home).
const STATIC_PATHS = ["", "/bikes", "/repair", "/legal", "/privacy"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    STATIC_PATHS.map((path) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === "" || path === "/bikes" ? "daily" : "monthly",
      priority: path === "" ? 1 : path === "/bikes" ? 0.8 : 0.5,
    })),
  );

  // Per-bike product pages, across all locales.
  const bikes = await getBikes();
  const bikeEntries: MetadataRoute.Sitemap = bikes.flatMap((bike) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}/bikes/${bike.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  );

  return [...staticEntries, ...bikeEntries];
}
