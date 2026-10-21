import Link from "next/link";
import { categories, selectProducts } from "@/lib/data";
import { ProductCard } from "./site";
export type Query = { q?: string; category?: string; sort?: string };
export function Catalog({
  query,
  action = "/deals",
  fixedCategory,
}: {
  query: Query;
  action?: string;
  fixedCategory?: string;
}) {
  const sort = ["newest", "price-asc", "price-desc", "savings"].includes(
    query.sort || "",
  )
    ? query.sort!
    : "newest";
  const selected = selectProducts({
    ...query,
    sort,
    category: fixedCategory || query.category,
  });
  return (
    <>
      <form action={action} className="filters">
        <label>
          Search finds
          <input
            type="search"
            name="q"
            placeholder="Try headphones, home, or travel"
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
        <label>
          Sort by
          <select name="sort" defaultValue={sort}>
            <option value="newest">Recently added</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="savings">Biggest demo savings</option>
          </select>
        </label>
        <button className="button primary" type="submit">
          Apply
        </button>
        <Link className="reset-link" href={action}>
          Reset
        </Link>
      </form>
      <p className="results-count" role="status">
        {selected.length} demo {selected.length === 1 ? "find" : "finds"}
        {query.q ? ` for “${query.q}”` : ""} · Illustrative prices only
      </p>
      {selected.length ? (
        <div className="product-grid catalog-grid">
          {selected.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No finds just yet.</h2>
          <p>Try a broader search or explore another category.</p>
          <Link href={action} className="button primary">
            Clear filters
          </Link>
        </div>
      )}
    </>
  );
}
export function normalizeQuery(
  raw: Record<string, string | string[] | undefined>,
): Query {
  return {
    q: typeof raw.q === "string" ? raw.q.slice(0, 200) : "",
    category: typeof raw.category === "string" ? raw.category : "",
    sort: typeof raw.sort === "string" ? raw.sort : "newest",
  };
}
