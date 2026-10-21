import type { MetadataRoute } from "next";
import { guides } from "@/lib/guides";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/about",
    "/contact",
    "/privacy",
    "/affiliate-disclosure",
    "/terms",
    "/categories",
    "/stores",
    "/guides",
    ...guides.map((g) => `/guides/${g.slug}`),
  ].map((path) => ({
    url: `https://oofcourse.com${path}`,
    changeFrequency: "monthly",
    priority: path ? 0.5 : 1,
  }));
}
