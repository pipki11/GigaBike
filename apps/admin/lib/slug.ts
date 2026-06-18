/* Turn a bike name into a URL-safe slug. Latin names slugify directly;
   non-Latin names (Georgian/Cyrillic) fall back to a generic stem, so the
   admin can always override the slug field manually before saving. */
export function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return s || "bike";
}
