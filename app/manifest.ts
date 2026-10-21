import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OofCourse — Great Deals? Of Course!",
    short_name: "OofCourse",
    description: "Independent shopping discovery · 独立购物发现",
    start_url: "/en",
    scope: "/",
    display: "standalone",
    background_color: "#fafbf8",
    theme_color: "#12254a",
    lang: "en-US",
    categories: ["shopping", "lifestyle"],
    icons: [
      {
        src: "/pwa/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      { name: "Discover", url: "/en/deals" },
      { name: "Saved finds", url: "/en/saved" },
    ],
  };
}
