import Link from "@/components/localized-link";
import { notFound } from "next/navigation";
import { guides } from "@/lib/guides";
import { localizeGuide } from "@/lib/i18n/guides";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/messages";
import { metadata } from "@/lib/seo";
export const dynamicParams = false;
export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const l = await getLocale(),
    { slug } = await params,
    item = guides.find((g) => g.slug === slug),
    g = item ? localizeGuide(item, l) : null;
  return metadata(
    g?.title || t(l, "notFound"),
    g?.intro || t(l, "notFoundText"),
    `/guides/${slug}`,
  );
}
export default async function Guide({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const l = await getLocale(),
    { slug } = await params,
    item = guides.find((g) => g.slug === slug);
  if (!item) notFound();
  const g = localizeGuide(item, l);
  return (
    <div className="container page">
      <nav
        className="breadcrumbs"
        aria-label={l === "zh" ? "面包屑导航" : "Breadcrumb"}
      >
        <Link href="/guides">{t(l, "guides")}</Link>
        <span>/</span>
        <span>{g.tag}</span>
      </nav>
      <article className="prose guide-article">
        <p className="eyebrow">
          {g.tag} · {g.readTime}
        </p>
        <h1 className="page-title">{g.title}</h1>
        <p className="guide-intro">{g.intro}</p>
        <p className="article-byline">OofCourse · {t(l, "originalGuide")}</p>
        <p>{t(l, "editorialNotice")}</p>
        {g.sections.map((s, i) => (
          <section key={s.title}>
            <p className="step-number">0{i + 1}</p>
            <h2>{s.title}</h2>
            <p>{s.body}</p>
            <ul>
              {s.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>
        ))}
        <div className="guide-next">
          <Link href={`/category/${g.category}`} className="button primary">
            {t(l, "guideExplore")} →
          </Link>
        </div>
      </article>
    </div>
  );
}
