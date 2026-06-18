import "@/app/globals.css";

import type { Metadata } from "next";
import { getShop } from "@gigabike/supabase";
import { DEFAULT_LOCALE, LOCALES } from "@gigabike/supabase/types";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { fontVariables } from "@/app/fonts";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LangNote } from "@/components/LangNote";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

// ISR: regenerate the static pages (home, catalog, repair, legal, privacy) at
// most once per minute so admin edits to bikes/prices/settings go live without a
// redeploy. Applies to the whole locale subtree; the dynamic /bikes/[slug] route
// is already server-rendered on demand, so it's always fresh.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const shop = await getShop();
  const dict = getDictionary(isLocale(locale) ? locale : "ka");
  return {
    metadataBase: new URL(SITE_URL),
    title: `${shop.name} — ${dict["hero.kicker"]}`,
    description: dict["hero.sub"],
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const dict = getDictionary(locale);
  const shop = await getShop();

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <Header locale={locale} dict={dict} shop={shop} />
        <main>{children}</main>
        <Footer locale={locale} dict={dict} shop={shop} />
        <LangNote locale={locale} dict={dict} />
      </body>
    </html>
  );
}
