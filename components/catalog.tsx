"use client";
import Link from "./localized-link";
import { SlidersHorizontal, ArrowRight, Heart } from "lucide-react";
import { categories, retailers, selectProducts } from "@/lib/data";
import type { Query } from "@/lib/query";
import { ProductCard } from "./site";
import { useSaved } from "./saved";
import { useLocale } from "./locale-provider";
import { t } from "@/lib/i18n/messages";
import { categoryName } from "@/lib/i18n/catalog";
import { localePath } from "@/lib/i18n/config";
export function Catalog({
  query,
  action = "/deals",
  fixedCategory,
  fixedRetailer,
  onlySaved = false,
}: {
  query: Query;
  action?: string;
  fixedCategory?: string;
  fixedRetailer?: string;
  onlySaved?: boolean;
}) {
  const l = useLocale(),
    { ids, ready, error, clear } = useSaved(),
    saved = onlySaved || query.saved === "1";
  const results = selectProducts({
    ...query,
    locale: l,
    category: fixedCategory || query.category,
    retailer: fixedRetailer || query.retailer,
  }).filter((p) => !saved || ids.includes(p.id));
  return (
    <>
      <details className="filter-panel" open>
        <summary>
          <SlidersHorizontal size={17} />
          {t(l, "filterTitle")}
          <span>{t(l, "filterHint")}</span>
        </summary>
        <form
          className="filters"
          action={localePath(l, action)}
          key={JSON.stringify(query)}
        >
          <label className="filter-search">
            {t(l, "search")}
            <input
              type="search"
              name="q"
              aria-label={t(l, "searchDeals")}
              placeholder={t(l, "searchPlaceholder")}
              defaultValue={query.q || ""}
              maxLength={200}
            />
          </label>
          {!fixedCategory && (
            <label>
              {t(l, "category")}
              <select
                aria-label={t(l, "category")}
                name="category"
                defaultValue={query.category || ""}
              >
                <option value="">{t(l, "allCategories")}</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {categoryName(c, l)}
                  </option>
                ))}
              </select>
            </label>
          )}
          {!fixedRetailer && (
            <label>
              {t(l, "retailer")}
              <select
                aria-label={t(l, "retailer")}
                name="retailer"
                defaultValue={query.retailer || ""}
              >
                <option value="">{t(l, "allRetailers")}</option>
                {retailers.map((r) => (
                  <option key={r.slug} value={r.slug}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            {t(l, "sort")}
            <select
              name="sort"
              aria-label={t(l, "sort")}
              defaultValue={query.sort || "newest"}
            >
              <option value="newest">{t(l, "newest")}</option>
              <option value="name">{t(l, "nameSort")}</option>
            </select>
          </label>
          {!onlySaved && (
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="saved"
                value="1"
                defaultChecked={query.saved === "1"}
              />
              <Heart size={15} />
              {t(l, "savedOnly")}
            </label>
          )}
          <button type="submit" className="button primary">
            {t(l, "apply")}
          </button>
          <Link href={action} className="reset-link">
            {t(l, "reset")}
          </Link>
        </form>
      </details>
      {error && (
        <p role="status" className="storage-notice">
          {t(l, "storageError")}
        </p>
      )}
      <h2 className="sr-only">{t(l, "searchResults")}</h2>
      <div className="results-toolbar">
        <p role="status">
          {saved && !ready
            ? t(l, "loadingSaved")
            : `${results.length} ${t(l, "results")}${query.q ? ` · “${query.q}”` : ""}`}
        </p>
        {onlySaved && ids.length > 0 && (
          <button type="button" className="reset-link" onClick={clear}>
            {t(l, "clearSaved")}
          </button>
        )}
      </div>
      {saved && !ready ? (
        <div className="product-grid" aria-label={t(l, "loadingSaved")}>
          {[1, 2, 3, 4].map((i) => (
            <div className="skeleton" key={i} />
          ))}
        </div>
      ) : results.length ? (
        <div className="product-grid catalog-grid">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Heart size={30} />
          <h2>{t(l, saved ? "savedEmpty" : "noResults")}</h2>
          <p>{t(l, saved ? "savedEmptyText" : "noResultsText")}</p>
          <Link href={saved ? "/deals" : action} className="button primary">
            {t(l, saved ? "explore" : "resetSearch")}
            <ArrowRight size={17} />
          </Link>
        </div>
      )}
      <noscript>
        {l === "zh"
          ? "收藏功能需要 JavaScript，商品浏览和筛选仍可使用。"
          : "Favorites require JavaScript; browsing and filtering still work."}
      </noscript>
    </>
  );
}
