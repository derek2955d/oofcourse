"use client";
import { useCatalogConfig } from "./catalog-provider";
import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { type CategoryKey, type BrowseQuery, type Locale } from "@/lib/catalog";
import { filterFields, detailFields } from "@/lib/fields";
export function FilterPanel({
  category,
  query,
}: {
  category?: CategoryKey;
  query: BrowseQuery;
}) {
  const { locations, locationStates, subtypes } = useCatalogConfig();
  const t = useTranslations(),
    l = useLocale() as Locale,
    dialog = useRef<HTMLDialogElement>(null),
    params = useSearchParams();
  const path = category ? `/${l}/${category}` : `/${l}/search`;
  const form = (
    <form className="filter-form" action={path}>
      <input type="hidden" name="sort" value={query.sort} />
      <input type="hidden" name="state" value={query.state} />
      {!category && params.get("category") && (
        <input type="hidden" name="category" value={params.get("category")!} />
      )}
      <label className="field">
        {t("keyword")}
        <input type="search" name="q" defaultValue={query.q} maxLength={150} />
      </label>
      <label className="field">
        {t("location")}
        <select name="location" defaultValue={query.location}>
          <option value="">{t("geo.allAreas")}</option>
          {locations
            .filter((x) => locationStates[x[0]] === query.state)
            .map(([s, en, zh]) => (
              <option key={s} value={s}>
                {l === "zh" ? zh : en}
              </option>
            ))}
        </select>
      </label>
      {!locations.some((x) => locationStates[x[0]] === query.state) && (
        <p className="small-note">{t("geo.noAreas")}</p>
      )}
      {category && (
        <label className="field">
          {t("subcategory")}
          <select name="subcategory" defaultValue={query.subcategory}>
            <option value="">{t("any")}</option>
            {subtypes[category].map(([s, en, zh]) => (
              <option key={s} value={s}>
                {l === "zh" ? zh : en}
              </option>
            ))}
          </select>
        </label>
      )}
      {category !== "community" && (
        <div className="range-fields">
          <label className="field">
            {t("minPrice")}
            <input type="number" min="0" name="min" defaultValue={query.min} />
          </label>
          <label className="field">
            {t("maxPrice")}
            <input type="number" min="0" name="max" defaultValue={query.max} />
          </label>
        </div>
      )}
      {category &&
        filterFields[category].map((key) => {
          const f = detailFields[category].find((f) => f.key === key)!;
          return (
            <label className="field" key={key}>
              {t(key)}
              {f.type === "select" ? (
                <select
                  name={key}
                  defaultValue={String(query[key as keyof BrowseQuery] || "")}
                >
                  <option value="">{t("any")}</option>
                  {f.options!.map((o) => (
                    <option key={o} value={o}>
                      {t(o)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type}
                  min={f.type === "number" ? 0 : undefined}
                  name={key}
                  maxLength={150}
                  defaultValue={String(query[key as keyof BrowseQuery] || "")}
                />
              )}
            </label>
          );
        })}
      {category === "marketplace" && (
        <label className="check-field">
          <input
            type="checkbox"
            name="free"
            value="1"
            defaultChecked={query.free === "1"}
          />
          {t("free")}
        </label>
      )}
      <div className="filter-buttons">
        <button className="button primary" type="submit">
          {t("apply")}
        </button>
        <Link
          href={`${category ? `/${category}` : "/search"}?state=${query.state}`}
          className="text-link"
        >
          {t("clear")}
        </Link>
      </div>
    </form>
  );
  return (
    <>
      <aside className="filter-panel desktop-filter">
        <div className="filter-heading">
          <span>{t("filterTitle")}</span>
          <SlidersHorizontal size={16} />
        </div>
        {form}
      </aside>
      <button
        className="button button-outline mobile-filter-trigger"
        onClick={() => dialog.current?.showModal()}
      >
        <SlidersHorizontal size={16} />
        {t("filter")}
      </button>
      <dialog ref={dialog} className="dialog filter-drawer">
        <div className="dialog-top">
          <h2>{t("filterTitle")}</h2>
          <button
            className="icon-button"
            onClick={() => dialog.current?.close()}
            aria-label={t("navClose")}
          >
            <X size={19} />
          </button>
        </div>
        {form}
      </dialog>
    </>
  );
}
export function SortControl({
  query,
  category,
}: {
  query: BrowseQuery;
  category?: CategoryKey;
}) {
  const t = useTranslations(),
    l = useLocale();
  return (
    <form className="sort-control" action={`/${l}/${category || "search"}`}>
      <span>{t("sort")}</span>
      {Object.entries(query)
        .filter(([key, value]) => !["sort", "page"].includes(key) && value)
        .map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      <select
        aria-label={t("sort")}
        name="sort"
        value={query.sort}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        <option value="newest">{t("newest")}</option>
        {category !== "community" && (
          <>
            <option value="price-low">{t("priceLow")}</option>
            <option value="price-high">{t("priceHigh")}</option>
          </>
        )}
      </select>
      <noscript>
        <button>{t("apply")}</button>
      </noscript>
    </form>
  );
}
