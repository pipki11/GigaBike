import Link from "next/link";
import { Icon } from "@gigabike/ui";
import { categoryName, type Bike, type Category } from "@gigabike/supabase";
import { createT, type Dict, type Locale } from "@/lib/i18n";
import { Reveal } from "./Reveal";
import { Placeholder } from "./Placeholder";

export function BikeCard({
  bike,
  category,
  locale,
  dict,
  delay = 0,
  href,
}: {
  bike: Bike;
  category?: Category;
  locale: Locale;
  dict: Dict;
  delay?: number;
  href?: string;
}) {
  const t = createT(dict);
  const condLabel = bike.condition === "New" ? t("cond.New") : t("cond.Used");

  return (
    <Reveal className="card" delay={delay}>
      <Link className="card-btn" href={href ?? `/${locale}/bikes/${bike.slug}`} prefetch={false}>
        <div className="card-media">
          {bike.image_urls?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bike.image_urls[0]}
              alt={bike.name}
              loading="lazy"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Placeholder label="bike photo" style={{ position: "absolute", inset: 0 }} />
          )}
          <span
            className={`chip ${bike.condition === "New" ? "chip-new" : "chip-used"} card-cond`}
          >
            {condLabel}
          </span>
          {bike.featured && (
            <span className="card-star">
              <Icon name="star" size={14} />
            </span>
          )}
        </div>
        <div className="card-body">
          <div className="card-meta">
            <span className="mono" style={{ color: "var(--copper)" }}>
              {categoryName(category, locale)}
            </span>
          </div>
          <h3 className="card-name">{bike.name}</h3>
          <p className="card-desc">{bike.description}</p>
          <div className="card-foot">
            <span className="card-price">
              {bike.price.toLocaleString()} <em>₾</em>
            </span>
            <span className="card-link">
              {t("cta.viewDetails")} <Icon name="arrow" size={16} />
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
