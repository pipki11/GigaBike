"use client";

import { useEffect, useState } from "react";
import { Icon } from "@gigabike/ui";
import { createT, type Dict, type Locale } from "@/lib/i18n";

/** One-per-session toast noting interface-only translation for KA/RU. */
export function LangNote({ locale, dict }: { locale: Locale; dict: Dict }) {
  const [show, setShow] = useState(false);
  const t = createT(dict);

  useEffect(() => {
    if (locale === "en") return;
    const seen = sessionStorage.getItem("gb_langnote");
    if (seen === locale) return;
    sessionStorage.setItem("gb_langnote", locale);
    setShow(true);
    const id = setTimeout(() => setShow(false), 4200);
    return () => clearTimeout(id);
  }, [locale]);

  if (!show) return null;

  return (
    <div className="lang-note">
      <Icon name="globe" />
      <span>{t("lang.note")}</span>
      <button onClick={() => setShow(false)} aria-label="Dismiss">
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}
