import Link from "next/link";
import { Icon } from "@gigabike/ui";
import { categoryName, getCategories, getFeaturedBikes, getShop } from "@gigabike/supabase";
import { createT, isLocale, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { googleMapsSearchHref } from "@/lib/maps";
import { Reveal } from "@/components/Reveal";
import { Placeholder } from "@/components/Placeholder";
import { BikeCard } from "@/components/BikeCard";
import { notFound } from "next/navigation";

const CATEGORY_IMAGES: Record<string, string> = {
  electric: "/assets/category-electric.jpg",
  city: "/assets/category-city.jpg",
  mountain: "/assets/category-mountain.jpg",
  kids: "/assets/category-kids.jpg",
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const t = createT(dict);

  const [categories, featured, shop] = await Promise.all([
    getCategories(),
    getFeaturedBikes(4),
    getShop(),
  ]);
  const catById = new Map(categories.map((c) => [c.id, c]));
  const mapsHref = googleMapsSearchHref(shop.name, shop.address);

  const heroLines = t("hero.title").split("\n");
  const heroStats: [string, string][] = [
    [t("home.stat1n"), t("home.stat1l")],
    [t("home.stat2n"), t("home.stat2l")],
    [t("home.stat3n"), t("home.stat3l")],
  ];
  const trust: [string, string][] = [
    ["shield", t("home.trust1")],
    ["wrench", t("home.trust2")],
    ["bike", t("home.trust3")],
    ["clock", t("home.trust4")],
  ];
  const repairPreview: [string, string][] = [
    [t("rp.prev1t"), t("rp.prev1d")],
    [t("rp.prev2t"), t("rp.prev2d")],
    [t("rp.prev3t"), t("rp.prev3d")],
    [t("rp.prev4t"), t("rp.prev4d")],
  ];
  const contactRows = [
    { ic: "phone", label: t("label.phone"), val: shop.phone, href: `tel:${shop.phone}` },
    { ic: "chat", label: t("label.whatsapp"), val: t("label.messageUs"), href: `https://wa.me/${shop.whatsapp}` },
    { ic: "pin", label: t("label.address"), val: shop.address, href: mapsHref },
    { ic: "clock", label: t("foot.hours"), val: t("shop.hours"), href: null as string | null },
  ];

  return (
    <div className="page">
      {/* ---------- hero ---------- */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-head">
            <Reveal as="p" className="hero-kicker" delay={0}>
              {t("hero.kicker")}
            </Reveal>
            <Reveal as="h1" className="hero-title" delay={70}>
              {heroLines.map((line, i) => (
                <span key={i} className="hero-line">
                  {line}
                </span>
              ))}
            </Reveal>
            <Reveal as="p" className="hero-sub" delay={150}>
              {t("hero.sub")}
            </Reveal>
            <Reveal className="hero-actions" delay={230}>
              <Link className="btn btn-primary btn-lg" href={`/${locale}/bikes`}>
                {t("cta.viewBikes")}
                <Icon name="arrow" />
              </Link>
              <Link className="btn btn-ghost btn-lg" href={`/${locale}/repair`}>
                <Icon name="wrench" />
                {t("cta.repair")}
              </Link>
            </Reveal>
          </div>
          <Reveal className="hero-banner" delay={300}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="hero-banner-img"
              src="/assets/hero-gigabike-interior.jpg"
              alt="GigaBike bicycle shop interior"
            />
            <div className="hero-banner-bar">
              {heroStats.map(([n, l]) => (
                <span key={l} className="hb-stat">
                  <strong>{n}</strong>
                  <span>{l}</span>
                </span>
              ))}
            </div>
          </Reveal>
        </div>
        <div className="trust-strip">
          <div className="wrap trust-in">
            {trust.map(([ic, tx]) => (
              <span key={tx} className="trust-item">
                <Icon name={ic} />
                {tx}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- categories ---------- */}
      <section className="section cats">
        <div className="wrap">
          <Reveal className="sec-head sec-center">
            <div className="eyebrow sec-eye">{t("cats.sub")}</div>
            <h2>{t("cats.title")}</h2>
          </Reveal>
          <div className="cat-grid">
            {categories.map((c, i) => (
              <Reveal key={c.id} className="cat-card" delay={i * 70}>
                <Link href={`/${locale}/bikes?category=${c.id}`}>
                  <div className="cat-media">
                    {CATEGORY_IMAGES[c.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={CATEGORY_IMAGES[c.id]} alt={`${categoryName(c, locale)} bicycle`} loading="lazy" />
                    ) : (
                      <Placeholder
                        label={`${c.name_en.toLowerCase()} bike`}
                        style={{ position: "absolute", inset: 0 }}
                      />
                    )}
                  </div>
                  <div className="cat-info">
                    <h3>{categoryName(c, locale)}</h3>
                    <p>{c.blurb}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- featured ---------- */}
      <section className="section featured">
        <div className="wrap">
          <Reveal className="sec-head sec-center">
            <div className="eyebrow sec-eye">{t("featured.sub")}</div>
            <h2>{t("featured.title")}</h2>
          </Reveal>
          <div className="feat-grid">
            {featured.map((b, i) => (
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
          <Reveal className="feat-foot" delay={120}>
            <Link className="btn btn-ghost" href={`/${locale}/bikes`}>
              {t("featured.all")}
              <Icon name="arrow" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------- repair preview band ---------- */}
      <section className="repair-band">
        <div className="wrap repair-band-in">
          <Reveal className="repair-head">
            <div className="eyebrow sec-eye eyebrow-ondark">{t("repair.kicker")}</div>
            <h2>{t("repair.title")}</h2>
            <p>{t("repair.sub")}</p>
            <a
              className="btn btn-primary btn-lg"
              href={`https://wa.me/${shop.whatsapp}`}
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="chat" />
              {t("repair.cta")}
            </a>
          </Reveal>
          <div className="repair-list">
            {repairPreview.map(([name, desc], i) => (
              <Reveal key={name} className="repair-item" delay={i * 60}>
                <span className="ri-ic">
                  <Icon name="wrench" />
                </span>
                <div className="ri-body">
                  <div className="ri-top">
                    <strong>{name}</strong>
                  </div>
                  <p>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- contact strip ---------- */}
      <section className="section contact-strip" id="contact">
        <div className="wrap contact-in">
          <Reveal className="contact-copy">
            <div className="eyebrow sec-eye">{t("contact.kicker")}</div>
            <h2>{t("contact.title")}</h2>
            <p className="muted">{t("product.interestedSub")}</p>
            <div className="contact-rows">
              {contactRows.map((r) => {
                const inner = (
                  <>
                    <span className="cr-ic">
                      <Icon name={r.ic} />
                    </span>
                    <div>
                      <span className="cr-label mono">{r.label}</span>
                      <strong>{r.val}</strong>
                    </div>
                  </>
                );
                return r.href ? (
                  <a
                    key={r.label}
                    className={`contact-row ${r.href.includes("wa.me") ? "cr-wa" : ""}`}
                    href={r.href}
                    target={r.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={r.label} className="contact-row">
                    {inner}
                  </div>
                );
              })}
            </div>
          </Reveal>
          <Reveal className="map-frame" delay={100}>
            <iframe
              title={`${shop.name} - ${shop.address}`}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2978.2770430137502!2d44.8029952!3d41.714540299999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40440de459e6957b%3A0x15be67c112aa892b!2sGigabike%20bicycle%20store!5e0!3m2!1sen!2sge!4v1781695213103!5m2!1sen!2sge"
              width="600"
              height="450"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
            />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
