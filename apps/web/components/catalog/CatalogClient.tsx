"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Icon } from "@gigabike/ui";
import { categoryName, type Bike, type Category } from "@gigabike/supabase";
import { createT, type Dict, type Locale } from "@/lib/i18n";
import { useScrollLock } from "@/lib/useScrollLock";
import { BikeCard } from "@/components/BikeCard";

const PRICE_CAP = 3000;
const PAGE_SIZE = 9;
const SORT_VALUES = ["featured", "newest", "priceLow", "priceHigh"] as const;
const CONDITION_VALUES = ["all", "New", "Used"] as const;

type SortValue = (typeof SORT_VALUES)[number];
type ConditionValue = (typeof CONDITION_VALUES)[number];
export type CatalogInitialState = {
  q?: string;
  category?: string;
  condition?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
};

function readInt(value: string | undefined, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function readCondition(value: string | undefined): ConditionValue {
  return CONDITION_VALUES.includes(value as ConditionValue) ? (value as ConditionValue) : "all";
}

function readSort(value: string | undefined): SortValue {
  return SORT_VALUES.includes(value as SortValue) ? (value as SortValue) : "featured";
}

/** Windowed page numbers with ellipses, e.g. [1, "…", 4, 5, 6, "…", 12]. */
function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const wanted = new Set([1, total, current, current - 1, current + 1]);
  const nums = [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of nums) {
    if (p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

export function CatalogClient({
  locale,
  dict,
  bikes,
  categories,
  initialState,
}: {
  locale: Locale;
  dict: Dict;
  bikes: Bike[];
  categories: Category[];
  initialState?: CatalogInitialState;
}) {
  const router = useRouter();
  const t = createT(dict);
  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const initialCategory =
    initialState?.category && catById.has(initialState.category) ? initialState.category : "all";

  const [query, setQuery] = useState(initialState?.q ?? "");
  const [category, setCategory] = useState(initialCategory);
  const [condition, setCondition] = useState<ConditionValue>(
    readCondition(initialState?.condition),
  );
  const [maxPrice, setMaxPrice] = useState(
    clamp(readInt(initialState?.maxPrice, PRICE_CAP), 160, PRICE_CAP),
  );
  const [sort, setSort] = useState<SortValue>(readSort(initialState?.sort));
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(Math.max(1, readInt(initialState?.page, 1)));
  const catalogMainRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useScrollLock(mobileFilters);

  useEffect(() => {
    if (!mobileFilters) return;

    window.history.pushState(
      { ...(window.history.state ?? {}), gigabikeDrawer: "filters" },
      "",
      window.location.href,
    );

    const handlePopState = () => {
      setMobileFilters(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [mobileFilters]);

  const closeMobileFilters = () => {
    if (mobileFilters && window.history.state?.gigabikeDrawer === "filters") {
      window.history.back();
      return;
    }
    setMobileFilters(false);
  };

  const conditions = CONDITION_VALUES;
  const sortOptions = [
    { value: "featured" as const, label: t("sort.featured") },
    { value: "newest" as const, label: t("sort.newest") },
    { value: "priceLow" as const, label: t("sort.priceLow") },
    { value: "priceHigh" as const, label: t("sort.priceHigh") },
  ];
  const activeSort = sortOptions.find((option) => option.value === sort) ?? {
    value: "featured",
    label: t("sort.featured"),
  };

  useEffect(() => {
    if (!sortOpen) return;

    const close = () => setSortOpen(false);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSortOpen(false);
    };

    window.addEventListener("click", close);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [sortOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = bikes.filter((b) => {
      if (category !== "all" && b.category_id !== category) return false;
      if (condition !== "all" && b.condition !== condition) return false;
      if (b.price > maxPrice) return false;
      if (q) {
        const hay = [
          b.name,
          b.category_id,
          categoryName(catById.get(b.category_id), locale),
          b.description,
          ...(b.keywords || []),
        ]
          .join(" ")
          .toLowerCase();
        if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
      }
      return true;
    });
    const order = new Map(bikes.map((b, i) => [b.id, i]));
    list = [...list].sort((a, b) => {
      if (sort === "priceLow") return a.price - b.price;
      if (sort === "priceHigh") return b.price - a.price;
      if (sort === "newest") return (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0);
      return Number(b.featured) - Number(a.featured) || a.price - b.price;
    });
    return list;
  }, [bikes, query, category, condition, maxPrice, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages); // clamp in case the list shrank
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const catalogHref = useMemo(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category !== "all") params.set("category", category);
    if (condition !== "all") params.set("condition", condition);
    if (maxPrice < PRICE_CAP) params.set("maxPrice", String(maxPrice));
    if (sort !== "featured") params.set("sort", sort);
    if (currentPage > 1) params.set("page", String(currentPage));
    const qs = params.toString();
    return `/${locale}/bikes${qs ? `?${qs}` : ""}`;
  }, [category, condition, currentPage, locale, maxPrice, query, sort]);

  useEffect(() => {
    if (`${window.location.pathname}${window.location.search}` === catalogHref) return;
    router.replace(catalogHref, { scroll: false });
  }, [catalogHref, router]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const resetToFirstPage = () => setPage(1);

  const productHref = (slug: string) => {
    const params = new URLSearchParams({ from: catalogHref });
    return `/${locale}/bikes/${slug}?${params.toString()}`;
  };

  const goToPage = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    if (next === currentPage) return;
    setPage(next);
    requestAnimationFrame(() =>
      catalogMainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const activeCount =
    (category !== "all" ? 1 : 0) +
    (condition !== "all" ? 1 : 0) +
    (maxPrice < PRICE_CAP ? 1 : 0) +
    (query ? 1 : 0);

  const clear = () => {
    setQuery("");
    setCategory("all");
    setCondition("all");
    setMaxPrice(PRICE_CAP);
    resetToFirstPage();
  };

  const filterBody = (
    <>
      <div className="filter-block">
        <div className="filter-label mono">{t("filter.category")}</div>
        <div className="filter-opts">
          <button
            className={`fopt ${category === "all" ? "on" : ""}`}
            onClick={() => {
              setCategory("all");
              resetToFirstPage();
            }}
          >
            {t("filter.all")}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`fopt ${category === c.id ? "on" : ""}`}
              onClick={() => {
                setCategory(c.id);
                resetToFirstPage();
              }}
            >
              {categoryName(c, locale)}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-block">
        <div className="filter-label mono">{t("filter.condition")}</div>
        <div className="filter-opts">
          {conditions.map((c) => (
            <button
              key={c}
              className={`fopt ${condition === c ? "on" : ""}`}
              onClick={() => {
                setCondition(c);
                resetToFirstPage();
              }}
            >
              {c === "all" ? t("filter.all") : c === "New" ? t("cond.New") : t("cond.Used")}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-block">
        <div className="filter-label mono">{t("filter.price")}</div>
        <div className="price-row">
          <span>0 ₾</span>
          <strong>
            {maxPrice >= PRICE_CAP ? "3,000+ ₾" : `${maxPrice.toLocaleString()} ₾`}
          </strong>
        </div>
        <input
          type="range"
          min={160}
          max={PRICE_CAP}
          step={20}
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(+e.target.value);
            resetToFirstPage();
          }}
          className="range"
        />
      </div>
      {activeCount > 0 && (
        <button className="btn btn-ghost btn-sm clear-btn" onClick={clear}>
          <Icon name="close" size={15} />
          {t("filter.clear")} ({activeCount})
        </button>
      )}
    </>
  );

  return (
    <div className="page catalog">
      <div className="cat-hero">
        <div className="wrap">
          <div className="eyebrow sec-eye">{t("nav.bikes")}</div>
          <h1>{t("catalog.title")}</h1>
          <p>
            {filtered.length} {t("catalog.sub")}
          </p>
        </div>
      </div>

      <div className="wrap catalog-grid">
        <aside className="filters-desk">
          <div className="filters-card">
            <div className="filters-head">
              <Icon name="sliders" />
              <span>
                {t("filter.category")} &amp; {t("filter.price")}
              </span>
            </div>
            {filterBody}
          </div>
        </aside>

        <div className="catalog-main" ref={catalogMainRef}>
          <div className="catalog-bar">
            <div className="search">
              <Icon name="search" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  resetToFirstPage();
                }}
                placeholder={t("search.ph")}
              />
              {query && (
                <button
                  className="search-clear"
                  onClick={() => {
                    setQuery("");
                    resetToFirstPage();
                  }}
                >
                  <Icon name="close" size={16} />
                </button>
              )}
            </div>
            <div className="bar-right">
              <button
                className="btn btn-ghost btn-sm mobile-filter-btn"
                onClick={() => setMobileFilters(true)}
              >
                <Icon name="sliders" size={17} />
                {t("filter.category")}
                {activeCount ? ` (${activeCount})` : ""}
              </button>
              <div className={`sort ${sortOpen ? "open" : ""}`} onClick={(e) => e.stopPropagation()}>
                <span className="mono">{t("sort.label")}</span>
                <button
                  type="button"
                  className="sort-trigger"
                  onClick={() => setSortOpen((open) => !open)}
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                >
                  <span>{activeSort.label}</span>
                  <Icon
                    name="chevron"
                    size={16}
                    style={{ transform: sortOpen ? "rotate(180deg)" : undefined }}
                  />
                </button>
                {sortOpen && (
                  <div className="sort-menu" role="listbox" aria-label={t("sort.label")}>
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`sort-option ${sort === option.value ? "on" : ""}`}
                        role="option"
                        aria-selected={sort === option.value}
                        onClick={() => {
                          setSort(option.value);
                          resetToFirstPage();
                          setSortOpen(false);
                        }}
                      >
                        <span>{option.label}</span>
                        {sort === option.value && <Icon name="check" size={15} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty">
              <span className="empty-ic">
                <Icon name="search" />
              </span>
              <p>{t("filter.none")}</p>
              <button className="btn btn-soft btn-sm" onClick={clear}>
                {t("filter.clear")}
              </button>
            </div>
          ) : (
            <>
              <div
                className="catalog-cards"
                key={`${category}-${condition}-${sort}-${query}-${currentPage}`}
              >
                {pageItems.map((b, i) => (
                  <BikeCard
                    key={b.id}
                    bike={b}
                    category={catById.get(b.category_id)}
                    locale={locale}
                    dict={dict}
                    delay={Math.min(i, 8) * 50}
                    href={productHref(b.slug)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="pagination">
                  <button
                    type="button"
                    className="pag-btn"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label={t("pag.prev")}
                  >
                    <Icon name="chevron" size={18} style={{ transform: "rotate(90deg)" }} />
                  </button>
                  {pageList(currentPage, totalPages).map((p, idx) =>
                    p === "…" ? (
                      <span key={`gap-${idx}`} className="pag-gap" aria-hidden="true">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        className={`pag-num ${p === currentPage ? "on" : ""}`}
                        onClick={() => goToPage(p)}
                        aria-current={p === currentPage ? "page" : undefined}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    className="pag-btn"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label={t("pag.next")}
                  >
                    <Icon name="chevron" size={18} style={{ transform: "rotate(-90deg)" }} />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>

      {mounted &&
        mobileFilters &&
        createPortal(
          <div className="mobile-menu" onClick={closeMobileFilters}>
            <div className="mobile-panel filters-panel" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-top">
                <span className="brand-name">{t("filter.category")}</span>
                <button className="icon-btn" onClick={closeMobileFilters} aria-label="Close">
                  <Icon name="close" />
                </button>
              </div>
              {filterBody}
              <button
                className="btn btn-primary btn-lg"
                style={{ marginTop: 18, width: "100%" }}
                onClick={closeMobileFilters}
              >
                {t("catalog.show", { n: filtered.length })}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
