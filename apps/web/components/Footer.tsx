import Link from "next/link";
import { Icon } from "@gigabike/ui";
import { categoryName, getCategories, type ShopSettings } from "@gigabike/supabase";
import { createT, type Dict, type Locale } from "@/lib/i18n";
import { googleMapsSearchHref } from "@/lib/maps";

export async function Footer({
  locale,
  dict,
  shop,
}: {
  locale: Locale;
  dict: Dict;
  shop: ShopSettings;
}) {
  const t = createT(dict);
  const categories = await getCategories();
  const base = `/${locale}`;
  const mapsHref = googleMapsSearchHref(shop.name, shop.address);

  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-top">
          <div className="ftr-brand">
            <Link className="brand" href={base}>
              <span className="brand-mark">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/gigabike-logo.jpg" alt="GigaBike logo" />
              </span>
              <span className="brand-name" style={{ color: "var(--bg)" }}>
                {shop.name}
              </span>
            </Link>
            <p className="ftr-tag">
              {shop.tagline} {t("foot.tag")}
            </p>
            <div className="ftr-social">
              <a className="ftr-soc" href={`tel:${shop.phone}`}>
                <Icon name="phone" />
              </a>
              <a
                className="ftr-soc"
                href={`https://wa.me/${shop.whatsapp}`}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="chat" />
              </a>
              <a className="ftr-soc" href={`mailto:${shop.email}`}>
                <Icon name="mail" />
              </a>
            </div>
          </div>
          <div className="ftr-cols">
            <div className="ftr-col">
              <h4>{t("nav.bikes")}</h4>
              {categories.map((c) => (
                <Link key={c.id} href={`${base}/bikes?category=${c.id}`}>
                  {categoryName(c, locale)}
                </Link>
              ))}
            </div>
            <div className="ftr-col">
              <h4>{t("foot.shop")}</h4>
              <Link href={`${base}/bikes`}>{t("nav.bikes")}</Link>
              <Link href={`${base}/repair`}>{t("nav.repair")}</Link>
              <Link href={`${base}#contact`}>{t("nav.contact")}</Link>
              <Link href={`${base}/privacy`}>{t("foot.privacy")}</Link>
              <Link href={`${base}/legal`}>{t("foot.legal")}</Link>
            </div>
            <div className="ftr-col">
              <h4>{t("foot.find")}</h4>
              <a className="ftr-info" href={mapsHref} target="_blank" rel="noreferrer">
                <Icon name="pin" /> {shop.address}
              </a>
              <span className="ftr-info">
                <Icon name="clock" /> {t("shop.hours")}
              </span>
              <a className="ftr-info" href={`tel:${shop.phone}`}>
                <Icon name="phone" /> {shop.phone}
              </a>
            </div>
          </div>
        </div>
        <div className="ftr-bottom">
          <span>
            © {new Date().getFullYear()} {shop.name}. {t("foot.rights")}
          </span>
          <a className="mono" href={mapsHref} target="_blank" rel="noreferrer">
            {shop.address}
          </a>
        </div>
      </div>
    </footer>
  );
}
