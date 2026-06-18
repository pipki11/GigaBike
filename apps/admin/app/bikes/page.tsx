import { cookies } from "next/headers";
import { getBikes, getCategories } from "@gigabike/supabase";
import { DEFAULT_ADMIN_LOCALE, isAdminLocale, makeAt } from "@/lib/i18n";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { BikesManager } from "@/components/bikes/BikesManager";

export default async function BikesPage() {
  const c = await cookies();
  const raw = c.get("gb_admin_lang")?.value ?? "";
  const locale = isAdminLocale(raw) ? raw : DEFAULT_ADMIN_LOCALE;
  const at = makeAt(locale);

  let email = "admin@gigabike.ge";
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) email = user.email;
  }
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";

  const [bikes, categories] = await Promise.all([getBikes(), getCategories()]);

  return (
    <AdminShell
      locale={locale}
      email={email}
      active="bikes"
      title={at("nav.bikes")}
      subtitle={at("sub.bikes")}
      webUrl={webUrl}
    >
      <BikesManager locale={locale} bikes={bikes} categories={categories} webUrl={webUrl} />
    </AdminShell>
  );
}
