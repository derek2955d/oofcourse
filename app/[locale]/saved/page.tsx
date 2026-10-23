import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccountDashboard } from "@/components/account";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/catalog";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMetadata(locale, t("savedTitle"), t("savedIntro"), "/saved", true);
}
export default async function Saved({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  setRequestLocale((await params).locale);
  return <AccountDashboard section="saved" />;
}
