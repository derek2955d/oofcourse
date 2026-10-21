"use client";
import { useLocale } from "@/components/locale-provider";
import { t } from "@/lib/i18n/messages";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const l = useLocale();
  return (
    <div className="error-page">
      <h1>{t(l, "errorTitle")}</h1>
      <p>{t(l, "errorText")}</p>
      <button className="button primary" onClick={reset}>
        {t(l, "retry")}
      </button>
    </div>
  );
}
