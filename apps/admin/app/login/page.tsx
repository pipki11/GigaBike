import { cookies } from "next/headers";
import { Icon } from "@gigabike/ui";
import { DEFAULT_ADMIN_LOCALE, isAdminLocale, makeAt } from "@/lib/i18n";
import { LoginForm } from "./LoginForm";
import { AdminLangToggle } from "@/components/AdminLangToggle";

export default async function LoginPage() {
  const c = await cookies();
  const raw = c.get("gb_admin_lang")?.value ?? "";
  const locale = isAdminLocale(raw) ? raw : DEFAULT_ADMIN_LOCALE;
  const at = makeAt(locale);

  const feats: [string, string][] = [
    ["bike", at("login.f1")],
    ["tag", at("login.f2")],
    ["inbox", at("login.f3")],
  ];

  return (
    <div className="login-wrap">
      <aside className="login-aside">
        <div className="login-aside-bg" aria-hidden="true">
          <span className="blob b1" />
          <span className="blob b2" />
        </div>
        <div className="login-aside-top">
          <span className="login-aside-mark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/gigabike-logo.jpg" alt="GigaBike" />
          </span>
          <span className="login-aside-brand">GigaBike</span>
        </div>
        <div className="login-aside-mid">
          <h2>
            {at("login.h")
              .split("\n")
              .map((l, i) => (
                <span key={i} style={{ display: "block" }}>
                  {l}
                </span>
              ))}
          </h2>
          <p>{at("login.p")}</p>
        </div>
        <div className="login-aside-foot">
          {feats.map(([ic, label]) => (
            <span key={label} className="login-feat">
              <Icon name={ic} />
              {label}
            </span>
          ))}
        </div>
      </aside>

      <div className="login-form-side">
        <div className="login-card">
          <div className="login-card-head">
            <div className="eyebrow">{at("login.eyebrow")}</div>
            <h1>{at("login.title")}</h1>
            <p>{at("login.sub")}</p>
          </div>
          <LoginForm locale={locale} />
          <div className="login-lang">
            <AdminLangToggle locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}
