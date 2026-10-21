import Link from "@/components/localized-link";
import { notFound } from "next/navigation";
import { categories } from "@/lib/data";
import { Catalog } from "@/components/catalog";
import { normalizeQuery } from "@/lib/query";
import { getLocale } from "@/lib/i18n/server";
import { categoryName } from "@/lib/i18n/catalog";
import { t } from "@/lib/i18n/messages";
import { metadata } from "@/lib/seo";
export const dynamicParams = false;
export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const l = await getLocale(),
    { slug } = await params,
    c = categories.find((c) => c.slug === slug);
  return metadata(
    c ? categoryName(c, l) : t(l, "notFound"),
    t(l, "browseIntro"),
    `/category/${slug}`,
    true,
  );
}
export default async function Category({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const l = await getLocale(),
    { slug } = await params,
    c = categories.find((c) => c.slug === slug);
  if (!c) notFound();
  return (
    <div className="container page">
      <nav
        className="breadcrumbs"
        aria-label={l === "zh" ? "面包屑导航" : "Breadcrumb"}
      >
        <Link href="/">{t(l, "home")}</Link>
        <span>/</span>
        <Link href="/categories">{t(l, "categories")}</Link>
      </nav>
      <h1 className="page-title">{categoryName(c, l)}</h1>
      <Catalog
        fixedCategory={slug}
        action={`/category/${slug}`}
        query={normalizeQuery(await searchParams)}
      />
    </div>
  );
}
