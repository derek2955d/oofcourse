import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  editorialActivities,
  getEditorialActivity,
  activityDateValue,
} from "@/lib/editorial-activities";
import { newYorkToday } from "@/lib/living";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/catalog";
import "../../../living.css";
export function generateStaticParams() {
  return editorialActivities.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const activity = getEditorialActivity(slug);
  if (!activity) return {};
  return pageMetadata(
    locale,
    activity.title[locale],
    activity.summary[locale],
    `/activities/${slug}`,
    newYorkToday() > activity.day,
  );
}
export default async function EditorialActivityPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const activity = getEditorialActivity(slug);
  if (!activity) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("editorialActivity"),
    shared = await getTranslations();
  return (
    <div className="container page">
      <nav className="breadcrumbs" aria-label={shared("breadcrumb")}>
        <Link href="/">{shared("navHome")}</Link>
        <span>/</span>
        <span>{t("label")}</span>
      </nav>
      <article className="living-article editorial-activity-detail">
        <header>
          <p className="eyebrow">{t("label")}</p>
          <h1>{activity.title[locale]}</h1>
          <p className="living-article-summary">{activity.summary[locale]}</p>
        </header>
        <dl className="editorial-activity-facts">
          <div>
            <dt>{t("when")}</dt>
            <dd>
              <time dateTime={activity.startsAt}>
                {new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  ...(activity.startsAt.includes("T")
                    ? { hour: "numeric" as const, minute: "2-digit" as const }
                    : {}),
                  timeZone: "America/New_York",
                }).format(activityDateValue(activity.startsAt))}{" "}
                ({t("timezone")})
              </time>
              {activity.startsAt.slice(0, 10) !== activity.day && (
                <>
                  {" "}
                  –{" "}
                  <time dateTime={activity.day}>
                    {new Intl.DateTimeFormat(
                      locale === "zh" ? "zh-CN" : "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        timeZone: "America/New_York",
                      },
                    ).format(activityDateValue(activity.day))}
                  </time>
                </>
              )}
            </dd>
          </div>
          <div>
            <dt>{t("place")}</dt>
            <dd>{activity.place[locale]}</dd>
          </div>
        </dl>
        <section>
          <h2>{t("fees")}</h2>
          <p>{activity.fees[locale]}</p>
        </section>
        <section>
          <h2>{t("dates")}</h2>
          <p>{activity.seasonNote[locale]}</p>
        </section>
        <aside className="living-article-sources">
          <h2>{t("source")}</h2>
          <p>{t("checked", { date: activity.checkedAt })}</p>
          <a
            href={activity.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {activity.source}
            <ExternalLink size={14} aria-hidden="true" />
            <span className="sr-only">{shared("living.newTab")}</span>
          </a>
          <p>{t("note")}</p>
        </aside>
        <div className="living-article-action">
          <a
            className="button primary"
            href={activity.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {locale === "zh" ? "查看来源" : "View source"}
            <ExternalLink size={15} aria-hidden="true" />
            <span className="sr-only">{shared("living.newTab")}</span>
          </a>
          <Link className="text-link" href="/">
            {shared("navHome")}
          </Link>
        </div>
      </article>
    </div>
  );
}
