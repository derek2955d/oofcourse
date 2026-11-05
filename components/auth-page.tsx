import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CityPoster } from "./city-poster";
import { ArrowLeft, MapPin, Plus, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { configured } from "@/lib/supabase/server";
import { AuthForm } from "./auth-form";
import { ConnectionNotice } from "./ui";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/catalog";
export function authMetadata(mode: "login" | "signup" | "reset") {
  return async ({ params }: { params: Promise<{ locale: Locale }> }) => {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return pageMetadata(
      locale,
      t(`${mode}Title`),
      t(`${mode}Intro`),
      `/${mode === "reset" ? "reset-password" : mode}`,
      true,
    );
  };
}
export async function AuthPage({
  params,
  mode,
}: {
  params: Promise<{ locale: Locale }>;
  mode: "login" | "signup" | "reset";
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <div className="container auth-scene">
      <Link href="/" className="auth-back">
        <ArrowLeft size={16} />
        {t("authDesign.back")}
      </Link>
      <div className="auth-layout auth-redesign">
        <aside className="auth-story" aria-label={t("authDesign.city")}>
          <div className="auth-story-copy">
            <p className="auth-story-eyebrow">
              <span />
              {t("authDesign.eyebrow")}
            </p>
            <h2>
              {t("authDesign.headline")}
              <br />
              <span>{t("authDesign.accent")}</span>
            </h2>
            <p className="auth-story-intro">{t("authDesign.intro")}</p>
          </div>
          <div className="auth-illustration">
            <CityPoster />
          </div>
          <div className="auth-story-bottom">
            <MapPin size={16} />
            <span>{t("authDesign.city")}</span>
          </div>
        </aside>
        <section className="auth-panel" aria-labelledby="auth-title">
          <div className="auth-form-wrap">
            <div className="auth-account-icon">
              {mode === "signup" ? <Plus size={25} /> : <Sparkles size={25} />}
            </div>
            <p className="auth-account-label">{t("authDesign.accountLabel")}</p>
            <h1 id="auth-title" className="page-title">
              {t(`${mode}Title`)}
            </h1>
            <p className="page-intro">{t(`${mode}Intro`)}</p>
            {!configured() && <ConnectionNotice />}
            <Suspense>
              <AuthForm mode={mode} connected={configured()} />
            </Suspense>
            <p className="auth-panel-foot">
              <span />
              {t("authDesign.foot")}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
