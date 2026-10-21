export const dynamicParams = false;
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories } from "@/lib/data";
import { metadata } from "@/lib/seo";
import { Catalog, normalizeQuery } from "@/components/catalog";
export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = categories.find((c) => c.slug === slug);
  return metadata(
    c?.name || "Category not found",
    c
      ? `Discover ${c.name.toLowerCase()} demo finds. ${c.description}`
      : "This category could not be found.",
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
  const { slug } = await params;
  const c = categories.find((c) => c.slug === slug);
  if (!c) notFound();
  return (
    <div className="container page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/deals">All deals</Link>
        <span>/</span>
        <span>{c.name}</span>
      </nav>
      <p className="eyebrow">THE {c.name.toUpperCase()} EDIT</p>
      <h1 className="page-title">{c.name}</h1>
      <p className="page-intro">
        {c.description} Browse original demo concepts, with illustrative prices
        only.
      </p>
      <Catalog
        fixedCategory={slug}
        action={`/category/${slug}`}
        query={normalizeQuery(await searchParams)}
      />
    </div>
  );
}
