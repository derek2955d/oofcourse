import type { MetadataRoute } from "next";
import { livingGuides } from "@/lib/living";
import { categoryKeys } from "@/lib/catalog";
import { configured, publicDB } from "@/lib/supabase/server";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = [
    "",
    ...categoryKeys.map((c) => "/" + c),
    "/categories",
    "/living",
    ...livingGuides.map((guide) => `/living/${guide.slug}`),
    "/about",
    "/contact",
    "/help",
    "/safety",
    "/privacy",
    "/terms",
    "/guidelines",
  ];
  if (configured() && process.env.SITE_INDEXABLE === "true") {
    const db = publicDB();
    const [listings, businesses] = await Promise.all([
      db
        .from("listings")
        .select("id,category_id")
        .eq("status", "approved")
        .gt("expires_at", new Date().toISOString())
        .limit(5000),
      db
        .from("business_profiles")
        .select("id")
        .eq("status", "approved")
        .limit(1000),
    ]);
    for (const row of listings.data || [])
      paths.push(`/${row.category_id}/${row.id}`);
    for (const row of businesses.data || [])
      paths.push(`/businesses/profiles/${row.id}`);
  }
  return (["en", "zh"] as const).flatMap((l) =>
    paths.map((path) => ({
      url: `https://oofcourse.com/${l}${path}`,
      alternates: {
        languages: {
          "en-US": `https://oofcourse.com/en${path}`,
          "zh-CN": `https://oofcourse.com/zh${path}`,
          "x-default": `https://oofcourse.com/en${path}`,
        },
      },
    })),
  );
}
