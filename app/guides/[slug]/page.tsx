import Link from "next/link";
import { notFound } from "next/navigation";
import { guides } from "@/lib/guides";
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
  const { slug } = await params;
  const g = guides.find((g) => g.slug === slug);
  return metadata(
    g?.title || "Guide not found",
    g?.intro || "This guide could not be found.",
    `/guides/${slug}`,
  );
}
export default async function Guide({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const g = guides.find((g) => g.slug === slug);
  if (!g) notFound();
  return (
    <div className="container page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/guides">Buying guides</Link>
        <span>/</span>
        <span>{g.tag}</span>
      </nav>
      <article className="prose guide-article">
        <p className="eyebrow">
          {g.tag} · {g.readTime.toUpperCase()}
        </p>
        <h1 className="page-title">{g.title}</h1>
        <p className="guide-intro">{g.intro}</p>
        <p className="article-byline">OofCourse Editorial · October 21, 2026</p>
        <div className="info-box">
          <strong>Independent editorial guidance</strong>
          <p>
            This is original general guidance, not hands-on product testing. No
            affiliate links, paid placement, or retailer approval are connected
            to this article.
          </p>
        </div>
        {g.sections.map((s, i) => (
          <section key={s.title}>
            <p className="step-number">0{i + 1}</p>
            <h2>{s.title}</h2>
            <p>{s.body}</p>
            <ul>
              {s.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        ))}
        <div className="guide-next">
          <h2>Ready to explore a few ideas?</h2>
          <p>
            Our current collection contains clearly labeled demo concepts,
            without live prices or purchasing links.
          </p>
          <Link href={`/category/${g.category}`} className="button primary">
            Explore demo ideas →
          </Link>
        </div>
      </article>
    </div>
  );
}
