import { notFound } from "next/navigation";
import { Icon } from "@gigabike/ui";
import {
  getCategories,
  getRepairGroups,
  getShop,
  groupBlurb,
  groupTitle,
  serviceName,
} from "@gigabike/supabase";
import { createT, getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { Reveal } from "@/components/Reveal";
import { RepairForm } from "@/components/repair/RepairForm";

export default async function RepairPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const t = createT(dict);

  const [groups, shop, categories] = await Promise.all([
    getRepairGroups(),
    getShop(),
    getCategories(),
  ]);

  const heroTitle = t("rp.title").split("\n");
  const heroStats: [string, string][] = [
    [t("rp.stat1"), t("rp.stat1l")],
    [t("rp.stat2"), t("rp.stat2l")],
    [t("rp.stat3"), t("rp.stat3l")],
  ];
  const why: [string, string, string][] = [
    ["clock", t("rp.why1t"), t("rp.why1d")],
    ["wrench", t("rp.why2t"), t("rp.why2d")],
    ["shield", t("rp.why3t"), t("rp.why3d")],
    ["bike", t("rp.why4t"), t("rp.why4d")],
  ];

  return (
    <div className="page">
      {/* ---------- hero (split) ---------- */}
      <section className="rep-hero">
        <div className="wrap rep-hero-in">
          <div className="rep-hero-copy">
            <Reveal as="p" className="hero-kicker rep-kicker" delay={0}>
              {t("rp.kicker")}
            </Reveal>
            <Reveal as="h1" className="rep-hero-title" delay={80}>
              {heroTitle.map((l, i) => (
                <span key={i} className="hero-line">
                  {l}
                </span>
              ))}
            </Reveal>
            <Reveal as="p" className="rep-hero-sub" delay={160}>
              {t("rp.sub")}
            </Reveal>
            <Reveal className="hero-actions rep-actions" delay={240}>
              <a
                className="btn btn-primary btn-lg"
                href={`https://wa.me/${shop.whatsapp}`}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="chat" />
                {t("rp.cta")}
              </a>
              <a className="btn btn-ghost btn-lg" href={`tel:${shop.phone}`}>
                <Icon name="phone" />
                {t("rp.call")}
              </a>
            </Reveal>
            <Reveal className="rep-hero-stats" delay={320}>
              {heroStats.map(([n, l]) => (
                <div key={l} className="rep-hstat">
                  <strong>{n}</strong>
                  <span>{l}</span>
                </div>
              ))}
            </Reveal>
          </div>
          <Reveal className="rep-hero-media" delay={160}>
            <div className="rep-hero-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="rep-hero-img"
                src="/assets/repair-workshop.jpg"
                alt="GigaBike bicycle repair workshop"
              />
            </div>
            <div className="rep-badge">
              <span className="rep-badge-ic">
                <Icon name="wrench" />
              </span>
              <div>
                <strong>{t("rp.stat1")}</strong>
                <span>{t("rp.stat1l")}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- services ---------- */}
      <section className="section rep-services">
        <div className="wrap">
          <Reveal className="sec-head" style={{ marginBottom: 14 }}>
            <div>
              <div className="eyebrow sec-eye">{t("rp.servicesKicker")}</div>
              <h2>{t("rp.servicesTitle")}</h2>
              <p>{t("rp.servicesSub")}</p>
            </div>
          </Reveal>
          <div className="svc-grid">
            {groups.map((g, gi) => (
              <Reveal key={g.id} className="svc-card" delay={gi * 90}>
                <div className="svc-head">
                  <span className="svc-ic">
                    <Icon name={g.icon} />
                  </span>
                  <div>
                    <h3>{groupTitle(g, locale)}</h3>
                    <p>{groupBlurb(g, locale)}</p>
                  </div>
                </div>
                <ul className="svc-list">
                  {g.items.map((it) => (
                    <li key={it.id}>
                      <span className="svc-dot">
                        <Icon name="check" />
                      </span>
                      <span className="svc-name">{serviceName(it, locale)}</span>
                      <span className="svc-price">{it.price || t("rp.askPrice")}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
          <Reveal className="svc-note" delay={120}>
            <Icon name="spark" />
            <span>{t("rp.priceNote")}</span>
          </Reveal>
        </div>
      </section>

      {/* ---------- why trust us ---------- */}
      <section className="section rep-why-sec">
        <div className="wrap">
          <div className="rep-why-card">
            <Reveal className="rep-why-head">
              <div className="eyebrow sec-eye eyebrow-ondark">{t("rp.whyKicker")}</div>
              <h2>{t("rp.whyTitle")}</h2>
            </Reveal>
            <div className="rep-why-grid">
              {why.map(([ic, tt, dd], i) => (
                <Reveal key={tt} className="rep-why-item" delay={i * 70}>
                  <span className="rwi-ic">
                    <Icon name={ic} />
                  </span>
                  <strong>{tt}</strong>
                  <p>{dd}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- book a repair ---------- */}
      <RepairForm locale={locale} dict={dict} shop={shop} categories={categories} />
    </div>
  );
}
