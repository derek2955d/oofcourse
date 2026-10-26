import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Suspense } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  MapPin,
  Search,
  PenLine,
  MessagesSquare,
  Check,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { SearchBar } from "@/components/navigation";
import { LivingSection } from "@/components/living";
import { BusinessDirectory } from "@/components/businesses";
import { CategoryGrid, ListingGrid } from "@/components/cards";
import { CategoryIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui";
import { selectedState } from "@/lib/geography-server";
import { stateLabel } from "@/lib/geography";
import { browseListings } from "@/lib/listings";
import { categoryKeys, categoryData, type Locale } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
import "../home.css";
import "../living.css";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMetadata(
    locale,
    t("tagline"),
    locale === "zh"
      ? "纽约中英文分类信息平台，免费查找和发布房屋、工作、闲置、本地服务、商家与社区信息。"
      : "Find housing, jobs, secondhand goods, local services, businesses and community information in New York. Browse and post for free.",
  );
}
export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ location?: string; state?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const raw = await searchParams;
  const location = raw.location;
  const state = await selectedState(raw.state);
  const scope = `state=${state}${location ? `&location=${encodeURIComponent(location)}` : ""}`;
  const limits = {
    housing: 4,
    jobs: 3,
    marketplace: 4,
    services: 2,
    businesses: 2,
    community: 2,
  };
  const feeds = await Promise.all(
    categoryKeys.map((category) =>
      browseListings(
        category,
        { state, location: location || "" },
        limits[category],
      ),
    ),
  );
  const shortcuts = [
    ["housing", "tenure=rent", "rent"],
    ["jobs", "employment=part-time", "work"],
    ["marketplace", "free=1", "free"],
    ["services", "subcategory=moving", "moving"],
  ] as const;
  return (
    <div className="home-wrap home-redesign container">
      <section className="hero home-hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="home-location-pill">
            <MapPin size={14} aria-hidden="true" />
            {stateLabel(state, locale)}
            <span />
            {t("home.bilingual")}
          </p>
          <p className="eyebrow hero-eyebrow">{t("home.eyebrow")}</p>
          <h1 id="home-title">
            {t("heroTitle")}
            <br />
            <span>{t("heroAccent")}</span>
          </h1>
          <p className="hero-subtitle">{t("heroSubtitle")}</p>
          <div className="home-hero-actions">
            <a href="#home-discover" className="button primary">
              {t("home.browse")}
              <ArrowRight size={17} />
            </a>
            <Link href={`/post?${scope}`} className="home-post-link">
              <Plus size={17} />
              {t("home.post")}
            </Link>
          </div>
          <div className="home-benefits">
            <span>
              <Check size={15} />
              {t("freeBadge")}
            </span>
            <span>
              <ShieldCheck size={15} />
              {t("home.reviewed")}
            </span>
          </div>
        </div>
        <div className="home-neighborhood">
          <div className="home-board-heading">
            <span className="home-board-dot" />
            {t("home.board")}
            <ArrowUpRight size={16} />
          </div>
          <Image
            src="/art/neighborhood.svg"
            width={540}
            height={350}
            priority
            alt={
              locale === "zh"
                ? "原创街区插画：公寓、街角商店、树木与自行车"
                : "Original neighborhood illustration of homes, a corner shop, trees and a bicycle"
            }
          />
          <Link
            href={`/housing?${scope}`}
            className="home-floating home-floating-housing"
          >
            <span>
              <CategoryIcon category="housing" size={19} />
            </span>
            {t("housing")}
            <ArrowUpRight size={14} />
          </Link>
          <Link
            href={`/jobs?${scope}`}
            className="home-floating home-floating-jobs"
          >
            <span>
              <CategoryIcon category="jobs" size={19} />
            </span>
            {t("jobs")}
            <ArrowUpRight size={14} />
          </Link>
          <p>{t("home.boardText")}</p>
        </div>
        <div className="hero-search-wrap home-search-panel">
          <Suspense>
            <SearchBar large />
          </Suspense>
          <nav className="home-shortcuts" aria-label={t("home.shortcuts")}>
            <span>{t("home.shortcuts")}</span>
            {shortcuts.map(([category, filter, label]) => (
              <Link key={category} href={`/${category}?${scope}&${filter}`}>
                {t(`home.${label}`)}
                <ArrowUpRight size={12} />
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section
        className="categories-section home-categories"
        aria-labelledby="category-heading"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("home.categoryNote")}</p>
            <h2 id="category-heading">{t("home.categories")}</h2>
          </div>
          <Link href={`/categories?state=${state}`} className="text-link">
            {t("allCategories")}
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <CategoryGrid state={state} />
      </section>

      <Suspense
        fallback={<div className="living-placeholder" aria-hidden="true" />}
      >
        <LivingSection state={state} />
      </Suspense>

      <section
        id="home-discover"
        className="home-discover"
        aria-labelledby="home-discover-heading"
      >
        <div className="home-discover-heading">
          <div>
            <p className="eyebrow">
              <span className="home-board-dot" />
              {stateLabel(state, locale)} · {t("latest")}
            </p>
            <h2 id="home-discover-heading">{t("home.freshTitle")}</h2>
            <p>{t("home.freshText")}</p>
          </div>
          <Link href={`/search?${scope}`} className="text-link">
            {t("viewAll")}
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <nav className="home-section-links" aria-label={t("home.jump")}>
          {categoryKeys.map((category) => (
            <a key={category} href={`#home-${category}`}>
              <CategoryIcon category={category} size={16} />
              {t(category)}
            </a>
          ))}
        </nav>
        <div className="home-feed-grid">
          {categoryKeys.map((category, i) => (
            <section
              id={`home-${category}`}
              className={`home-feed feed-${category}`}
              key={category}
              style={
                {
                  "--feed-accent": categoryData[category].color,
                  "--feed-soft": categoryData[category].background,
                } as React.CSSProperties
              }
            >
              <div className="home-feed-heading">
                <span className="home-feed-icon">
                  <CategoryIcon category={category} size={21} />
                </span>
                <h2>{t(category)}</h2>
                <Link href={`/${category}?${scope}`} className="text-link">
                  {t("viewAll")}
                  <ArrowUpRight size={14} />
                </Link>
              </div>
              {feeds[i].error ? (
                <p role="alert" className="notice error-notice">
                  {t("dataError")}
                </p>
              ) : feeds[i].items.length ? (
                <ListingGrid items={feeds[i].items} category={category} />
              ) : (
                <EmptyState category={category} state={state} compact />
              )}
            </section>
          ))}
        </div>
      </section>
      <BusinessDirectory state={state} location={location || ""} limit={3} />
      <section className="home-guidance" aria-label={t("footerResources")}>
        <Link href="/safety" className="home-guide-card">
          <span className="home-guide-icon">
            <ShieldCheck size={25} />
          </span>
          <div>
            <h2>{t("home.safetyTitle")}</h2>
            <p>{t("home.safetyText")}</p>
            <span className="text-link">
              {t("home.safetyLink")}
              <ArrowUpRight size={14} />
            </span>
          </div>
        </Link>
        <Link href="/help" className="home-guide-card">
          <span className="home-guide-icon">
            <BookOpen size={25} />
          </span>
          <div>
            <h2>{t("home.helpTitle")}</h2>
            <p>{t("home.helpText")}</p>
            <span className="text-link">
              {t("home.helpLink")}
              <ArrowUpRight size={14} />
            </span>
          </div>
        </Link>
      </section>
      <section className="posting-cta home-posting">
        <div>
          <span className="eyebrow">{t("home.postingEyebrow")}</span>
          <h2>{t("postingTitle")}</h2>
          <p>{t("postingText")}</p>
          <Link href={`/post?${scope}`} className="button primary">
            <Plus size={18} />
            {t("navPost")}
            <ArrowRight size={17} />
          </Link>
        </div>
        <Image src="/art/posting.svg" alt="" width={260} height={220} />
      </section>
      <section className="home-how" aria-labelledby="home-how-heading">
        <h2 id="home-how-heading">{t("howItWorks")}</h2>
        <div className="home-how-grid">
          {[
            [Search, "stepBrowse"],
            [PenLine, "stepPost"],
            [MessagesSquare, "stepConnect"],
          ].map(([Icon, key], i) => {
            const I = Icon as typeof Search;
            return (
              <div key={String(key)}>
                <span className="home-step-number">0{i + 1}</span>
                <I size={20} />
                <div>
                  <h3>{t(String(key))}</h3>
                  <p>{t(`${key}Text`)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
