import type { Metadata } from "next";
export const siteUrl = "https://oofcourse.com";
export function metadata(
  title: string,
  description: string,
  path: string,
  noindex = false,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | OofCourse`,
      description,
      url: path,
      siteName: "OofCourse",
      locale: "en_US",
      type: "website",
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
