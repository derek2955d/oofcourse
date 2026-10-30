import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/seo";
import { activityYearSamples } from "@/lib/activity-year-preview";
import type { Locale } from "@/lib/catalog";
import "../../../../living.css";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const item = activityYearSamples().find((i) => i.slug === slug);
  return pageMetadata(
    locale,
    item?.title[locale] || "Sample",
    locale === "zh"
      ? "仅供版式测试，不是已确认活动。"
      : "Layout sample, not a confirmed activity.",
    `/preview/activity-year/${slug}`,
    true,
  );
}
export default async function SampleDetail({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  if (process.env.ENABLE_LAYOUT_PREVIEWS === "false") notFound();
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const item = activityYearSamples().find((i) => i.slug === slug);
  if (!item) notFound();
  const zh = locale === "zh";
  return (
    <div className="container page">
      <Link href="/preview/activity-year" className="text-link">
        {zh ? "← 返回内容样板" : "← Back to content preview"}
      </Link>
      <article className="living-article">
        <p className="notice">
          {zh
            ? "演示内容，不是实际举办记录或已确认活动；没有报名或购买入口。"
            : "Sample content, not a past event record or confirmed activity. No booking or purchase is offered."}
        </p>
        <header>
          <h1>{item.title[locale]}</h1>
          <p className="living-article-summary">{item.intro[locale]}</p>
          <p className="living-byline">
            {zh ? "示例日期：" : "Sample date: "}
            <time dateTime={item.day}>{item.day}</time>
          </p>
        </header>
        <section>
          <h2>{zh ? "内容样例" : "Sample story"}</h2>
          <p style={{ lineHeight: 1.9, marginTop: 16 }}>{item.body[locale]}</p>
        </section>
      </article>
    </div>
  );
}
