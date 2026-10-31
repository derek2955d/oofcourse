import { getTranslations, setRequestLocale } from "next-intl/server";
import { Catalog } from "@/components/catalog";
import { isCategory, type Locale } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMetadata(
    locale,
    t("navSearch"),
    t("heroSubtitle"),
    "/search",
    true,
  );
}
export default async function Search({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const raw = await searchParams;
  return (
    <Catalog
      category={
        typeof raw.category === "string" && isCategory(raw.category)
          ? raw.category
          : undefined
      }
      raw={raw}
    />
  );
}
