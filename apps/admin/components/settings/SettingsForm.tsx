"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@gigabike/ui";
import type { ShopSettings } from "@gigabike/supabase";
import { makeAt, type AdminLocale } from "@/lib/i18n";
import { updateSettings } from "@/app/settings/actions";

export function SettingsForm({
  locale,
  shop,
}: {
  locale: AdminLocale;
  shop: ShopSettings;
}) {
  const at = makeAt(locale);
  const router = useRouter();
  const [form, setForm] = useState<ShopSettings>(shop);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof ShopSettings>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updateSettings(form);
      if (res.ok) {
        setToast(true);
        setTimeout(() => setToast(false), 2600);
        router.refresh();
      } else {
        setError(at("err.generic"));
      }
    });
  }

  const field = (
    key: keyof ShopSettings,
    label: string,
    hint?: string,
    pre?: string,
  ) => (
    <div className={`fld ${pre ? "fld-pre" : ""}`}>
      <label>{label}</label>
      <input value={form[key]} onChange={(e) => set(key, e.target.value)} />
      {pre && <span className="cur">{pre}</span>}
      {hint && <span style={{ fontSize: "0.74rem", color: "var(--muted)" }}>{hint}</span>}
    </div>
  );

  return (
    <>
      <div className="panel">
        <div className="panel-head">
          <span className="kpi-ic" style={{ width: 42, height: 42, borderRadius: 12 }}>
            <Icon name="settings" />
          </span>
          <div>
            <h2>{at("set.title")}</h2>
            <p>{at("set.intro")}</p>
          </div>
        </div>

        <div style={{ padding: "22px", display: "flex", flexDirection: "column", gap: 15 }}>
          {field("name", at("set.name"))}
          {field("tagline", at("set.tagline"))}
          <div className="fld-row">
            {field("phone", at("set.phone"))}
            {field("whatsapp", at("set.whatsapp"), at("set.whatsappHint"))}
          </div>
          <div className="fld-row">
            {field("facebook", at("set.facebook"), at("set.facebookHint"))}
            {field("email", at("set.email"))}
          </div>
          {field("address", at("set.address"))}
          {field("hours", at("set.hours"))}

          {error && (
            <div className="login-err">
              <Icon name="alert" />
              {error}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
            <button className="btn btn-primary" onClick={save} disabled={pending}>
              <Icon name="save" size={16} />
              {pending ? "…" : at("set.save")}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast-stack">
          <div className="toast">
            <Icon name="check" />
            {at("set.saved")}
          </div>
        </div>
      )}
    </>
  );
}
