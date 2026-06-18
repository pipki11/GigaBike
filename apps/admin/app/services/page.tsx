import { cookies } from "next/headers";
import { getRepairGroups } from "@gigabike/supabase";
import { DEFAULT_ADMIN_LOCALE, isAdminLocale, makeAt } from "@/lib/i18n";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { ServicesEditor } from "@/components/services/ServicesEditor";

export default async function ServicesPage() {
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

  const groups = await getRepairGroups();

  return (
    <AdminShell
      locale={locale}
      email={email}
      active="services"
      title={at("nav.services")}
      subtitle={at("sub.services")}
      webUrl={webUrl}
    >
      <ServicesEditor locale={locale} groups={groups} />
    </AdminShell>
  );
}
