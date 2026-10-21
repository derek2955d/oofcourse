import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/about", "/contact", "/privacy", "/affiliate-disclosure"].map(
    (path) => ({
      url: `https://oofcourse.com${path}`,
      changeFrequency: "monthly",
      priority: path ? 0.4 : 1,
    }),
  );
}
