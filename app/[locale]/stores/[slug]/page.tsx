import { notFound } from "next/navigation";
import { retailers } from "@/lib/data";
import { Catalog } from "@/components/catalog";
import { normalizeQuery } from "@/lib/query";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/messages";
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
  const l = await getLocale(),
    { slug } = await params,
    r = retailers.find((r) => r.slug === slug);
  return metadata(
    r?.name || t(l, "notFound"),
    t(l, "storeIntro"),
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
  const { slug } = await params,
    r = retailers.find((r) => r.slug === slug);
  if (!r) notFound();
  return (
    <div className="container page">
      <h1 className="page-title">{r.name}</h1>
      <Catalog
        fixedRetailer={slug}
        action={`/stores/${slug}`}
        query={normalizeQuery(await searchParams)}
      />
    </div>
  );
}
