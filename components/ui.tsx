import { ArrowUpRight, Plus, Search, Inbox } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { CategoryIcon } from "./icons";
import { categoryData, type CategoryKey } from "@/lib/catalog";
export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  return <span className={`status status-${status}`}>{label}</span>;
}
export function SectionHeading({
  eyebrow,
  title,
  href,
  label,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {label}
          <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  );
}
export async function EmptyState({
  category,
  filtered = false,
  compact = false,
  state,
}: {
  category?: CategoryKey;
  filtered?: boolean;
  compact?: boolean;
  state?: string;
}) {
  const t = await getTranslations();
  const key = category
    ? `empty${category.charAt(0).toUpperCase() + category.slice(1)}`
    : "noResults";
  return (
    <div
      className={`empty-state ${filtered ? "compact-empty" : ""} ${compact ? "home-empty" : ""}`}
    >
      <div className="empty-scene" aria-hidden="true">
        <div className="empty-orbit" />
        <span
          style={
            category
              ? {
                  background: categoryData[category].background,
                  color: categoryData[category].color,
                }
              : undefined
          }
        >
          {category ? (
            <CategoryIcon category={category} size={32} />
          ) : (
            <Search size={32} />
          )}
        </span>
        <i />
        <i />
      </div>
      <h3>{t(filtered ? "noResults" : key)}</h3>
      <p>{t(filtered ? "noResultsText" : "emptyIntro")}</p>
      <Link
        className={filtered ? "text-link" : "button button-outline"}
        href={(() => {
          const base = filtered
            ? category
              ? `/${category}`
              : "/search"
            : `/post${category ? `?category=${category}` : ""}`;
          return state
            ? `${base}${base.includes("?") ? "&" : "?"}state=${state}`
            : base;
        })()}
      >
        {filtered ? t("clear") : t("firstPost")}
        {filtered ? <ArrowUpRight size={15} /> : <Plus size={16} />}
      </Link>
    </div>
  );
}
export async function ConnectionNotice() {
  const t = await getTranslations();
  return (
    <div className="connection-notice">
      <Inbox size={22} />
      <div>
        <h2>{t("setupTitle")}</h2>
        <p>{t("setupMessage")}</p>
        <Link href="/help" className="text-link">
          {t("setupHelp")}
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </div>
  );
}
export function LoadingSkeleton() {
  return (
    <div className="skeleton-grid" aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <div className="skeleton" key={n}>
          <i />
          <i />
          <i />
        </div>
      ))}
    </div>
  );
}
export function FormField({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
