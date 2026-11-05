import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { livingGuides } from "@/lib/living";
import { LivingGuideCard, LivingEvents } from "@/components/living";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/catalog";
import "../../living.css";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "living" });
  return pageMetadata(locale, t("nav"), t("intro"), "/living");
}
export default async function LivingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("living");
  const shared = await getTranslations();
  return (
    <div className="container page living-page">
      <nav className="breadcrumbs" aria-label={shared("breadcrumb")}>
        <Link href="/">{shared("navHome")}</Link>
        <span>/</span>
        <span>{t("nav")}</span>
      </nav>
      <header className="living-page-header">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1>{t("title")}</h1>
        <p>{t("intro")}</p>
      </header>
      <section aria-labelledby="living-guides-heading">
        <h2 id="living-guides-heading" className="living-guide-heading">
          {t("guides")}
        </h2>
        <div className="living-guide-grid">
          {livingGuides.map((guide) => (
            <LivingGuideCard
              guide={guide}
              key={guide.slug}
              locale={locale}
              read={t("read")}
            />
          ))}
        </div>
      </section>
      <LivingEvents />
    </div>
  );
}
