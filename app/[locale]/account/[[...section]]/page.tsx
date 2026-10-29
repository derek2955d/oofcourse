import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AccountDashboard } from "@/components/account";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/catalog";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; section?: string[] }>;
}) {
  const { locale, section } = await params;
  const t = await getTranslations({ locale });
  return pageMetadata(
    locale,
    t("navAccount"),
    t("accountTitle"),
    "/account" + (section?.length ? "/" + section.join("/") : ""),
    true,
  );
}
export default async function Account({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale; section?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, section } = await params;
  if (
    (section?.length || 0) > 1 ||
    (section?.[0] &&
      ![
        "listings",
        "drafts",
        "pending",
        "saved",
        "messages",
        "profile",
        "business",
        "security",
      ].includes(section[0]))
  )
    notFound();
  setRequestLocale(locale);
  return <AccountDashboard section={section?.[0]} raw={await searchParams} />;
}
