import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { routing } from "@/i18n/routing";
import { MobileBottomNav } from "@/components/navigation";
import { SiteFooter } from "@/components/footer";
import "@fontsource-variable/inter";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/600.css";
import "../globals.css";
import { AuthenticatedHeader } from "@/components/authenticated-header";
import { CatalogProvider } from "@/components/catalog-provider";
import { safeJson } from "@/lib/structured-data";
import { selectedState } from "@/lib/geography-server";
import { loadTaxonomy } from "@/lib/taxonomy-server";
export const metadata: Metadata = {
  metadataBase: new URL("https://oofcourse.com"),
  title: {
    default: "OofCourse — Your Local Life, Simplified.",
    template: "%s | OofCourse",
  },
  description:
    "Discover nearby events, housing, jobs, secondhand finds, local services and businesses in New York.",
  robots: { index: false, follow: true },
  icons: { icon: "/icon.svg" },
  manifest: "/manifest.webmanifest",
};
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <html lang={locale === "zh" ? "zh-CN" : "en-US"}>
      <body>
        <NextIntlClientProvider messages={await getMessages()}>
          <CatalogProvider
            data={await loadTaxonomy()}
            initialState={await selectedState()}
          >
            <a href="#main-content" className="skip-link">
              {locale === "zh" ? "跳至主要内容" : "Skip to content"}
            </a>
            <Suspense fallback={<div className="header-placeholder" />}>
              <AuthenticatedHeader />
            </Suspense>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: safeJson({
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  name: "OofCourse",
                  url: `https://oofcourse.com/${locale}`,
                  inLanguage: locale === "zh" ? "zh-CN" : "en-US",
                }),
              }}
            />
            <main id="main-content">{children}</main>
            <SiteFooter />
            <MobileBottomNav />
          </CatalogProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
