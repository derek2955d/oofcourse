import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { DemoNotice, Footer } from "@/components/site";
import { SavedProvider } from "@/components/saved";
import { LocaleProvider } from "@/components/locale-provider";
import { isLocale, languageTag } from "@/lib/i18n/config";
import { siteUrl } from "@/lib/seo";
import "../globals.css";
export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }];
}
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "OofCourse — Great Deals? Of Course!",
    template: "%s | OofCourse",
  },
  robots: {
    index: process.env.SITE_INDEXABLE === "true",
    follow: process.env.SITE_INDEXABLE === "true",
  },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
  openGraph: {
    siteName: "OofCourse",
    type: "website",
    images: [{ url: `${siteUrl}/en/opengraph-image`, width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  appleWebApp: { capable: true, title: "OofCourse", statusBarStyle: "default" },
};
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={languageTag(locale)}>
      <body>
        <LocaleProvider locale={locale}>
          <a href="#main" className="skip-link">
            {locale === "zh" ? "跳至内容" : "Skip to content"}
          </a>
          <SavedProvider>
            <Suspense fallback={<div className="header-placeholder" />}>
              <Header />
            </Suspense>
            <DemoNotice />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  name: "OofCourse",
                  url: `${siteUrl}/${locale}`,
                  inLanguage: languageTag(locale),
                  description:
                    locale === "zh"
                      ? "独立的综合购物发现平台。"
                      : "An independent shopping discovery platform.",
                }),
              }}
            />
            <main id="main">{children}</main>
            <Footer />
          </SavedProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
