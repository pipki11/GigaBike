"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@gigabike/ui";
import { makeAt, type AdminLocale } from "@/lib/i18n";
import { AdminLangToggle } from "@/components/AdminLangToggle";
import { signOut } from "@/app/logout/actions";

type NavKey = "dashboard" | "bikes" | "services" | "settings";

const NAV: { key: NavKey; href: string; icon: string; label: string }[] = [
  { key: "dashboard", href: "/", icon: "dashboard", label: "nav.dashboard" },
  { key: "bikes", href: "/bikes", icon: "bike", label: "nav.bikes" },
  { key: "services", href: "/services", icon: "tag", label: "nav.services" },
  { key: "settings", href: "/settings", icon: "settings", label: "nav.settings" },
];

export function AdminShell({
  locale,
  email,
  active,
  title,
  subtitle,
  webUrl,
  children,
}: {
  locale: AdminLocale;
  email: string;
  active: NavKey;
  title: string;
  subtitle: string;
  webUrl: string;
  children: React.ReactNode;
}) {
  const at = makeAt(locale);
  const [menu, setMenu] = useState(false);
  const avatar = email.charAt(0).toUpperCase();

  return (
    <div className={`admin ${menu ? "menu-open" : ""}`}>
      <div className="adm-shell">
        <div className="adm-scrim" onClick={() => setMenu(false)} />

        <aside className="adm-side">
          <div className="adm-brand">
            <span className="adm-brand-mark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/gigabike-logo.jpg" alt="GigaBike" />
            </span>
            <span className="adm-brand-txt">
              <b>GigaBike</b>
              <span>{at("brand.sub")}</span>
            </span>
          </div>
          <div className="adm-navlabel">{at("nav.manage")}</div>
          {NAV.map((n) => (
            <Link
              key={n.key}
              href={n.href}
              className={`adm-nav ${active === n.key ? "on" : ""}`}
              onClick={() => setMenu(false)}
            >
              <Icon name={n.icon} />
              {at(n.label)}
            </Link>
          ))}
          <div className="adm-side-foot">
            <div className="adm-user">
              <span className="adm-user-av">{avatar}</span>
              <span className="adm-user-info">
                <b>{at("user.role")}</b>
                <span>{email}</span>
              </span>
            </div>
            <form action={signOut}>
              <button type="submit" className="adm-logout">
                <Icon name="logout" />
                {at("logout")}
              </button>
            </form>
          </div>
        </aside>

        <div className="adm-main">
          <header className="adm-top">
            <button
              className="adm-burger"
              onClick={() => setMenu((m) => !m)}
              aria-label="Menu"
            >
              <Icon name="menu" />
            </button>
            <div className="adm-top-titles">
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
            <div className="adm-top-right">
              <AdminLangToggle locale={locale} />
              <a
                className="btn btn-ghost btn-sm"
                href={webUrl}
                target="_blank"
                rel="noreferrer"
                style={{ padding: "9px 14px" }}
              >
                <Icon name="external" size={16} />
                {at("dash.viewSite")}
              </a>
            </div>
          </header>

          <div className="adm-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
