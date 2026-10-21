import type { Metadata } from "next";
import { getLocale } from "./i18n/server";
import { localePath, type Locale } from "./i18n/config";
export const siteUrl = "https://oofcourse.com";
export function localizedMetadata(
  locale: Locale,
  title: string,
  description: string,
  path: string,
  noindex = false,
): Metadata {
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: localePath(locale, path),
      languages: {
        "en-US": localePath("en", path),
        "zh-CN": localePath("zh", path),
        "x-default": localePath("en", path),
      },
    },
    openGraph: {
      title: `${title} | OofCourse`,
      description,
      url: localePath(locale, path),
      siteName: "OofCourse",
      locale: locale === "zh" ? "zh_CN" : "en_US",
      alternateLocale: [locale === "zh" ? "en_US" : "zh_CN"],
      type: "website",
      images: [{ url: `${siteUrl}/en/opengraph-image`, width: 1200, height: 630 }],
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
export async function metadata(
  title: string,
  description: string,
  path: string,
  noindex = false,
) {
  return localizedMetadata(
    await getLocale(),
    title,
    description,
    path,
    noindex,
  );
}
