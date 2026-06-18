import "@/app/globals.css";

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { fontVariables } from "./fonts";
import { DEFAULT_ADMIN_LOCALE, isAdminLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "GigaBike — Admin Panel",
  description: "Manage bicycles, repair prices and shop details.",
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const c = await cookies();
  const raw = c.get("gb_admin_lang")?.value ?? "";
  const locale = isAdminLocale(raw) ? raw : DEFAULT_ADMIN_LOCALE;

  return (
    <html lang={locale} className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
