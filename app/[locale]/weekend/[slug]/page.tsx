import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin, ExternalLink, Compass, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { weekendPlaces, getWeekendPlace, weekendMapUrl } from "@/lib/weekend";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/catalog";
import "../../../weekend.css";
export function generateStaticParams() {
  return weekendPlaces.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const place = getWeekendPlace(slug);
  return place
    ? pageMetadata(
        locale,
        place.name[locale],
        place.summary[locale],
        `/weekend/${slug}`,
      )
    : {};
}
export default async function WeekendDetail({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const place = getWeekendPlace(slug);
  if (!place) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("weekend");
  const shared = await getTranslations();
  return (
    <div className="container page weekend-page">
      <nav className="breadcrumbs" aria-label={shared("breadcrumb")}>
        <Link href="/">{shared("navHome")}</Link>
        <span>/</span>
        <Link href="/weekend">{t("nav")}</Link>
        <span>/</span>
        <span>{place.name[locale]}</span>
      </nav>
      <article className="weekend-detail">
        <header>
          <p className="eyebrow">{t("editorial")}</p>
          <h1>{place.name[locale]}</h1>
          <p className="weekend-location">
            <MapPin size={17} aria-hidden="true" />
            {place.location[locale]}
          </p>
          <p className="page-intro">{place.summary[locale]}</p>
        </header>
        <section>
          <h2>
            <Compass size={21} aria-hidden="true" />
            {t("plan")}
          </h2>
          <p>{place.plan[locale]}</p>
        </section>
        <section>
          <h2>{t("travel")}</h2>
          <p>{place.travel[locale]}</p>
        </section>
        <section>
          <h2>{t("before")}</h2>
          <p>{place.caution[locale]}</p>
        </section>
        <div className="weekend-actions">
          <a
            className="button primary"
            href={place.source}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("official")}
            <ExternalLink size={15} aria-hidden="true" />
            <span className="sr-only">{t("newTab")}</span>
          </a>
          <a
            className="button button-outline"
            href={weekendMapUrl(place)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("map")}
            <ExternalLink size={15} aria-hidden="true" />
            <span className="sr-only">{t("newTab")}</span>
          </a>
        </div>
        <p className="weekend-note">
          {t("source")}: {place.sourceName} · {t("note")}
        </p>
      </article>
      <Link href="/weekend" className="text-link weekend-back">
        <ArrowLeft size={16} aria-hidden="true" />
        {t("back")}
      </Link>
    </div>
  );
}
