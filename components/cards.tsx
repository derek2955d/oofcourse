import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  MapPin,
  ArrowUpRight,
  BedDouble,
  Bath,
  BriefcaseBusiness,
  Clock,
  ImageOff,
} from "lucide-react";
import {
  categoryKeys,
  categoryData,
  locationLabel,
  formatMoney,
  type CategoryKey,
  type Listing,
  type Locale,
} from "@/lib/catalog";
import { CategoryIcon } from "./icons";
import { salaryRange, publishedDate } from "@/lib/browse-presentation";
import { selectedState } from "@/lib/geography-server";
import { loadTaxonomy } from "@/lib/taxonomy-server";
export async function CategoryGrid({ state }: { state?: string } = {}) {
  const scope = await selectedState(state);
  const locale = (await getLocale()) as Locale;
  const taxonomy = await loadTaxonomy();
  return (
    <div className="category-grid">
      {categoryKeys.map((c) => (
        <Link
          key={c}
          href={`/${c}?state=${scope}`}
          className="category-card"
          style={
            {
              "--category-bg": categoryData[c].background,
              "--category-color": categoryData[c].color,
            } as React.CSSProperties
          }
        >
          <span className="category-icon">
            <CategoryIcon category={c} size={28} />
          </span>
          <div>
            <h3>{taxonomy.categories[c][locale]}</h3>
            <span>{taxonomy.categories[c][locale === "en" ? "zh" : "en"]}</span>
          </div>
          <ArrowUpRight size={16} className="category-arrow" />
        </Link>
      ))}
    </div>
  );
}
export async function ListingCard({ listing }: { listing: Listing }) {
  const t = await getTranslations(),
    locale = (await getLocale()) as Locale;
  const money = formatMoney(listing.price, locale);
  const isJob = listing.category === "jobs";
  const salary = salaryRange(listing.details);
  const published = publishedDate(listing);
  const taxonomy = await loadTaxonomy();
  const area =
    taxonomy.locations.find(([id]) => id === listing.location)?.[
      locale === "zh" ? 2 : 1
    ] || locationLabel(listing.location, locale);
  return (
    <article className={`listing-card ${isJob ? "job-card" : ""}`}>
      {!isJob && (
        <Link
          className="listing-image"
          href={`/${listing.category}/${listing.id}`}
          aria-label={`${t("viewListing")}: ${listing.title}`}
        >
          {listing.images[0] ? (
            <Image
              src={listing.images[0].url}
              alt={listing.images[0].alt || listing.title}
              fill
              sizes="(max-width:760px) 90vw, 33vw"
              unoptimized
            />
          ) : (
            <div
              className="image-empty"
              style={{ background: categoryData[listing.category].background }}
            >
              <CategoryIcon category={listing.category} size={46} />
              <span>{t("noPhotos")}</span>
            </div>
          )}
        </Link>
      )}
      <div className="listing-card-body">
        {isJob && (
          <span className="job-icon">
            <BriefcaseBusiness size={25} />
          </span>
        )}
        <div className="card-heading">
          {listing.is_sponsored && (
            <span className="sponsored">{t("sponsored")}</span>
          )}
          <h3>
            <Link href={`/${listing.category}/${listing.id}`}>
              {listing.title}
            </Link>
          </h3>
          {isJob && <p>{String(listing.details.company || "")}</p>}
        </div>
        {!(
          listing.category === "community" && listing.subcategory === "outings"
        ) && (
          <p className="card-price">
            {isJob
              ? salary
                ? `${formatMoney(salary.low, locale)}${salary.low === salary.high ? "" : ` – ${formatMoney(salary.high, locale)}`} / ${t(salary.period)}`
                : t("browse.salaryUnavailable")
              : listing.category === "services" &&
                  listing.details.price_type === "quote"
                ? t("quote")
                : listing.price === 0
                  ? t("free")
                  : money || t("browse.priceUnavailable")}
            {listing.category === "housing" &&
              listing.details.tenure === "rent" && (
                <small> {t("perMonth")}</small>
              )}
            {listing.category === "services" &&
              listing.details.price_type === "hourly" &&
              listing.price !== null && (
                <small> {t("browse.serviceHourly")}</small>
              )}
          </p>
        )}
        <p className="card-location">
          <MapPin size={14} />
          {area}
        </p>
        {listing.category === "housing" && (
          <div className="card-specs">
            <span>
              <BedDouble size={15} />
              {listing.details.bedrooms} {t("bedrooms")}
            </span>
            <span>
              <Bath size={15} />
              {listing.details.bathrooms} {t("bathrooms")}
            </span>
          </div>
        )}
        {isJob && (
          <div className="card-specs">
            <span>{t(String(listing.details.employment))}</span>
            <span>{t(String(listing.details.workplace))}</span>
          </div>
        )}
        <div className="card-bottom">
          {published && (
            <span
              title={t("browse.published", {
                date: published.toLocaleDateString(
                  locale === "zh" ? "zh-CN" : "en-US",
                  {
                    timeZone: "America/New_York",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                ),
              })}
            >
              <Clock size={13} aria-hidden="true" />
              <time dateTime={published.toISOString()}>
                {new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  timeZone: "America/New_York",
                }).format(published)}
              </time>
            </span>
          )}
          <Link href={`/${listing.category}/${listing.id}`}>
            {t("viewListing")}
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
export async function ListingGrid({
  items,
  category,
}: {
  items: Listing[];
  category?: CategoryKey;
}) {
  return (
    <div className={`listing-grid ${category === "jobs" ? "jobs-list" : ""}`}>
      {items.map((p) => (
        <ListingCard key={p.id} listing={p} />
      ))}
    </div>
  );
}
export { ImageOff };
