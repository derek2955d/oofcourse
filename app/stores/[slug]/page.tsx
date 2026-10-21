import { notFound } from "next/navigation";
import { retailers } from "@/lib/data";
import { Catalog } from "@/components/catalog";
import { normalizeQuery } from "@/lib/query";
import { metadata } from "@/lib/seo";
export const dynamicParams = false;
export function generateStaticParams() {
  return retailers.map((r) => ({ slug: r.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = retailers.find((r) => r.slug === slug);
  return metadata(
    `${r?.name || "Unknown retailer"} Demo Collection`,
    "Browse a clearly labeled retailer demo collection. No active affiliate links or verified pricing.",
    `/stores/${slug}`,
    true,
  );
}
export default async function Store({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const r = retailers.find((r) => r.slug === slug);
  if (!r) notFound();
  return (
    <div className="container page">
      <p className="eyebrow">INDEPENDENT DEMO COLLECTION</p>
      <h1 className="page-title">The {r.name} collection.</h1>
      <p className="page-intro">
        {r.description} OofCourse is not an official {r.name} storefront.
      </p>
      <Catalog
        fixedRetailer={slug}
        action={`/stores/${slug}`}
        query={normalizeQuery(await searchParams)}
      />
    </div>
  );
}
