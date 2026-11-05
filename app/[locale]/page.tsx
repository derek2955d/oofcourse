import { CityPoster } from "@/components/city-poster";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Suspense } from "react";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import { SearchBar } from "@/components/navigation";
import { LivingEvents } from "@/components/living";
import { CategoryGrid } from "@/components/cards";
import { selectedState } from "@/lib/geography-server";
import { stateLabel } from "@/lib/geography";
import type { Locale } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
import "../living.css";
import "../activity-home.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "homeFocus" });
  return pageMetadata(locale, t("title"), t("intro"));
}
export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ state?: string; location?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("homeFocus");
  const raw = await searchParams;
  const state = await selectedState(raw.state);
  return (
    <div className="container activity-home">
      <header className="activity-intro">
        <div className="activity-intro-copy">
          <p className="activity-location">
            <span className="home-location-dot" />
            {stateLabel(state, locale)}
            <span className="home-location-divider" />
            {t("eyebrow")}
          </p>
          <h1>
            {t("headlineFirst")}
            <br />
            <em>{t("headlineSecond")}</em>
          </h1>
          <p className="activity-intro-description">{t("intro")}</p>
          <Link href="/weekend" className="home-discover-link">
            {t("discover")}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <CityPoster />
      </header>
      <div className="activity-home-layout">
        <div className="activity-home-main">
          <Suspense
            fallback={
              <div className="activity-loading" aria-hidden="true">
                <CalendarDays size={28} />
              </div>
            }
          >
            <LivingEvents homepage />
          </Suspense>
        </div>
        <aside className="activity-home-aside" aria-label={t("essentials")}>
          <section
            className="activity-essentials"
            aria-labelledby="home-essentials-heading"
          >
            <h2 id="home-essentials-heading">{t("essentials")}</h2>
            <CategoryGrid state={state} />
          </section>
          <details className="home-side-search">
            <summary>
              <Search size={16} aria-hidden="true" />
              <span>{t("search")}</span>
            </summary>
            <Suspense>
              <SearchBar large />
            </Suspense>
          </details>
          <nav className="activity-side-resources" aria-label={t("resources")}>
            <Link href="/living" className="home-living-index">
              <BookOpen size={17} aria-hidden="true" />
              {t("guides")}
              <ArrowUpRight size={14} />
            </Link>
            <Link href="/safety">
              <ShieldCheck size={17} aria-hidden="true" />
              {t("safety")}
              <ArrowUpRight size={14} />
            </Link>
          </nav>
          <Link
            href={`/post?category=community&state=${state}`}
            className="button button-outline activity-post"
          >
            <Plus size={17} aria-hidden="true" />
            {t("postEvent")}
          </Link>
        </aside>
      </div>
    </div>
  );
}
