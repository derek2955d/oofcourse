import type { Metadata } from "next";
import { Header } from "@/components/header";
import { DemoNotice, Footer } from "@/components/site";
import { siteUrl } from "@/lib/seo";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "OofCourse — Great Deals? Of Course!",
    template: "%s | OofCourse",
  },
  description:
    "Discover thoughtfully selected everyday finds across tech, home, travel, and wellness. Explore the clearly labeled OofCourse demo.",
  robots: {
    index: process.env.SITE_INDEXABLE === "true",
    follow: process.env.SITE_INDEXABLE === "true",
  },
  openGraph: {
    title: "OofCourse — Great Deals? Of Course!",
    description: "Thoughtful finds for your everyday.",
    url: siteUrl,
    siteName: "OofCourse",
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-US">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <DemoNotice />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "OofCourse",
              url: siteUrl,
              inLanguage: "en-US",
              description:
                "An independent shopping discovery website. Phase 1 demo collection.",
            }),
          }}
        />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
