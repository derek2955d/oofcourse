import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { X } from "lucide-react";
import type { BrowseQuery, CategoryKey, Locale } from "@/lib/catalog";
import { nycBoroughIds, nearManhattanNJ } from "@/lib/geography";
import { loadTaxonomy } from "@/lib/taxonomy-server";

export async function BrowseNavigation({
  query,
  category,
  searchCategory,
}: {
  query: BrowseQuery;
  category?: CategoryKey;
  searchCategory?: string;
}) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations();
  const taxonomy = await loadTaxonomy();
  const areas = taxonomy.locations.filter(
    ([id]) => taxonomy.locationStates[id] === query.state,
  );
  const quickIds: readonly string[] = [
    ...nycBoroughIds,
    ...nearManhattanNJ.map((row) => row[0]),
  ];
  const quick = quickIds.flatMap((id) => {
    const row = taxonomy.locations.find(
      (row) =>
        row[0] === id && ["NY", "NJ"].includes(taxonomy.locationStates[id]),
    );
    return row ? [row] : [];
  });
  function href(change: Record<string, string>) {
    const params = new URLSearchParams();
    if (!category && searchCategory) params.set("category", searchCategory);
    for (const [key, value] of Object.entries({ ...query, ...change }))
      if (key !== "page" && value) params.set(key, String(value));
    return `${category ? `/${category}` : "/search"}?${params}`;
  }
  function valueLabel(key: string, value: string) {
    if (key === "location")
      return (
        areas.find(([id]) => id === value)?.[locale === "zh" ? 2 : 1] || value
      );
    if (key === "subcategory" && category)
      return (
        taxonomy.subtypes[category].find(([id]) => id === value)?.[
          locale === "zh" ? 2 : 1
        ] || value
      );
    if (
      [
        "tenure",
        "property_type",
        "furnished",
        "employment",
        "workplace",
        "pay_period",
        "condition",
        "provider_type",
        "price_type",
      ].includes(key)
    )
      return t.has(value) ? t(value) : value;
    return value;
  }
  const filters = Object.entries(query).filter(
    ([key, value]) => !["page", "sort", "state"].includes(key) && value,
  );
  return (
    <div className="browse-navigation">
      {category !== "community" && !!quick.length && (
        <nav className="browse-areas" aria-label={t("browse.quickAreas")}>
          <span>{t("browse.quickAreas")}</span>
          <Link
            prefetch={false}
            href={href({ location: "" })}
            aria-current={!query.location ? "true" : undefined}
          >
            {t("browse.allAreas")}
          </Link>
          {quick.map(([id, en, zh]) => (
            <Link
              key={id}
              prefetch={false}
              href={href({ location: id, state: taxonomy.locationStates[id] })}
              aria-current={query.location === id ? "true" : undefined}
            >
              {locale === "zh" ? zh : en}
            </Link>
          ))}
        </nav>
      )}
      {!!filters.length && (
        <nav
          className="active-filters"
          aria-label={t("browse.selectedFilters")}
        >
          {filters.map(([key, value]) => {
            const field =
              key === "q"
                ? "keyword"
                : key === "min"
                  ? "minPrice"
                  : key === "max"
                    ? "maxPrice"
                    : key === "free"
                      ? "free"
                      : key === "subcategory"
                        ? "subcategory"
                        : key;
            const label = `${t(field)}${key === "free" ? "" : `: ${valueLabel(key, String(value))}`}`;
            return (
              <Link
                key={key}
                prefetch={false}
                href={href({ [key]: "" })}
                aria-label={t("browse.removeFilter", { filter: label })}
              >
                {label}
                <X size={13} aria-hidden="true" />
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
