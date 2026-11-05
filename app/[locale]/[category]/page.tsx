import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { isCategory, categoryData, type Locale } from "@/lib/catalog";
import { Catalog } from "@/components/catalog";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; category: string }>;
}) {
  const { locale, category } = await params;
  if (!isCategory(category)) return {};
  return pageMetadata(
    locale,
    categoryData[category][locale],
    categoryData[category][locale === "zh" ? "tagZh" : "tagEn"],
    `/${category}`,
  );
}
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale; category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, category } = await params;
  if (!isCategory(category)) notFound();
  setRequestLocale(locale);
  return <Catalog category={category} raw={await searchParams} />;
}
