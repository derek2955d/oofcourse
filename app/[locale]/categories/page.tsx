import { getTranslations, setRequestLocale } from "next-intl/server";
import { CategoryGrid } from "@/components/cards";
import { pageMetadata } from "@/lib/seo";
import { selectedState } from "@/lib/geography-server";
import type { Locale } from "@/lib/catalog";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMetadata(
    locale,
    t("allCategories"),
    t("categorySubtitle"),
    "/categories",
  );
}
export default async function Categories({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ state?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <div className="container page">
      <h1 className="page-title">{t("allCategories")}</h1>
      <p className="page-intro">{t("categorySubtitle")}</p>
      <CategoryGrid state={await selectedState((await searchParams).state)} />
    </div>
  );
}
