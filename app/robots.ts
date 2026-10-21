import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules:
      process.env.SITE_INDEXABLE === "true"
        ? {
            userAgent: "*",
            allow: ["/en", "/zh"],
            disallow: [
              "/en/admin",
              "/zh/admin",
              "/en/deals",
              "/zh/deals",
              "/en/category/",
              "/zh/category/",
              "/en/stores/",
              "/zh/stores/",
              "/en/search",
              "/zh/search",
              "/en/saved",
              "/zh/saved",
            ],
          }
        : { userAgent: "*", disallow: "/" },
    sitemap: "https://oofcourse.com/sitemap.xml",
  };
}
