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
} from "lucide-react";
import { SearchBar } from "@/components/navigation";
import { BusinessDirectory } from "@/components/businesses";
import { CategoryGrid, ListingGrid } from "@/components/cards";
import { SectionHeading, EmptyState } from "@/components/ui";
import { browseListings } from "@/lib/listings";
import { categoryKeys, type Locale } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
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
  searchParams: Promise<{ location?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { location } = await searchParams;
  const feeds = await Promise.all(
    categoryKeys.map((category) =>
      browseListings(category, { location: location || "nyc" }, 3),
    ),
  );
  return (
    <>
      <div className="home-wrap container">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">
              <span /> {t("heroEyebrow")}
            </p>
            <h1>
              {t("heroTitle")}
              <br />
              <span>{t("heroAccent")}</span>
            </h1>
            <p className="hero-subtitle">{t("heroSubtitle")}</p>
            <p className="hero-local">
              <MapPin size={15} />
              {t("heroFoot")}
            </p>
          </div>
          <div className="hero-art">
            <Image
              src="/art/neighborhood.svg"
              width={540}
              height={350}
              priority
              alt={
                locale === "zh"
                  ? "原创纽约街区插画：公寓、街角商店、树木与自行车"
                  : "Original illustration of New York neighborhood buildings, a corner shop, trees and a bicycle"
              }
            />
            <div className="art-note">
              <span>
                <Check size={14} />
              </span>
              {t("freeBadge")}
            </div>
          </div>
          <div className="hero-search-wrap">
            <Suspense>
              <SearchBar large />
            </Suspense>
          </div>
        </section>
        <section
          className="categories-section"
          aria-labelledby="category-heading"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t("categorySubtitle")}</p>
              <h2 id="category-heading">{t("exploreCategories")}</h2>
            </div>
            <Link className="text-link" href="/categories">
              {t("allCategories")}
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <CategoryGrid />
        </section>
        {categoryKeys.map((category, i) => (
          <section className={`home-feed feed-${category}`} key={category}>
            <SectionHeading
              eyebrow={
                category === "housing" || category === "jobs"
                  ? t("latest")
                  : undefined
              }
              title={t(
                `latest${category.charAt(0).toUpperCase() + category.slice(1)}`,
              )}
              href={`/${category}${location ? `?location=${encodeURIComponent(location)}` : ""}`}
              label={t("viewAll")}
            />
            {feeds[i].error ? (
              <p role="alert" className="notice error-notice">
                {t("dataError")}
              </p>
            ) : feeds[i].items.length ? (
              <ListingGrid items={feeds[i].items} category={category} />
            ) : (
              <EmptyState category={category} />
            )}
          </section>
        ))}
        <BusinessDirectory location={location || "nyc"} limit={3} />
        <section className="posting-cta">
          <div>
            <span className="eyebrow">{t("freeBadge")}</span>
            <h2>{t("postingTitle")}</h2>
            <p>{t("postingText")}</p>
            <Link href="/post" className="button primary">
              <Plus size={18} />
              {t("navPost")}
              <ArrowRight size={17} />
            </Link>
          </div>
          <Image src="/art/posting.svg" alt="" width={260} height={220} />
        </section>
        <section className="how-section">
          <SectionHeading title={t("howItWorks")} />
          <div className="how-grid">
            {[
              [Search, "stepBrowse"],
              [PenLine, "stepPost"],
              [MessagesSquare, "stepConnect"],
            ].map(([Icon, key], i) => {
              const I = Icon as typeof Search;
              return (
                <div key={String(key)}>
                  <span className={`how-icon how-${i}`}>
                    <I size={23} />
                  </span>
                  <small>0{i + 1}</small>
                  <h3>{t(String(key))}</h3>
                  <p>{t(`${key}Text`)}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
