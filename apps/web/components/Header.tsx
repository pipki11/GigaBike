"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@gigabike/ui";
import type { ShopSettings } from "@gigabike/supabase";
import { createT, type Dict, type Locale } from "@/lib/i18n";
import { googleMapsSearchHref } from "@/lib/maps";
import { useScrollLock } from "@/lib/useScrollLock";

const LANGS = [
  { code: "ka", label: "ქარ", full: "ქართული" },
  { code: "ru", label: "РУС", full: "Русский" },
  { code: "en", label: "ENG", full: "English" },
] as const;

function LangSwitcher({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  const cur = LANGS.find((l) => l.code === locale) ?? LANGS[0];

  function choose(code: string) {
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; samesite=lax`;
    const seg = pathname.split("/");
    seg[1] = code;
    router.push(seg.join("/") || `/${code}`);
    setOpen(false);
  }

  return (
    <div className="lang" ref={ref}>
      <button className="lang-btn" onClick={() => setOpen((o) => !o)} aria-label="Change language">
        <Icon name="globe" size={16} />
        <span>{cur.label}</span>
        <Icon
          name="chevron"
          size={14}
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .25s" }}
        />
      </button>
      {open && (
        <div className="lang-menu">
          {LANGS.map((l) => (
            <button
              key={l.code}
              className={`lang-item ${l.code === locale ? "on" : ""}`}
              onClick={() => choose(l.code)}
            >
              <span>{l.full}</span>
              {l.code === locale && <Icon name="check" size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header({
  locale,
  dict,
  shop,
}: {
  locale: Locale;
  dict: Dict;
  shop: ShopSettings;
}) {
  const t = createT(dict);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 12);
    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // lock background scroll while the drawer is open
  useScrollLock(menu);

  const closeMenu = () => setMenu(false);
  const openMenu = () => setMenu(true);

  const base = `/${locale}`;
  const mapsHref = googleMapsSearchHref(shop.name, shop.address);
  const nav = [
    { key: "home", label: t("nav.home"), href: base },
    { key: "catalog", label: t("nav.bikes"), href: `${base}/bikes` },
    { key: "repair", label: t("nav.repair"), href: `${base}/repair` },
    { key: "contact", label: t("nav.contact"), href: `${base}#contact` },
  ];

  const active =
    pathname === base
      ? "home"
      : pathname.startsWith(`${base}/bikes`)
        ? "catalog"
        : pathname.startsWith(`${base}/repair`)
          ? "repair"
          : "";

  return (
    <>
      <div className="topbar">
        <div className="wrap topbar-in">
          <a className="tb-item tb-link" href={mapsHref} target="_blank" rel="noreferrer">
            <Icon name="pin" />
            {shop.address}
          </a>
          <div className="tb-right">
            <span className="tb-item">
              <Icon name="clock" />
              {t("shop.hours")}
            </span>
            <a className="tb-item tb-link" href={`tel:${shop.phone}`}>
              <Icon name="phone" />
              {shop.phone}
            </a>
          </div>
        </div>
      </div>

      <header className={`hdr ${scrolled ? "scrolled" : ""}`}>
        <div className="wrap hdr-in">
          <Link className="brand" href={base} aria-label="GigaBike home">
            <span className="brand-mark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/gigabike-logo.jpg" alt="GigaBike logo" />
            </span>
            <span className="brand-name">{shop.name}</span>
          </Link>
          <nav className="nav-desk">
            {nav.map((n) => (
              <Link key={n.key} className={`nav-link ${active === n.key ? "on" : ""}`} href={n.href}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="hdr-right">
            <LangSwitcher locale={locale} />
            <Link className="btn btn-primary btn-sm hdr-cta" href={`${base}/bikes`}>
              {t("cta.viewBikes")}
            </Link>
            <button
              className="icon-btn menu-btn"
              onClick={openMenu}
              aria-label="Menu"
              aria-expanded={menu}
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>

      {mounted &&
        menu &&
        createPortal(
          <div className="mobile-menu" onClick={closeMenu}>
            <div className="mobile-panel" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-top">
                <span className="brand-name">{shop.name}</span>
                <button className="icon-btn" onClick={closeMenu} aria-label="Close menu">
                  <Icon name="close" />
                </button>
              </div>
              <nav className="mobile-nav">
                {nav.map((n) => (
                  <Link key={n.key} className="mobile-link" href={n.href} onClick={closeMenu}>
                    {n.label}
                    <Icon name="arrow" size={18} />
                  </Link>
                ))}
              </nav>
              <Link
                className="btn btn-primary btn-lg"
                style={{ marginTop: 14, width: "100%" }}
                href={`${base}/bikes`}
                onClick={closeMenu}
              >
                {t("cta.viewBikes")}
              </Link>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
