import { getShop } from "@gigabike/supabase";
import { createT, getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function PrivacyPage({
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

  const sections = [
    {
      title: t("privacy.s1t"),
      body: t("privacy.s1b"),
    },
    {
      title: t("privacy.s2t"),
      body: t("privacy.s2b"),
    },
    {
      title: t("privacy.s3t"),
      body: t("privacy.s3b"),
    },
    {
      title: t("privacy.s4t"),
      body: t("privacy.s4b"),
    },
    {
      title: t("privacy.s5t"),
      body: t("privacy.s5b", { email: shop.email, phone: shop.phone }),
    },
  ];

  return (
    <section className="section legal-page">
      <div className="wrap legal-wrap">
        <div className="legal-head">
          <div className="eyebrow sec-eye">{shop.name}</div>
          <h1>{t("privacy.title")}</h1>
          <p>{t("privacy.intro")}</p>
        </div>
        <div className="legal-body">
          {sections.map((section) => (
            <section key={section.title} className="legal-section">
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
