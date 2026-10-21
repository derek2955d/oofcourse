"use client";
import Link from "next/link";
import { SlidersHorizontal, ArrowRight, Heart } from "lucide-react";
import { categories, retailers, selectProducts } from "@/lib/data";
import type { Query } from "@/lib/query";
import { ProductCard } from "./site";
import { useSaved } from "./saved";
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
  const { ids, ready, error, clear } = useSaved();
  const saved = onlySaved || query.saved === "1";
  const results = selectProducts({
    ...query,
    category: fixedCategory || query.category,
    retailer: fixedRetailer || query.retailer,
  }).filter((p) => !saved || ids.includes(p.id));
  return (
    <>
      <details className="filter-panel" open>
        <summary>
          <SlidersHorizontal size={17} />
          Refine your finds<span>Search, categories & stores</span>
        </summary>
        <form action={action} className="filters" key={JSON.stringify(query)}>
          <label className="filter-search">
            Search finds
            <input
              type="search"
              name="q"
              placeholder="Try headphones, baby, or kitchen"
              defaultValue={query.q || ""}
              maxLength={200}
            />
          </label>
          {!fixedCategory && (
            <label>
              Category
              <select name="category" defaultValue={query.category || ""}>
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option value={c.slug} key={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {!fixedRetailer && (
            <label>
              Retailer
              <select name="retailer" defaultValue={query.retailer || ""}>
                <option value="">All retailers</option>
                {retailers.map((r) => (
                  <option key={r.slug} value={r.slug}>
                    {r.name} · demo
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Sort by
            <select name="sort" defaultValue={query.sort || "newest"}>
              <option value="newest">Recently added</option>
              <option value="name">Name: A–Z</option>
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
              Saved only
            </label>
          )}
          <button className="button primary" type="submit">
            Apply filters
          </button>
          <Link className="reset-link" href={action}>
            Clear filters
          </Link>
        </form>
        <p className="filter-note">
          Price and discount sorting will be available only when authorized,
          reliable live data is connected.
        </p>
      </details>
      {error && (
        <p className="storage-notice" role="status">
          {error}
        </p>
      )}
      <h2 className="sr-only">Search results</h2>
      <div className="results-toolbar">
        <p role="status">
          {saved && !ready
            ? "Loading your saved finds…"
            : `${results.length} demo ${results.length === 1 ? "find" : "finds"}${query.q ? ` for “${query.q}”` : ""}`}
          <span> · No live offers</span>
        </p>
        {onlySaved && ids.length > 0 && (
          <button className="reset-link" type="button" onClick={clear}>
            Clear saved finds
          </button>
        )}
      </div>
      {saved && !ready ? (
        <div className="product-grid" aria-label="Loading saved finds">
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
          <Heart size={32} />
          <h2>{saved ? "Your favorites start here." : "No finds just yet."}</h2>
          <p>
            {saved
              ? "Tap the heart on a find to keep it here. Your collection stays in this browser."
              : "Try another keyword, category, or retailer."}
          </p>
          <Link href={saved ? "/deals" : action} className="button primary">
            {saved ? "Explore the collection" : "Reset search"}
            <ArrowRight size={17} />
          </Link>
        </div>
      )}
    </>
  );
}
