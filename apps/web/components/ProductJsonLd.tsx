import {
  categoryName,
  type Bike,
  type Category,
  type Locale,
} from "@gigabike/supabase";
import { SITE_URL } from "@/lib/site";

/**
 * Product structured data (schema.org JSON-LD) for a single bike detail page.
 * When the bike has a real price (> 0) we emit an Offer so Google can surface
 * the price (a genuine rich-result win); availability defaults to InStock — a
 * listed bike is one that's for sale; the owner removes sold bikes in admin.
 * Bikes with no price set just omit the Offer (a priceless "GEL 0" offer is
 * invalid and misleading). priceValidUntil/brand/sku are omitted (no data).
 */
export function ProductJsonLd({
  bike,
  category,
  locale,
}: {
  bike: Bike;
  category: Category | undefined;
  locale: Locale;
}) {
  const url = `${SITE_URL}/${locale}/bikes/${bike.slug}`;
  const images = (bike.image_urls ?? []).filter(Boolean);
  const hasPrice = typeof bike.price === "number" && bike.price > 0;

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: bike.name,
    description: bike.description || undefined,
    ...(images.length ? { image: images } : {}),
    category: category ? categoryName(category, locale) : undefined,
    itemCondition:
      bike.condition === "Used"
        ? "https://schema.org/UsedCondition"
        : "https://schema.org/NewCondition",
    ...(hasPrice
      ? {
          offers: {
            "@type": "Offer",
            url,
            price: bike.price,
            priceCurrency: "GEL",
            availability: "https://schema.org/InStock",
            // Links this offer to the site-wide BikeStore node (ShopJsonLd).
            seller: { "@id": `${SITE_URL}/#shop` },
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
