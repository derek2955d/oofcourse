import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules:
      process.env.SITE_INDEXABLE === "true"
        ? {
            userAgent: "*",
            allow: ["/en", "/zh"],
            disallow: [
              "/*/account",
              "/*/admin",
              "/*/post",
              "/*/preview",
              "/*/login",
              "/*/signup",
              "/*/search",
              "/api/",
              "/auth/",
            ],
          }
        : { userAgent: "*", disallow: "/" },
    sitemap: "https://oofcourse.com/sitemap.xml",
  };
}
