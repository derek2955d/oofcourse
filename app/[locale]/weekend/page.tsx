import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Compass,
  ArrowUpRight,
  Waves,
  Palette,
  Trees,
  TrainFront,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  weekendAreas,
  weekendTypes,
  weekendQuery,
  filterWeekendPlaces,
} from "@/lib/weekend";
import { weekendSubmissions } from "@/lib/weekend-server";
import { ListingGrid } from "@/components/cards";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/catalog";
import "../../weekend.css";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "weekend" });
  return pageMetadata(locale, t("nav"), t("intro"), "/weekend");
}
export default async function WeekendPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("weekend");
  const shared = await getTranslations();
  const raw = await searchParams;
  const query = weekendQuery(raw);
  const page =
    typeof raw.page === "string" && /^\d+$/.test(raw.page)
      ? Math.max(1, Math.min(1000, Number(raw.page) || 1))
      : 1;
  const posted = await weekendSubmissions(query, page);
  const pages = Math.max(1, Math.ceil(posted.total / 12));
  const pageHref = (next: number) => {
    const q = new URLSearchParams();
    if (query.type) q.set("type", query.type);
    if (query.area) q.set("area", query.area);
    q.set("page", String(next));
    return `/weekend?${q}#shared-outings`;
  };
  const places = filterWeekendPlaces(query);
  const icons = {
    outdoors: Trees,
    waterfront: Waves,
    art: Palette,
    daytrip: TrainFront,
  };
  return (
    <div className="container page weekend-page">
      <nav className="breadcrumbs" aria-label={shared("breadcrumb")}>
        <Link href="/">{shared("navHome")}</Link>
        <span>/</span>
        <span>{t("nav")}</span>
      </nav>
      <header className="weekend-hero">
        <div className="weekend-hero-icon" aria-hidden="true">
          <Compass size={34} />
        </div>
        <div>
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1>{t("title")}</h1>
          <p>{t("intro")}</p>
        </div>
      </header>
      <div className="weekend-submit">
        <Link
          className="button primary"
          href="/post?category=community&subcategory=outings"
        >
          {t("upload")}
        </Link>
        <p>{t("uploadIntro")}</p>
      </div>
      <form className="weekend-filters" action={`/${locale}/weekend`}>
        <label className="field">
          {t("type")}
          <select name="type" defaultValue={query.type}>
            <option value="">{t("allTypes")}</option>
            {weekendTypes.map((type) => (
              <option key={type} value={type}>
                {t(`types.${type}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          {t("area")}
          <select name="area" defaultValue={query.area}>
            <option value="">{t("allAreas")}</option>
            {weekendAreas.map((area) => (
              <option key={area} value={area}>
                {t(`areas.${area}`)}
              </option>
            ))}
          </select>
        </label>
        <button className="button primary">{t("apply")}</button>
        {(query.type || query.area) && (
          <Link href="/weekend" className="text-link">
            {t("clear")}
          </Link>
        )}
      </form>
      <p className="weekend-results" role="status">
        {t("results", { count: places.length + posted.total })}
      </p>
      {places.length ? (
        <section className="weekend-grid" aria-label={t("list")}>
          {places.map((place) => {
            const Icon = icons[place.tags[0]];
            return (
              <article className="weekend-card" key={place.slug}>
                <Link href={`/weekend/${place.slug}`}>
                  <div
                    className={`weekend-art weekend-art-${place.tags[0]}`}
                    aria-hidden="true"
                  >
                    <Icon size={54} strokeWidth={1.3} />
                    <span>+</span>
                  </div>
                  <div className="weekend-card-body">
                    <p className="eyebrow">{t(`areas.${place.area}`)}</p>
                    <h2>{place.name[locale]}</h2>
                    <p>{place.summary[locale]}</p>
                    <span className="text-link">
                      {t("read")}
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </section>
      ) : !posted.total && !posted.error ? (
        <section className="surface centered">
          <h2>{t("empty")}</h2>
          <p>{t("emptyHint")}</p>
          <Link className="button button-outline" href="/weekend">
            {t("clear")}
          </Link>
        </section>
      ) : null}
      <section
        id="shared-outings"
        className="weekend-shared"
        aria-labelledby="shared-title"
      >
        <h2 id="shared-title">{t("shared")}</h2>
        <p>{t("originalLanguage")}</p>
        {posted.error ? (
          <p className="notice error-notice" role="alert">
            {shared("dataError")}
          </p>
        ) : posted.items.length ? (
          <ListingGrid items={posted.items} category="community" />
        ) : (
          <div className="notice">
            <p>{t(posted.total ? "pageEmpty" : "noShares")}</p>
            {posted.total > 0 && (
              <Link className="text-link" href={pageHref(1)}>
                {t("firstPage")}
              </Link>
            )}
          </div>
        )}
        {!posted.error && pages > 1 && page <= pages && (
          <nav
            className="pagination"
            aria-label={shared("page", { page, pages })}
          >
            {page > 1 && (
              <Link
                className="button button-outline"
                href={pageHref(Math.min(pages, page - 1))}
              >
                {shared("previous")}
              </Link>
            )}
            <span>{shared("page", { page, pages })}</span>
            {page < pages && (
              <Link className="button button-outline" href={pageHref(page + 1)}>
                {shared("next")}
              </Link>
            )}
          </nav>
        )}
      </section>
      <p className="weekend-note">{t("note")}</p>
    </div>
  );
}
