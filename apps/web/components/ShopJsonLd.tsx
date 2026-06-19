import type { ShopSettings } from "@gigabike/supabase";
import { SITE_URL } from "@/lib/site";

/**
 * BikeStore structured data (schema.org JSON-LD). Describes the *business*
 * (name, contact, address, social) — appropriate for a contact-to-buy local
 * shop with no per-product pricing. Opening hours and geo are intentionally
 * omitted: hours are free-text/localized here and there is no geo field, so
 * we avoid emitting data that could be wrong (Google Business Profile owns
 * those). Structured data is not a ranking signal; it only helps Google
 * understand the entity.
 */
export function ShopJsonLd({ shop }: { shop: ShopSettings }) {
  const sameAs = [
    shop.facebook ? `https://www.facebook.com/${shop.facebook}` : null,
    shop.whatsapp ? `https://wa.me/${shop.whatsapp}` : null,
  ].filter(Boolean);

  const data = {
    "@context": "https://schema.org",
    "@type": "BikeStore",
    "@id": `${SITE_URL}/#shop`,
    name: shop.name,
    description: shop.tagline || undefined,
    url: SITE_URL,
    telephone: shop.phone || undefined,
    email: shop.email || undefined,
    address: shop.address
      ? {
          "@type": "PostalAddress",
          streetAddress: shop.address,
          addressLocality: "Tbilisi",
          addressCountry: "GE",
        }
      : undefined,
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify + escaping `<` guards against breaking out of the tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
