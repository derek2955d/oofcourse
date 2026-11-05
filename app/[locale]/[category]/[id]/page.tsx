import { jobStructuredData, safeJson } from "@/lib/structured-data";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isCategory, type Locale } from "@/lib/catalog";
import { getPublicListing } from "@/lib/listings";
import { publicDB, requireUser } from "@/lib/supabase/server";
import { ListingDetail } from "@/components/detail";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; category: string; id: string }>;
}) {
  const { locale, category, id } = await params;
  if (!isCategory(category)) return {};
  const { item } = await getPublicListing(category, id);
  return pageMetadata(
    locale,
    item?.title || "Listing unavailable",
    item?.description.slice(0, 155) ||
      "This listing is not publicly available.",
    `/${category}/${id}`,
    !item,
  );
}
export default async function Detail({
  params,
}: {
  params: Promise<{ locale: Locale; category: string; id: string }>;
}) {
  const { locale, category, id } = await params;
  if (!isCategory(category)) notFound();
  setRequestLocale(locale);
  const { item, error } = await getPublicListing(category, id);
  if (error) {
    const t = await getTranslations();
    return (
      <div className="container page">
        <h1>{t("errorTitle")}</h1>
        <p role="alert" className="notice error-notice">
          {t("dataError")}
        </p>
      </div>
    );
  }
  if (!item) notFound();
  let initialSaved = false;
  try {
    const { db, user } = await requireUser();
    const { data } = await db
      .from("favorites")
      .select("listing_id")
      .eq("user_id", user.id)
      .eq("listing_id", id)
      .maybeSingle();
    initialSaved = !!data;
  } catch {}
  let schema: ReturnType<typeof jobStructuredData> = null;
  if (item.category === "jobs") {
    const { data: area } = await publicDB()
      .from("locations")
      .select("city,state")
      .eq("id", item.location)
      .single();
    if (area) schema = jobStructuredData(item, area, locale);
  }
  return (
    <>
      {" "}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJson(schema) }}
        />
      )}
      <ListingDetail
        item={item}
        category={category}
        initialSaved={initialSaved}
      />
    </>
  );
}
