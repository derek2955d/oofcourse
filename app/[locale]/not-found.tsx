"use client";
import Link from "@/components/localized-link";
import { useLocale } from "@/components/locale-provider";
import { t } from "@/lib/i18n/messages";
export default function NotFound() {
  const l = useLocale();
  return (
    <div className="error-page">
      <h1>{t(l, "notFound")}</h1>
      <p>{t(l, "notFoundText")}</p>
      <Link className="button primary" href="/deals">
        {t(l, "explore")}
      </Link>
    </div>
  );
}
