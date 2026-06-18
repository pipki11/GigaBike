"use client";

import { useEffect, useState } from "react";
import { Icon } from "@gigabike/ui";
import { categoryName, type Category, type ShopSettings } from "@gigabike/supabase";
import { createT, type Dict, type Locale } from "@/lib/i18n";
import { googleMapsSearchHref } from "@/lib/maps";
import { Reveal } from "@/components/Reveal";

export function RepairForm({
  locale,
  dict,
  shop,
  categories,
}: {
  locale: Locale;
  dict: Dict;
  shop: ShopSettings;
  categories: Category[];
}) {
  const t = createT(dict);
  const firstCat = categories[0]?.id ?? "city";
  const [form, setForm] = useState({ name: "", phone: "", bike: firstCat, problem: "" });
  const [err, setErr] = useState(false);
  const [bikeOpen, setBikeOpen] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const selectedBike = categories.find((c) => c.id === form.bike);
  const selectedBikeLabel = selectedBike ? categoryName(selectedBike, locale) : form.bike;
  const mapsHref = googleMapsSearchHref(shop.name, shop.address);

  useEffect(() => {
    if (!bikeOpen) return;

    const close = () => setBikeOpen(false);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setBikeOpen(false);
    };

    window.addEventListener("click", close);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [bikeOpen]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setErr(true);
      return;
    }
    setErr(false);
    const cat = categories.find((c) => c.id === form.bike);
    const bikeLabel = cat ? categoryName(cat, locale) : form.bike;
    const lines = [
      `${t("rp.formKicker")} — ${shop.name}`,
      `${t("rp.fName")}: ${form.name}`,
      `${t("rp.fPhone")}: ${form.phone}`,
      `${t("rp.fBike")}: ${bikeLabel}`,
      form.problem ? `${t("rp.fProblem")} ${form.problem}` : "",
    ].filter(Boolean);
    window.open(
      `https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank",
    );
  }

  const info = [
    { ic: "phone", label: t("label.phone"), val: shop.phone, href: `tel:${shop.phone}` },
    { ic: "chat", label: t("label.whatsapp"), val: t("label.messageUs"), href: `https://wa.me/${shop.whatsapp}` },
    { ic: "pin", label: t("label.address"), val: shop.address, href: mapsHref },
    { ic: "clock", label: t("foot.hours"), val: t("shop.hours"), href: null as string | null },
  ];

  return (
    <section className="section rep-book">
      <div className="wrap rep-book-in">
        <Reveal className="rep-form-wrap">
          <div className="eyebrow sec-eye">{t("rp.formKicker")}</div>
          <h2>{t("rp.formTitle")}</h2>
          <p className="muted" style={{ marginTop: 10 }}>
            {t("rp.formSub")}
          </p>
          <form className="rep-form" onSubmit={submit}>
            <div className="rf-row">
              <label className="rf-field">
                <span>{t("rp.fName")}</span>
                <input value={form.name} onChange={set("name")} placeholder="—" />
              </label>
              <label className="rf-field">
                <span>{t("rp.fPhone")}</span>
                <input
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder={shop.phone}
                  inputMode="tel"
                />
              </label>
            </div>
            <div className="rf-field">
              <span>{t("rp.fBike")}</span>
              <div className={`rf-select ${bikeOpen ? "open" : ""}`} onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="rf-select-trigger"
                  onClick={() => setBikeOpen((open) => !open)}
                  aria-haspopup="listbox"
                  aria-expanded={bikeOpen}
                >
                  <span>{selectedBikeLabel}</span>
                  <Icon
                    name="chevron"
                    style={{ transform: bikeOpen ? "rotate(180deg)" : undefined }}
                  />
                </button>
                {bikeOpen && (
                  <div className="rf-select-menu" role="listbox" aria-label={t("rp.fBike")}>
                    {categories.map((c) => {
                      const label = categoryName(c, locale);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          className={`rf-select-option ${form.bike === c.id ? "on" : ""}`}
                          role="option"
                          aria-selected={form.bike === c.id}
                          onClick={() => {
                            setForm((f) => ({ ...f, bike: c.id }));
                            setBikeOpen(false);
                          }}
                        >
                          <span>{label}</span>
                          {form.bike === c.id && <Icon name="check" size={15} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <label className="rf-field">
              <span>{t("rp.fProblem")}</span>
              <textarea
                value={form.problem}
                onChange={set("problem")}
                placeholder={t("rp.fProblemPh")}
                rows={3}
              />
            </label>
            {err && (
              <div className="rf-error">
                <Icon name="close" />
                {t("rp.fError")}
              </div>
            )}
            <button type="submit" className="btn ca-wa btn-lg rf-submit">
              <Icon name="chat" />
              {t("rp.fSend")}
            </button>
            <div className="rf-alt">
              {t("rp.fAlt")} <a href={`tel:${shop.phone}`}>{shop.phone}</a>
            </div>
          </form>
        </Reveal>

        <Reveal className="rep-info" delay={100}>
          <div className="rep-map">
            <iframe
              title={`${shop.name} - ${shop.address}`}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2978.2770430137502!2d44.8029952!3d41.714540299999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40440de459e6957b%3A0x15be67c112aa892b!2sGigabike%20bicycle%20store!5e0!3m2!1sen!2sge!4v1781695213103!5m2!1sen!2sge"
              width="600"
              height="450"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
            />
          </div>
          <div className="rep-info-rows">
            {info.map((r) => {
              const inner = (
                <>
                  <span className="cr-ic">
                    <Icon name={r.ic} />
                  </span>
                  <div>
                    <span className="cr-label mono">{r.label}</span>
                    <strong>{r.val}</strong>
                  </div>
                </>
              );
              return r.href ? (
                <a
                  key={r.label}
                  className={`contact-row ${r.href.includes("wa.me") ? "cr-wa" : ""}`}
                  href={r.href}
                  target={r.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                >
                  {inner}
                </a>
              ) : (
                <div key={r.label} className="contact-row">
                  {inner}
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
