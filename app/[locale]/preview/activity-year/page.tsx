import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/seo";
import {
  activityYearSamples,
  type ActivityYearSample,
} from "@/lib/activity-year-preview";
import type { Locale } from "@/lib/catalog";
import "../../../living.css";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return pageMetadata(
    locale,
    locale === "zh" ? "一年内容样板" : "A year of content — sample",
    locale === "zh"
      ? "独立演示内容，不代表真实历史或已确认活动。"
      : "Isolated sample content, not a real publication history or confirmed events.",
    "/preview/activity-year",
    true,
  );
}
function SampleCard({
  item,
  locale,
}: {
  item: ActivityYearSample;
  locale: Locale;
}) {
  const zh = locale === "zh";
  const href = `/preview/activity-year/${item.slug}`;
  return (
    <article className="editorial-activity-card">
      <Link
        href={href}
        className="editorial-art-link"
        aria-label={item.title[locale]}
      >
        <Image
          src={`/illustrations/${item.image}.svg`}
          alt=""
          width={600}
          height={400}
          sizes="(max-width:760px) 100vw,260px"
        />
        <span>{zh ? "主题插画 · 样例" : "Illustration · Sample"}</span>
      </Link>
      <div className="editorial-activity-body">
        <p className="editorial-activity-label">
          {zh ? "示例日期" : "Sample date"}
          {" · "}
          <time dateTime={item.day}>{item.day}</time>
        </p>
        <h3>
          <Link href={href}>{item.title[locale]}</Link>
        </h3>
        <p>{item.intro[locale]}</p>
        <Link className="text-link" href={href}>
          {zh ? "查看内容样例 →" : "Read sample →"}
        </Link>
      </div>
    </article>
  );
}
export default async function ActivityYearPreview({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  if (process.env.ENABLE_LAYOUT_PREVIEWS === "false") notFound();
  const { locale } = await params;
  setRequestLocale(locale);
  const zh = locale === "zh";
  const items = activityYearSamples();
  const months = Array.from(
    new Set(
      items.filter((i) => i.period === "archive").map((i) => i.day.slice(0, 7)),
    ),
  ).reverse();
  return (
    <div className="container page">
      <aside className="notice" role="note">
        <strong>
          {zh
            ? "内容展示样板 · 非真实活动库"
            : "Content preview · Not a real event feed"}
        </strong>
        <p>
          {zh
            ? "以下日期与内容仅用于模拟一年内容积累和未来一个月的版式，不代表网站已运营一年，也不是已确认或可报名的活动。"
            : "Dates and stories below simulate a year of content and a month ahead. They are not a claim of past operation or confirmed/bookable events."}
        </p>
        <Link href="/weekend" className="text-link">
          {zh ? "返回真实活动页 →" : "Return to the real activity feed →"}
        </Link>
      </aside>
      <header className="living-page-header">
        <p className="eyebrow">
          OOFCOURSE / {zh ? "内容样板" : "CONTENT SAMPLE"}
        </p>
        <h1>
          {zh
            ? "每个月，都有出门的灵感。"
            : "A little inspiration, every month."}
        </h1>
        <p>
          {zh
            ? "24 篇往期样例与 8 条未来活动样例，看看内容丰富后的浏览体验。"
            : "24 archive concepts and 8 upcoming concepts to preview a fuller browsing experience."}
        </p>
      </header>
      <section aria-labelledby="sample-upcoming">
        <h2 id="sample-upcoming" style={{ marginBottom: 20 }}>
          {zh ? "未来 30 天 · 活动样例" : "Next 30 days · Sample activities"}
        </h2>
        <div className="editorial-activity-cards">
          {items
            .filter((i) => i.period === "upcoming")
            .map((i) => (
              <SampleCard key={i.slug} item={i} locale={locale} />
            ))}
        </div>
      </section>
      <section aria-labelledby="sample-archive" style={{ marginTop: 36 }}>
        <h2 id="sample-archive">
          {zh ? "过去一年 · 内容样例" : "Past year · Sample archive"}
        </h2>
        <p className="muted" style={{ margin: "12px 0 20px" }}>
          {zh
            ? "按月展开查看；示例日期不是实际发布日期。"
            : "Open a month to browse. Sample dates are not publication dates."}
        </p>
        {months.map((month) => (
          <details key={month} className="surface" style={{ marginBottom: 12 }}>
            <summary style={{ cursor: "pointer" }}>
              {month}
              {zh ? " · 内容样例" : " · Sample stories"}
            </summary>
            <div className="editorial-activity-cards" style={{ marginTop: 18 }}>
              {items
                .filter(
                  (i) => i.period === "archive" && i.day.startsWith(month),
                )
                .map((i) => (
                  <SampleCard key={i.slug} item={i} locale={locale} />
                ))}
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}
