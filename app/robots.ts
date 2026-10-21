import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules:
      process.env.SITE_INDEXABLE === "true"
        ? {
            userAgent: "*",
            allow: "/",
            disallow: [
              "/admin",
              "/deals",
              "/category/",
              "/stores/",
              "/search",
              "/saved",
            ],
          }
        : { userAgent: "*", disallow: "/" },
    sitemap: "https://oofcourse.com/sitemap.xml",
  };
}
