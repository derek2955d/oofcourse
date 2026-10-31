import { catalogAvailability } from "@/lib/browse-presentation";
import { CatalogUnavailable } from "./catalog-unavailable";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  categoryData,
  parseQuery,
  type CategoryKey,
  type Locale,
} from "@/lib/catalog";
import { selectedState } from "@/lib/geography-server";
import { stateLabel } from "@/lib/geography";
import { browseListings } from "@/lib/listings";
import { SearchBar } from "./navigation";
import { FilterPanel, SortControl } from "./filters";
import { ListingGrid } from "./cards";
import { CategoryIcon } from "./icons";
import { BusinessDirectory } from "./businesses";
import { EmptyState } from "./ui";
import { BrowseNavigation } from "./browse-navigation";
import { EditorialActivityCards } from "./editorial-activities";
import "@/app/living.css";
import { supportsPriceFilters } from "@/lib/browse-presentation";
export async function Catalog({
  category,
  raw,
}: {
  category?: CategoryKey;
  raw: Record<string, string | string[] | undefined>;
}) {
  const t = await getTranslations(),
    l = (await getLocale()) as Locale,
    q = parseQuery({
      ...raw,
      state: await selectedState(
        typeof raw.state === "string" ? raw.state : undefined,
      ),
    });
  if (!supportsPriceFilters(category)) {
    q.min = "";
    q.max = "";
    q.sort = "newest";
  }
  // Community is a statewide hub; legacy area URLs must not hide posts.
  if (category === "community") {
    q.location = "";
    q.subcategory = "";
  }
  if (category === "marketplace") {
    q.condition = "";
    q.free = "";
  }
  if (category === "jobs") {
    q.subcategory = "";
    q.industry = "";
    q.workplace = "";
    q.pay_period = "";
    if (!["full-time", "part-time"].includes(q.employment)) q.employment = "";
  }
  const result = await browseListings(category, q);
  const availability = catalogAvailability(result);
  const unavailable =
    availability === "unconfigured" || availability === "error";
  const pages = Math.max(1, Math.ceil(result.total / 12));
  const activeFilters = Object.entries(q).some(
    ([k, v]) => !["page", "sort", "state"].includes(k) && v,
  );
  function pageHref(page: number) {
    const params = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => {
      if (v && k !== "page") params.set(k, String(v));
    });
    if (!category && typeof raw.category === "string")
      params.set("category", raw.category);
    params.set("page", String(page));
    return `${category ? `/${category}` : "/search"}?${params}`;
  }
  return (
    <div className="container page">
      <nav className="breadcrumbs" aria-label={t("breadcrumb")}>
        <Link href="/">{t("navHome")}</Link>
        <span>/</span>
        <span>{category ? categoryData[category][l] : t("navSearch")}</span>
      </nav>
      <div className="catalog-header">
        <div>
          <p className="eyebrow">{stateLabel(q.state, l)}</p>
          <h1 className="page-title">
            {category ? categoryData[category][l] : t("navSearch")}
          </h1>
          <p className="page-intro">
            {category
              ? categoryData[category][l === "zh" ? "tagZh" : "tagEn"]
              : t("heroSubtitle")}
          </p>
        </div>
        {category && (
          <span
            className="category-icon"
            style={{
              background: categoryData[category].background,
              color: categoryData[category].color,
            }}
          >
            <CategoryIcon category={category} size={30} />
          </span>
        )}
      </div>
      {category === "community" && (
        <section
          className="living-events community-activities"
          aria-labelledby="community-activities-heading"
        >
          <div className="living-section-heading">
            <h2 id="community-activities-heading">
              {t("living.homeEventsHeading")}
            </h2>
          </div>
          <EditorialActivityCards
            locale={l}
            label={t("editorialActivity.label")}
            view={t("living.viewEvent")}
          />
        </section>
      )}
      <Suspense>
        <SearchBar category={category} />
      </Suspense>
      <BrowseNavigation
        query={q}
        category={category}
        searchCategory={
          typeof raw.category === "string" ? raw.category : undefined
        }
      />
      <div
        className={`catalog-shell${category === "community" ? " community-shell" : ""}`}
      >
        {category !== "community" && (
          <Suspense>
            <FilterPanel category={category} query={q} />
          </Suspense>
        )}
        <section
          className="catalog-results"
          aria-label={
            unavailable
              ? t("catalogState.unavailable")
              : t("results", { count: result.total })
          }
        >
          {category === "community" && (
            <h2>{t("living.communityEventsAll")}</h2>
          )}
          <div className="results-toolbar">
            <p role="status">
              {unavailable
                ? t("catalogState.unavailable")
                : t("results", { count: result.total })}
            </p>
            <SortControl category={category} query={q} />
          </div>
          {availability === "unconfigured" || availability === "error" ? (
            <CatalogUnavailable reason={availability} />
          ) : availability === "ready" ? (
            <ListingGrid items={result.items} category={category} />
          ) : (
            <EmptyState
              category={category}
              filtered={!!activeFilters || q.page > 1}
              state={q.state}
            />
          )}
          {category === "businesses" && (
            <BusinessDirectory
              state={q.state}
              location={q.location}
              keyword={q.q}
              subtype={q.subcategory}
            />
          )}
          <Pagination pages={pages} page={q.page} href={pageHref} />
        </section>
      </div>
    </div>
  );
}
export async function Pagination({
  pages,
  page,
  href,
}: {
  pages: number;
  page: number;
  href: (p: number) => string;
}) {
  const t = await getTranslations();
  if (pages <= 1) return null;
  return (
    <nav className="pagination" aria-label={t("page", { page, pages })}>
      {page > 1 && (
        <Link className="button button-outline" href={href(page - 1)}>
          <ChevronLeft size={16} />
          {t("previous")}
        </Link>
      )}
      <span>{t("page", { page, pages })}</span>
      {page < pages && (
        <Link href={href(page + 1)} className="button button-outline">
          {t("next")}
          <ChevronRight size={16} />
        </Link>
      )}
    </nav>
  );
}
