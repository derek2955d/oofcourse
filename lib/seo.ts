import type { Metadata } from "next";
import type { Locale } from "./catalog";
export const origin = "https://oofcourse.com";
export function pageMetadata(
  locale: Locale,
  title: string,
  description: string,
  path = "",
  privatePage = false,
): Metadata {
  const p = path === "/" ? "" : path;
  return {
    metadataBase: new URL(origin),
    title,
    description,
    alternates: {
      canonical: `/${locale}${p}`,
      languages: {
        "en-US": `/en${p}`,
        "zh-CN": `/zh${p}`,
        "x-default": `/en${p}`,
      },
    },
    openGraph: {
      title: `${title} | OofCourse`,
      description,
      url: `${origin}/${locale}${p}`,
      siteName: "OofCourse",
      locale: locale === "zh" ? "zh_CN" : "en_US",
      alternateLocale: [locale === "zh" ? "en_US" : "zh_CN"],
      images: [{ url: `${origin}/art/social.png`, width: 1200, height: 630 }],
      type: "website",
    },
    robots: {
      index: !privatePage && process.env.SITE_INDEXABLE === "true",
      follow: !privatePage,
    },
    twitter: { card: "summary_large_image" },
  };
}
