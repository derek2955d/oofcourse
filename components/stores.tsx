"use client";
import Link from "./localized-link";
import { retailers } from "@/lib/data";
import { useLocale } from "./locale-provider";
import { t } from "@/lib/i18n/messages";
export function StoreCards() {
  const l = useLocale();
  return (
    <div className="retailer-directory">
      {retailers.map((r) => (
        <Link
          key={r.slug}
          href={`/stores/${r.slug}`}
          className="retailer-directory-link"
        >
          {r.name}
          <span>{t(l, "viewAll")} →</span>
        </Link>
      ))}
    </div>
  );
}
