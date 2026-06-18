import { getShop } from "@gigabike/supabase";
import { createT, getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { googleMapsSearchHref } from "@/lib/maps";
import { notFound } from "next/navigation";

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const t = createT(dict);
  const shop = await getShop();
  const mapsHref = googleMapsSearchHref(shop.name, shop.address);

  const notes = [
    t("legal.note1"),
    t("legal.note2"),
    t("legal.note3"),
    t("legal.note4"),
  ];

  return (
    <section className="section legal-page">
      <div className="wrap legal-wrap">
        <div className="legal-head">
          <div className="eyebrow sec-eye">{shop.name}</div>
          <h1>{t("legal.title")}</h1>
          <p>{t("legal.intro")}</p>
        </div>
        <div className="legal-body">
          <section className="legal-section legal-contact">
            <h2>{t("legal.contactTitle")}</h2>
            <dl>
              <div>
                <dt>{t("legal.shopName")}</dt>
                <dd>{shop.name}</dd>
              </div>
              <div>
                <dt>{t("label.address")}</dt>
                <dd>
                  <a href={mapsHref} target="_blank" rel="noreferrer">
                    {shop.address}
                  </a>
                </dd>
              </div>
              <div>
                <dt>{t("label.phone")}</dt>
                <dd>
                  <a href={`tel:${shop.phone}`}>{shop.phone}</a>
                </dd>
              </div>
              <div>
                <dt>{t("label.whatsapp")}</dt>
                <dd>
                  <a href={`https://wa.me/${shop.whatsapp}`} target="_blank" rel="noreferrer">
                    {t("label.messageUs")}
                  </a>
                </dd>
              </div>
              <div>
                <dt>{t("foot.hours")}</dt>
                <dd>{t("shop.hours")}</dd>
              </div>
            </dl>
          </section>
          <section className="legal-section">
            <h2>{t("legal.noticeTitle")}</h2>
            <ul>
              {notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
}
