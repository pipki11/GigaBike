"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@gigabike/ui";
import {
  groupBlurb,
  groupTitle,
  serviceName,
  type Locale,
  type RepairGroup,
} from "@gigabike/supabase";
import { makeAt, type AdminLocale } from "@/lib/i18n";
import { updateServicePrices } from "@/app/services/actions";

/** Stored prices look like "15 ₾" (or "" for "ask for price"). The editor
    works with the bare number; the ₾ is a fixed suffix re-attached on save. */
const numericOf = (s: string) => s.match(/\d+/)?.[0] ?? "";
const formatPrice = (n: string) => (n.trim() ? `${n.trim()} ₾` : "");

export function ServicesEditor({
  locale,
  groups,
}: {
  locale: AdminLocale;
  groups: RepairGroup[];
}) {
  const at = makeAt(locale);
  const loc = locale as Locale;
  const router = useRouter();

  const initial = useMemo(() => {
    const m: Record<string, string> = {};
    for (const g of groups) for (const it of g.items) m[it.id] = numericOf(it.price);
    return m;
  }, [groups]);

  const [prices, setPrices] = useState<Record<string, string>>(initial);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const [pending, startTransition] = useTransition();

  const dirty = useMemo(
    () => Object.keys(prices).filter((id) => prices[id] !== initial[id]),
    [prices, initial],
  );

  function save() {
    setError(null);
    const updates = dirty.map((id) => ({ id, price: formatPrice(prices[id] ?? "") }));
    startTransition(async () => {
      const res = await updateServicePrices(updates);
      if (res.ok) {
        setToast(true);
        setTimeout(() => setToast(false), 2600);
        router.refresh();
      } else {
        setError(at("err.generic"));
      }
    });
  }

  const empty = groups.every((g) => g.items.length === 0);

  return (
    <>
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head">
          <span className="kpi-ic" style={{ width: 42, height: 42, borderRadius: 12 }}>
            <Icon name="tag" />
          </span>
          <div>
            <h2>{at("nav.services")}</h2>
            <p>{at("sub.services")}</p>
          </div>
          <div className="panel-actions">
            <button
              className="btn btn-primary btn-sm"
              onClick={save}
              disabled={pending || dirty.length === 0}
            >
              <Icon name="save" size={16} />
              {pending ? "…" : at("svc.save")}
              {dirty.length > 0 && <span className="adm-badge count">{dirty.length}</span>}
            </button>
          </div>
        </div>
        {error && (
          <div style={{ padding: "0 22px 16px" }}>
            <div className="login-err">
              <Icon name="alert" />
              {error}
            </div>
          </div>
        )}
      </div>

      {empty && <div className="panel empty-row">{at("svc.empty")}</div>}

      {groups.map((g) => (
        <div key={g.id} className="svc-edit-group">
          <div className="svc-edit-head">
            <span
              className="svc-ic"
              style={{
                background: "var(--accent-soft)",
                color: "var(--accent-ink)",
                borderRadius: 12,
                display: "grid",
                placeItems: "center",
              }}
            >
              <Icon name={g.icon} />
            </span>
            <div>
              <b>{groupTitle(g, loc)}</b>
              <span>{groupBlurb(g, loc)}</span>
            </div>
          </div>
          {g.items.map((it) => (
            <div key={it.id} className="svc-edit-row">
              <div className="svc-edit-name">
                <b>{serviceName(it, loc)}</b>
                {it.name_en !== serviceName(it, loc) && <span>{it.name_en}</span>}
              </div>
              <div className="price-input">
                <input
                  value={prices[it.id] ?? ""}
                  placeholder={at("svc.pricePh")}
                  inputMode="numeric"
                  onChange={(e) =>
                    setPrices((p) => ({
                      ...p,
                      [it.id]: e.target.value.replace(/[^\d]/g, ""),
                    }))
                  }
                />
                <span className="cur">₾</span>
              </div>
            </div>
          ))}
        </div>
      ))}

      {toast && (
        <div className="toast-stack">
          <div className="toast">
            <Icon name="check" />
            {at("svc.saved")}
          </div>
        </div>
      )}
    </>
  );
}
