import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isCategory, type Locale } from "@/lib/catalog";
import { ListingDetail } from "@/components/detail";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; category: string }>;
}) {
  const { locale, category } = await params;
  const t = await getTranslations({ locale });
  return pageMetadata(
    locale,
    t("previewBadge"),
    t("previewNotice"),
    `/preview/${category}`,
    true,
  );
}
export default async function Preview({
  params,
}: {
  params: Promise<{ locale: Locale; category: string }>;
}) {
  const { locale, category } = await params;
  if (!isCategory(category) || process.env.ENABLE_LAYOUT_PREVIEWS === "false")
    notFound();
  setRequestLocale(locale);
  return <ListingDetail category={category} preview />;
}
