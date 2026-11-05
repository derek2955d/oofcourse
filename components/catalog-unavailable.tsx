"use client";
import { useTranslations } from "next-intl";
import { useId } from "react";
import { AlertCircle, PlugZap } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function CatalogUnavailable({
  reason,
}: {
  reason: "unconfigured" | "error";
}) {
  const t = useTranslations();
  const heading = useId();
  const Icon = reason === "error" ? AlertCircle : PlugZap;
  return (
    <section
      className="surface catalog-service-state"
      role={reason === "error" ? "alert" : "status"}
      aria-labelledby={heading}
      data-catalog-state={reason}
    >
      <Icon size={28} aria-hidden="true" />
      <h2 id={heading}>{t(`catalogState.${reason}Title`)}</h2>
      <p>{t(`catalogState.${reason}Description`)}</p>
      <div className="table-actions">
        <button
          type="button"
          className="button primary"
          onClick={() => window.location.reload()}
        >
          {t("retry")}
        </button>
        <Link href="/weekend" className="button button-outline">
          {t("living.viewEvents")}
        </Link>
      </div>
    </section>
  );
}
