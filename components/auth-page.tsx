import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
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
    <div className="container page">
      <div className="auth-layout">
        {!configured() && <ConnectionNotice />}
        <div className="surface">
          <p className="eyebrow">OOFCOURSE.</p>
          <h1 className="page-title">{t(`${mode}Title`)}</h1>
          <p className="page-intro">{t(`${mode}Intro`)}</p>
          <Suspense>
            <AuthForm mode={mode} connected={configured()} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
