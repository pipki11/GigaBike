import { cookies } from "next/headers";
import Link from "next/link";
import { Icon } from "@gigabike/ui";
import { categoryName, getBikes, getCategories, getRepairGroups } from "@gigabike/supabase";
import { DEFAULT_ADMIN_LOCALE, isAdminLocale, makeAt } from "@/lib/i18n";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";

export default async function DashboardPage() {
  const c = await cookies();
  const raw = c.get("gb_admin_lang")?.value ?? "";
  const locale = isAdminLocale(raw) ? raw : DEFAULT_ADMIN_LOCALE;
  const at = makeAt(locale);
  const loc = locale;

  let email = "admin@gigabike.ge";
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) email = user.email;
  }
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";

  const [bikes, categories, groups] = await Promise.all([
    getBikes(),
    getCategories(),
    getRepairGroups(),
  ]);
  const catById = new Map(categories.map((cat) => [cat.id, cat]));
  const featured = bikes.filter((b) => b.featured).length;
  const serviceCount = groups.reduce((n, g) => n + g.items.length, 0);

  const kpis: { icon: string; cls: string; val: number; label: string }[] = [
    { icon: "bike", cls: "", val: bikes.length, label: at("kpi.bikes") },
    { icon: "star", cls: "pink", val: featured, label: at("kpi.featured") },
    { icon: "box", cls: "ink", val: categories.length, label: at("kpi.categories") },
    { icon: "tag", cls: "", val: serviceCount, label: at("kpi.services") },
  ];

  const recent = bikes.slice(0, 6);

  const inventory = categories.map((cat) => ({
    cat,
    n: bikes.filter((b) => b.category_id === cat.id).length,
  }));
  const maxN = Math.max(1, ...inventory.map((x) => x.n));

  return (
    <AdminShell
      locale={locale}
      email={email}
      active="dashboard"
      title={at("nav.dashboard")}
      subtitle={at("sub.dashboard")}
      webUrl={webUrl}
    >
      <div className="kpi-grid">
        {kpis.map((k) => (
          <div key={k.label} className="kpi">
            <span className={`kpi-ic ${k.cls}`}>
              <Icon name={k.icon} />
            </span>
            <span className="kpi-val">{k.val}</span>
            <span className="kpi-label">{k.label}</span>
          </div>
        ))}
      </div>

      <div className="adm-grid-2 adm-section-gap">
        {/* recent bikes */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>{at("dash.recent")}</h2>
              <p>{at("dash.recentSub")}</p>
            </div>
            <div className="panel-actions">
              <Link className="btn btn-ghost btn-sm" href="/bikes">
                {at("dash.manage")}
                <Icon name="arrow" size={15} />
              </Link>
            </div>
          </div>
          {recent.length === 0 ? (
            <div className="empty-row">{at("dash.emptyBikes")}</div>
          ) : (
            <div className="recent">
              {recent.map((b) => (
                <div key={b.id} className="recent-item">
                  {b.image_urls?.[0] ? (
                    <span className="recent-av" style={{ overflow: "hidden", padding: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={b.image_urls[0]}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </span>
                  ) : (
                    <span
                      className="recent-av"
                      style={{
                        background: `oklch(0.92 0.05 ${b.hue})`,
                        color: `oklch(0.5 0.14 ${b.hue})`,
                      }}
                    >
                      <Icon name="bike" size={18} />
                    </span>
                  )}
                  <div className="recent-info">
                    <b>{b.name}</b>
                    <span>{categoryName(catById.get(b.category_id), loc)}</span>
                  </div>
                  <span className="recent-time">{b.price.toLocaleString()} ₾</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* inventory by category */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>{at("dash.inventory")}</h2>
              <p>{at("dash.inventorySub")}</p>
            </div>
          </div>
          <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
            {inventory.map(({ cat, n }) => (
              <div key={cat.id} className="cat-bar">
                <span
                  className="cat-bar-ic"
                  style={{
                    background: `oklch(0.92 0.05 ${cat.hue})`,
                    color: `oklch(0.5 0.14 ${cat.hue})`,
                  }}
                >
                  <Icon name="bike" />
                </span>
                <span className="cat-bar-name">{categoryName(cat, loc)}</span>
                <span className="cat-bar-track">
                  <span
                    className="cat-bar-fill"
                    style={{
                      width: `${(n / maxN) * 100}%`,
                      background: `oklch(0.62 0.18 ${cat.hue})`,
                    }}
                  />
                </span>
                <span className="cat-bar-n">{n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
