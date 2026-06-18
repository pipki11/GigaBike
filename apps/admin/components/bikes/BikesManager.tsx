"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@gigabike/ui";
import {
  categoryName,
  type Bike,
  type Category,
  type Condition,
  type Locale,
} from "@gigabike/supabase";
import { makeAt, type AdminLocale } from "@/lib/i18n";
import { slugify } from "@/lib/slug";
import {
  createBike,
  deleteBike,
  updateBike,
  type ActionResult,
  type BikeInput,
} from "@/app/bikes/actions";
import { deleteBikeImage, uploadBikeImage, type UploadResult } from "@/app/bikes/image-actions";

const MAX_IMAGES = 4;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const TARGET_UPLOAD_BYTES = 4.7 * 1024 * 1024;
const MAX_IMAGE_EDGE = 1800;
const ACCEPTED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);

/** A sensible starting set of search keywords from the name + category,
    so the owner never has to brainstorm them (still fully editable). */
function suggestKeywords(name: string, categoryId: string): string {
  const words = name
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((w) => w.length > 1);
  return [...new Set([...words, categoryId].filter(Boolean))].join(", ");
}

type FormState = {
  id?: string;
  name: string;
  slug: string;
  category_id: string;
  price: string;
  condition: Condition;
  featured: boolean;
  description: string;
  keywords: string;
  images: FormImage[];
};

type FormImage = {
  id: string;
  previewUrl: string;
  storedUrl?: string;
  file?: File;
};

function storedImage(url: string, index: number): FormImage {
  return {
    id: `stored:${index}:${url}`,
    previewUrl: url,
    storedUrl: url,
  };
}

function revokeLocalPreviews(images: FormImage[]) {
  for (const image of images) {
    if (image.file) URL.revokeObjectURL(image.previewUrl);
  }
}

function emptyForm(categories: Category[]): FormState {
  return {
    name: "",
    slug: "",
    category_id: categories[0]?.id ?? "",
    price: "",
    condition: "New",
    featured: false,
    description: "",
    keywords: "",
    images: [],
  };
}

function fromBike(b: Bike): FormState {
  return {
    id: b.id,
    name: b.name,
    slug: b.slug,
    category_id: b.category_id,
    price: String(b.price),
    condition: b.condition,
    featured: b.featured,
    description: b.description,
    keywords: b.keywords.join(", "),
    images: (b.image_urls ?? []).map(storedImage),
  };
}

function uploadErrorText(at: ReturnType<typeof makeAt>, error: Exclude<UploadResult, { ok: true }>["error"]) {
  if (error === "auth") return at("img.errAuth");
  if (error === "noenv") return at("img.errNoEnv");
  if (error === "type") return at("img.errType");
  if (error === "toobig") return at("img.errTooBig");
  if (error === "nofile") return at("img.errNoFile");
  return at("img.errUpload");
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image could not be decoded"));
    };
    img.src = url;
  });
}

async function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

async function prepareImageForUpload(file: File): Promise<File> {
  if (file.size <= MAX_UPLOAD_BYTES) return file;
  if (!file.type.startsWith("image/")) return file;

  try {
    const img = await loadImage(file);
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(img, 0, 0, width, height);

    let best: Blob | null = null;
    for (const quality of [0.84, 0.74, 0.64, 0.54]) {
      const blob = await canvasToBlob(canvas, quality);
      if (!blob) continue;
      best = blob;
      if (blob.size <= TARGET_UPLOAD_BYTES) break;
    }
    if (!best || best.size > file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") || "bike-photo";
    return new File([best], `${name}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}

export function BikesManager({
  locale,
  bikes,
  categories,
  webUrl,
}: {
  locale: AdminLocale;
  bikes: Bike[];
  categories: Category[];
  webUrl: string;
}) {
  const at = makeAt(locale);
  const loc = locale as Locale;
  const router = useRouter();
  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const [query, setQuery] = useState("");
  const [form, setForm] = useState<FormState | null>(null); // null = modal closed
  const [slugEdited, setSlugEdited] = useState(false);
  const [keywordsEdited, setKeywordsEdited] = useState(false);
  const [delTarget, setDelTarget] = useState<Bike | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bikes;
    return bikes.filter((b) =>
      [b.name, b.slug, b.category_id, ...(b.keywords || [])]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [bikes, query]);

  const isEdit = Boolean(form?.id);

  function openNew() {
    setError(null);
    setSlugEdited(false);
    setKeywordsEdited(false);
    setForm(emptyForm(categories));
  }
  function openEdit(b: Bike) {
    setError(null);
    setSlugEdited(true); // keep existing slug; don't auto-rewrite from name
    setKeywordsEdited(true); // keep the bike's existing keywords
    setForm(fromBike(b));
  }
  function close() {
    if (pending || uploading) return;
    if (form) revokeLocalPreviews(form.images);
    setForm(null);
    setError(null);
  }

  function patch(p: Partial<FormState>) {
    setForm((f) => (f ? { ...f, ...p } : f));
  }

  function onName(name: string) {
    patch({
      name,
      ...(slugEdited ? {} : { slug: slugify(name) }),
      ...(keywordsEdited || !form ? {} : { keywords: suggestKeywords(name, form.category_id) }),
    });
  }

  function onCategory(categoryId: string) {
    patch({
      category_id: categoryId,
      ...(keywordsEdited || !form ? {} : { keywords: suggestKeywords(form.name, categoryId) }),
    });
  }

  async function addImages(files: FileList | null) {
    if (!files || files.length === 0 || !form) return;
    const remaining = MAX_IMAGES - form.images.length;
    if (remaining <= 0) return;
    setUploading(true);
    setError(null);
    const added: FormImage[] = [];
    try {
      for (const file of Array.from(files).slice(0, remaining)) {
        if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
          setError(at("img.errType"));
          continue;
        }

        const preparedFile = await prepareImageForUpload(file);
        if (preparedFile.size > MAX_UPLOAD_BYTES) {
          setError(at("img.errTooBig"));
          continue;
        }

        added.push({
          id: `local:${crypto.randomUUID()}`,
          previewUrl: URL.createObjectURL(preparedFile),
          file: preparedFile,
        });
      }
    } catch {
      setError(at("img.errUpload"));
    } finally {
      setUploading(false);
    }
    if (added.length) {
      setForm((f) => (f ? { ...f, images: [...f.images, ...added].slice(0, MAX_IMAGES) } : f));
    }
  }

  function removeImage(id: string) {
    setForm((f) => {
      if (!f) return f;
      const image = f.images.find((item) => item.id === id);
      if (image?.file) URL.revokeObjectURL(image.previewUrl);
      return { ...f, images: f.images.filter((item) => item.id !== id) };
    });
  }

  function moveImage(index: number, dir: -1 | 1) {
    setForm((f) => {
      if (!f) return f;
      const arr = [...f.images];
      const j = index + dir;
      if (j < 0 || j >= arr.length) return f;
      const a = arr[index];
      const b = arr[j];
      if (a === undefined || b === undefined) return f;
      arr[index] = b;
      arr[j] = a;
      return { ...f, images: arr };
    });
  }

  function errorText(e: Exclude<ActionResult, { ok: true }>["error"]) {
    if (e === "required") return at("err.required");
    if (e === "slug") return at("err.slug");
    return at("err.generic");
  }

  async function uploadImagesForSave(images: FormImage[]) {
    const urls: string[] = [];
    const uploadedUrls: string[] = [];

    for (const image of images) {
      if (image.storedUrl) {
        urls.push(image.storedUrl);
        continue;
      }
      if (!image.file) continue;

      const fd = new FormData();
      fd.append("file", image.file);
      const res = await uploadBikeImage(fd);
      if (!res.ok) {
        await Promise.all(uploadedUrls.map((url) => deleteBikeImage(url)));
        return { ok: false as const, error: uploadErrorText(at, res.error) };
      }

      urls.push(res.url);
      uploadedUrls.push(res.url);
    }

    return { ok: true as const, urls, uploadedUrls };
  }

  function save() {
    if (!form) return;
    setError(null);
    const formSnapshot = form;
    startTransition(async () => {
      setUploading(true);
      const uploadRes = await uploadImagesForSave(formSnapshot.images);
      if (!uploadRes.ok) {
        setError(uploadRes.error);
        setUploading(false);
        return;
      }

      const input: BikeInput = {
        id: formSnapshot.id,
        slug: slugify(formSnapshot.slug || formSnapshot.name),
        name: formSnapshot.name,
        category_id: formSnapshot.category_id,
        price: Number(formSnapshot.price),
        condition: formSnapshot.condition,
        featured: formSnapshot.featured,
        description: formSnapshot.description,
        keywords: formSnapshot.keywords.split(",").map((k) => k.trim()).filter(Boolean),
        image_urls: uploadRes.urls,
      };

      const res = formSnapshot.id ? await updateBike(input) : await createBike(input);
      if (res.ok) {
        revokeLocalPreviews(formSnapshot.images);
        setToast(formSnapshot.id ? at("toast.updated") : at("toast.created"));
        setForm(null);
        router.refresh();
      } else {
        await Promise.all(uploadRes.uploadedUrls.map((url) => deleteBikeImage(url)));
        setError(errorText(res.error));
      }
      setUploading(false);
    });
  }

  function confirmDelete() {
    if (!delTarget) return;
    const id = delTarget.id;
    startTransition(async () => {
      const res = await deleteBike(id);
      if (res.ok) {
        setToast(at("toast.deleted"));
        setDelTarget(null);
        router.refresh();
      } else {
        setError(at("err.generic"));
        setDelTarget(null);
      }
    });
  }

  return (
    <>
      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>{at("nav.bikes")}</h2>
            <p>{at("bikes.count", { n: bikes.length })}</p>
          </div>
          <div className="panel-actions">
            <div className="adm-search">
              <Icon name="search" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={at("bikes.search")}
              />
            </div>
            <button className="btn btn-primary btn-sm" onClick={openNew}>
              <Icon name="plus" size={16} />
              {at("bikes.add")}
            </button>
          </div>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>{at("th.bike")}</th>
                <th>{at("th.category")}</th>
                <th>{at("th.price")}</th>
                <th>{at("th.status")}</th>
                <th aria-hidden="true" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="tbl-bike">
                      {b.image_urls?.[0] ? (
                        <span className="tbl-thumb">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={b.image_urls[0]}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </span>
                      ) : (
                        <span
                          className="tbl-thumb"
                          style={{
                            background: `oklch(0.9 0.05 ${b.hue})`,
                            display: "grid",
                            placeItems: "center",
                            color: `oklch(0.5 0.12 ${b.hue})`,
                          }}
                        >
                          <Icon name="bike" size={18} />
                        </span>
                      )}
                      <div>
                        <b>{b.name}</b>
                        <span>/{b.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="adm-badge cat">
                      {categoryName(catById.get(b.category_id), loc)}
                    </span>
                  </td>
                  <td>
                    <span className="tbl-price">
                      {b.price.toLocaleString()} <em>₾</em>
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span className={`adm-badge ${b.condition === "New" ? "new" : "used"}`}>
                        {b.condition === "New" ? at("cond.new") : at("cond.used")}
                      </span>
                      {b.featured && (
                        <span className="adm-badge feat">
                          <Icon name="star" size={11} />
                          {at("badge.featured")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="tbl-actions">
                      <a
                        className="row-btn"
                        href={`${webUrl}/${locale}/bikes/${b.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={at("act.view")}
                        title={at("act.view")}
                      >
                        <Icon name="external" />
                      </a>
                      <button
                        className="row-btn"
                        onClick={() => openEdit(b)}
                        aria-label={at("modal.editBike")}
                        title={at("modal.editBike")}
                      >
                        <Icon name="edit" />
                      </button>
                      <button
                        className="row-btn danger"
                        onClick={() => setDelTarget(b)}
                        aria-label={at("del.confirm")}
                        title={at("del.confirm")}
                      >
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="empty-row">
              {bikes.length === 0 ? at("bikes.empty") : at("bikes.none")}
            </div>
          )}
        </div>
      </div>

      {/* ---------- add / edit modal ---------- */}
      {form && (
        <div className="modal-bg" onClick={close}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{isEdit ? at("modal.editBike") : at("modal.addBike")}</h2>
              <button className="x" onClick={close} aria-label={at("act.cancel")}>
                <Icon name="close" />
              </button>
            </div>
            <div className="modal-body">
              <div className="fld">
                <label>{at("f.name")}</label>
                <input value={form.name} onChange={(e) => onName(e.target.value)} autoFocus />
              </div>

              <div className="fld">
                <label>{at("f.slug")}</label>
                <input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    patch({ slug: e.target.value });
                  }}
                />
                <span style={{ fontSize: "0.74rem", color: "var(--muted)" }}>
                  {at("f.slugHint")}
                </span>
              </div>

              <div className="fld-row">
                <div className="fld fld-sel">
                  <label>{at("f.category")}</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => onCategory(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {categoryName(c, loc)}
                      </option>
                    ))}
                  </select>
                  <Icon name="chevron" />
                </div>
                <div className="fld fld-pre">
                  <label>{at("f.price")}</label>
                  <input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => patch({ price: e.target.value })}
                  />
                  <span className="cur">₾</span>
                </div>
              </div>

              <div className="fld-row">
                <div className="fld fld-sel">
                  <label>{at("f.condition")}</label>
                  <select
                    value={form.condition}
                    onChange={(e) => patch({ condition: e.target.value as Condition })}
                  >
                    <option value="New">{at("cond.new")}</option>
                    <option value="Used">{at("cond.used")}</option>
                  </select>
                  <Icon name="chevron" />
                </div>
                <button
                  type="button"
                  className="fld-toggle"
                  onClick={() => patch({ featured: !form.featured })}
                >
                  <span style={{ textAlign: "left" }}>
                    <b>{at("f.featured")}</b>
                    <span style={{ display: "block" }}>{at("f.featuredHint")}</span>
                  </span>
                  <span className={`switch ${form.featured ? "on" : ""}`} aria-hidden="true" />
                </button>
              </div>

              <div className="fld">
                <label>{at("f.description")}</label>
                <textarea
                  value={form.description}
                  onChange={(e) => patch({ description: e.target.value })}
                />
              </div>

              <div className="fld">
                <label>{at("f.keywords")}</label>
                <input
                  value={form.keywords}
                  onChange={(e) => {
                    setKeywordsEdited(true);
                    patch({ keywords: e.target.value });
                  }}
                />
                <span style={{ fontSize: "0.74rem", color: "var(--muted)" }}>
                  {at("f.keywordsHint")}
                </span>
              </div>

              <div className="fld">
                <label>{at("f.images")}</label>
                {form.images.length > 0 && (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {form.images.map((image, i) => {
                      const last = i === form.images.length - 1;
                      return (
                        <div
                          key={image.id}
                          style={{
                            position: "relative",
                            width: 100,
                            height: 74,
                            borderRadius: 10,
                            overflow: "hidden",
                            border:
                              i === 0
                                ? "2px solid var(--accent)"
                                : "1px solid var(--line)",
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image.previewUrl}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          {i === 0 && (
                            <span
                              style={{
                                position: "absolute",
                                top: 4,
                                left: 4,
                                fontSize: "0.55rem",
                                fontWeight: 700,
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                                background: "var(--accent)",
                                color: "#fff",
                                padding: "2px 6px",
                                borderRadius: 5,
                              }}
                            >
                              {at("img.main")}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            aria-label={at("img.remove")}
                            style={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              width: 22,
                              height: 22,
                              borderRadius: "50%",
                              background: "oklch(0.2 0.03 295 / 0.6)",
                              color: "#fff",
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            <Icon name="close" size={13} />
                          </button>
                          {form.images.length > 1 && (
                            <div
                              style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                display: "flex",
                                justifyContent: "space-between",
                                background: "oklch(0.2 0.03 295 / 0.55)",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => moveImage(i, -1)}
                                disabled={i === 0}
                                aria-label={at("img.moveLeft")}
                                style={{
                                  width: 26,
                                  height: 20,
                                  display: "grid",
                                  placeItems: "center",
                                  color: "#fff",
                                  opacity: i === 0 ? 0.3 : 1,
                                }}
                              >
                                <Icon
                                  name="arrow"
                                  size={13}
                                  style={{ transform: "rotate(180deg)" }}
                                />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveImage(i, 1)}
                                disabled={last}
                                aria-label={at("img.moveRight")}
                                style={{
                                  width: 26,
                                  height: 20,
                                  display: "grid",
                                  placeItems: "center",
                                  color: "#fff",
                                  opacity: last ? 0.3 : 1,
                                }}
                              >
                                <Icon name="arrow" size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {form.images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: 12,
                      border: "1.5px dashed var(--line)",
                      borderRadius: 11,
                      color: "var(--muted)",
                      fontSize: "0.9rem",
                      width: "100%",
                    }}
                  >
                    <Icon name="image" size={18} />
                    {uploading ? at("img.uploading") : at("img.add")}
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  multiple
                  onChange={(e) => {
                    addImages(e.target.files);
                    e.target.value = "";
                  }}
                  style={{ display: "none" }}
                />
                <span style={{ fontSize: "0.74rem", color: "var(--muted)" }}>
                  {form.images.length >= MAX_IMAGES
                    ? at("img.full")
                    : form.images.length > 1
                      ? at("img.mainHint")
                      : at("img.hint")}
                </span>
              </div>

              {error && (
                <div className="login-err">
                  <Icon name="alert" />
                  {error}
                </div>
              )}
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={close} disabled={pending}>
                {at("act.cancel")}
              </button>
              <button
                className="btn btn-primary"
                onClick={save}
                disabled={pending || uploading}
              >
                {pending ? "…" : isEdit ? at("act.save") : at("act.create")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- delete confirm ---------- */}
      {delTarget && (
        <div className="modal-bg" onClick={() => !pending && setDelTarget(null)}>
          <div
            className="modal"
            style={{ width: "min(420px, 100%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <h2>{at("del.title")}</h2>
              <button
                className="x"
                onClick={() => setDelTarget(null)}
                aria-label={at("act.cancel")}
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: "var(--muted)", lineHeight: 1.5 }}>
                {at("del.body", { name: delTarget.name })}
              </p>
            </div>
            <div className="modal-foot">
              <button
                className="btn btn-ghost"
                onClick={() => setDelTarget(null)}
                disabled={pending}
              >
                {at("act.cancel")}
              </button>
              <button
                className="btn btn-primary"
                style={{ background: "var(--pink)" }}
                onClick={confirmDelete}
                disabled={pending}
              >
                {pending ? "…" : at("del.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- toast ---------- */}
      {toast && (
        <div className="toast-stack">
          <div className="toast">
            <Icon name="check" />
            {toast}
          </div>
        </div>
      )}
    </>
  );
}
