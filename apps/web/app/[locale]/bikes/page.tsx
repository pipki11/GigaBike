import { notFound } from "next/navigation";
import { getBikes, getCategories } from "@gigabike/supabase";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { CatalogClient, type CatalogInitialState } from "@/components/catalog/CatalogClient";

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<CatalogInitialState>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const initialState = await searchParams;

  const [bikes, categories] = await Promise.all([getBikes(), getCategories()]);

  return (
    <CatalogClient
      locale={locale}
      dict={dict}
      bikes={bikes}
      categories={categories}
      initialState={initialState}
    />
  );
}
