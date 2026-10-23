"use client";
import { useTranslations } from "next-intl";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations();
  return (
    <div className="container page centered">
      <h1>{t("errorTitle")}</h1>
      <p>{t("errorText")}</p>
      <button className="button primary" onClick={reset}>
        {t("retry")}
      </button>
    </div>
  );
}
