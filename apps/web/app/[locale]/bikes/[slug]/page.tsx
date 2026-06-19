import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@gigabike/ui";
import {
  categoryName,
  getBikeBySlug,
  getBikes,
  getCategories,
  getShop,
} from "@gigabike/supabase";
import { createT, getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { Reveal } from "@/components/Reveal";
import { BikeCard } from "@/components/BikeCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductJsonLd } from "@/components/ProductJsonLd";

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const t = createT(dict);
  const { from } = await searchParams;
  const backHref =
    from && new RegExp(`^/${locale}/bikes(?:\\?|$)`).test(from) ? from : `/${locale}/bikes`;

  const [bike, categories, bikes, shop] = await Promise.all([
    getBikeBySlug(slug),
    getCategories(),
    getBikes(),
    getShop(),
  ]);
  if (!bike) notFound();

  const catById = new Map(categories.map((c) => [c.id, c]));
  const category = catById.get(bike.category_id);
  const condLabel = bike.condition === "New" ? t("cond.New") : t("cond.Used");

  const waText = encodeURIComponent(
    `Hello, I am interested in the ${bike.name} listed on your website.`,
  );

  const similar = bikes.filter((b) => b.category_id === bike.category_id && b.id !== bike.id).slice(0, 3);
  const fallback = bikes.filter((b) => b.id !== bike.id).slice(0, 3);
  const sims = similar.length ? similar : fallback;

  const specs = [
    { ic: "bike", label: t("product.category"), val: categoryName(category, locale) },
    { ic: "shield", label: t("product.condition"), val: condLabel },
    { ic: "star", label: t("product.status"), val: bike.featured ? t("value.featured") : t("value.inStock") },
    { ic: "spark", label: t("product.viewing"), val: t("value.inShop") },
  ];

  return (
    <div className="page product">
      <ProductJsonLd bike={bike} category={category} locale={locale} />
      <div className="wrap">
        <Link className="crumb" href={backHref}>
          <Icon name="arrow" style={{ transform: "rotate(180deg)" }} />
          {t("product.back")}
        </Link>

        <div className="product-grid">
          <ProductGallery
            gallery={bike.gallery}
            images={bike.image_urls}
            condition={bike.condition}
            conditionLabel={condLabel}
            featured={bike.featured}
            featuredLabel={t("value.featured")}
          />

          <div className="product-info">
            <div className="pi-cat">{categoryName(category, locale)}</div>
            <h1>{bike.name}</h1>
            <div className="pi-price">
              <strong>
                {bike.price.toLocaleString()} <em>₾</em>
              </strong>
            </div>
            <p className="pi-desc">{bike.description}</p>

            <div className="specs">
              {specs.map((s) => (
                <div key={s.label} className="spec">
                  <Icon name={s.ic} />
                  <div>
                    <span>{s.label}</span>
                    <strong>{s.val}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="contact-box">
              <h3>{t("product.interested")}</h3>
              <p>{t("product.interestedSub")}</p>
              <div className="contact-actions">
                <a className="btn btn-primary" href={`tel:${shop.phone}`}>
                  <Icon name="phone" />
                  <span>
                    {t("cta.call")} · <span style={{ whiteSpace: "nowrap" }}>{shop.phone}</span>
                  </span>
                </a>
                <a
                  className="btn ca-wa"
                  href={`https://wa.me/${shop.whatsapp}?text=${waText}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name="chat" />
                  {t("cta.whatsapp")}
                </a>
                <a
                  className="btn ca-fb"
                  href={`https://m.me/${shop.facebook}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name="chat" />
                  {t("cta.facebook")}
                </a>
              </div>
            </div>
          </div>
        </div>

        <section className="section similar" style={{ paddingBottom: 0 }}>
          <div className="sec-head">
            <div>
              <div className="eyebrow sec-eye">{categoryName(category, locale)}</div>
              <h2>{t("product.similar")}</h2>
            </div>
            <Link className="btn btn-ghost" href={`/${locale}/bikes?category=${bike.category_id}`}>
              {t("featured.all")}
              <Icon name="arrow" />
            </Link>
          </div>
          <div className="similar-cards">
            {sims.map((b, i) => (
              <BikeCard
                key={b.id}
                bike={b}
                category={catById.get(b.category_id)}
                locale={locale}
                dict={dict}
                delay={i * 70}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
