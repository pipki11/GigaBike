"use client";

import { useRouter } from "next/navigation";
import type { AdminLocale } from "@/lib/i18n";

export function AdminLangToggle({ locale }: { locale: AdminLocale }) {
  const router = useRouter();
  function set(l: AdminLocale) {
    document.cookie = `gb_admin_lang=${l}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }
  return (
    <div className="adm-langtoggle">
      {(["ka", "en"] as AdminLocale[]).map((l) => (
        <button key={l} className={locale === l ? "on" : ""} onClick={() => set(l)}>
          {l === "ka" ? "ქარ" : "ENG"}
        </button>
      ))}
    </div>
  );
}
