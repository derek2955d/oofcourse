import type { MetadataRoute } from "next";
import { guides } from "@/lib/guides";
import { siteUrl } from "@/lib/seo";
import { locales, localePath } from "@/lib/i18n/config";
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/about",
    "/contact",
    "/privacy",
    "/affiliate-disclosure",
    "/terms",
    "/categories",
    "/guides",
    ...guides.map((g) => `/guides/${g.slug}`),
  ];
  return locales.flatMap((locale) =>
    paths.map((path) => ({
      url: siteUrl + localePath(locale, path),
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.5,
      alternates: {
        languages: {
          "en-US": siteUrl + localePath("en", path),
          "zh-CN": siteUrl + localePath("zh", path),
          "x-default": siteUrl + localePath("en", path),
        },
      },
    })),
  );
}
