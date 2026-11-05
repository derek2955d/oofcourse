import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getLivingGuide, livingGuides } from "@/lib/living";
import { LivingGuideCard } from "@/components/living";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/catalog";
import "../../../living.css";
export function generateStaticParams() {
  return livingGuides.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const guide = getLivingGuide(slug);
  if (!guide) return {};
  return pageMetadata(
    locale,
    guide.title[locale],
    guide.summary[locale],
    `/living/${slug}`,
  );
}
export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const guide = getLivingGuide(slug);
  if (!guide) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("living");
  const shared = await getTranslations();
  return (
    <div className="container page living-page">
      <nav className="breadcrumbs" aria-label={shared("breadcrumb")}>
        <Link href="/">{shared("navHome")}</Link>
        <span>/</span>
        <Link href="/living">{t("back")}</Link>
      </nav>
      <article className="living-article">
        <header>
          <p className="eyebrow">{guide.tag[locale]}</p>
          <h1>{guide.title[locale]}</h1>
          <p className="living-article-summary">{guide.summary[locale]}</p>
          <p className="living-byline">
            {t("byline")} ·{" "}
            <time dateTime={guide.updatedAt}>
              {t("updated", {
                date: new Intl.DateTimeFormat(
                  locale === "zh" ? "zh-CN" : "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "America/New_York",
                  },
                ).format(new Date(`${guide.updatedAt}T12:00:00Z`)),
              })}
            </time>
          </p>
        </header>
        {guide.sections.map((section, index) => (
          <section key={index}>
            <h2>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {section.title[locale]}
            </h2>
            <ul>
              {section.points.map((point, i) => (
                <li key={i}>{point[locale]}</li>
              ))}
            </ul>
          </section>
        ))}
        <aside className="living-article-sources">
          <h2>{t("sources")}</h2>
          <ul>
            {guide.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("opensNew", { name: source.name })}
                >
                  {source.name}
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <p>{t("guideNote")}</p>
        </aside>
        <div className="living-article-action">
          <h2>{t("related")}</h2>
          <Link href={`/${guide.topic}?state=NY`} className="button primary">
            {t("relatedLink", { category: shared(guide.topic) })}
            <ArrowRight size={16} />
          </Link>
        </div>
      </article>
      <section className="living-more" aria-labelledby="living-more-heading">
        <h2 id="living-more-heading">{t("moreGuides")}</h2>
        <div className="living-guide-grid">
          {livingGuides
            .filter((other) => other.slug !== slug)
            .map((other) => (
              <LivingGuideCard
                key={other.slug}
                guide={other}
                locale={locale}
                read={t("read")}
              />
            ))}
        </div>
      </section>
    </div>
  );
}
