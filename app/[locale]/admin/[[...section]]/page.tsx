import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminDashboard } from "@/components/admin";
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
    t("admin"),
    t("adminTitle"),
    "/admin" + (section?.length ? "/" + section.join("/") : ""),
    true,
  );
}
export default async function Admin({
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
        "users",
        "reports",
        "categories",
        "locations",
        "businesses",
        "promotions",
        "settings",
        "audit",
      ].includes(section[0]))
  )
    notFound();
  setRequestLocale(locale);
  return <AdminDashboard section={section?.[0]} query={await searchParams} />;
}
