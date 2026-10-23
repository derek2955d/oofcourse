import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OofCourse — Your Local Life, Simplified.",
    short_name: "OofCourse",
    description:
      "Housing, jobs, marketplace and everyday local life in New York.",
    start_url: "/en",
    scope: "/",
    display: "standalone",
    background_color: "#F7F9FD",
    theme_color: "#3478F6",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
