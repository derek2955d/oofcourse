import { getTranslations, getLocale } from "next-intl/server";
import { MapPin, ShieldCheck, UserRound, Info } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  categoryData,
  locationLabel,
  formatMoney,
  type Listing,
  type CategoryKey,
  type Locale,
} from "@/lib/catalog";
import { detailFields } from "@/lib/fields";
import { ImageGallery } from "./gallery";
import { FavoriteButton, ShareButton, ListingDialog } from "./listing-actions";
export async function ListingDetail({
  item,
  category,
  preview = false,
  initialSaved = false,
}: {
  item?: Listing;
  category: CategoryKey;
  preview?: boolean;
  initialSaved?: boolean;
}) {
  const t = await getTranslations(),
    l = (await getLocale()) as Locale;
  const title = item?.title || t("previewTitle");
  const date = (v: string) =>
    new Intl.DateTimeFormat(l === "zh" ? "zh-CN" : "en-US", {
      dateStyle: "medium",
      timeZone: "America/New_York",
    }).format(new Date(v));
  const price = preview
    ? t("previewPrice")
    : item?.category === "jobs"
      ? `${formatMoney(Number(item.details.salary_min), l)} – ${formatMoney(Number(item.details.salary_max), l)} / ${t(String(item.details.pay_period))}`
      : item?.price === 0
        ? t("free")
        : formatMoney(item?.price ?? null, l) || t("priceOnRequest");
  return (
    <div className="container page">
      {preview && (
        <div className="preview-banner">
          <Info size={20} />
          <div>
            <strong>{t("previewBadge")}</strong>
            {t("previewNotice")}
          </div>
        </div>
      )}
      <nav className="breadcrumbs" aria-label={t("breadcrumb")}>
        <Link href="/">{t("navHome")}</Link>
        <span>/</span>
        <Link href={`/${category}`}>{categoryData[category][l]}</Link>
      </nav>
      <div className="detail-heading">
        <div>
          <h1>{title}</h1>
          <div className="detail-meta">
            <span>
              <MapPin size={15} />
              {item ? locationLabel(item.location, l) : t("location")}
            </span>
            {item?.published_at && (
              <span>
                {t("published")}: {date(item.published_at)}
              </span>
            )}
            {item?.is_sponsored && (
              <span className="sponsored">{t("sponsored")}</span>
            )}
          </div>
        </div>
        <div className="detail-actions">
          <FavoriteButton
            id={item?.id || ""}
            preview={preview}
            initial={initialSaved}
          />
          <ShareButton />
        </div>
      </div>
      <div className="detail-grid">
        <div className="detail-main">
          <ImageGallery
            images={item?.images || []}
            title={title}
            category={category}
            preview={preview}
          />
          <section className="detail-section">
            <h2>{t("listingDetails")}</h2>
            <dl className="specs-grid">
              {detailFields[category]
                .filter((f) => f.type !== "textarea")
                .map((f) => (
                  <div key={f.key}>
                    <dt>{t(f.key)}</dt>
                    <dd>
                      {preview
                        ? "—"
                        : f.type === "select" && item?.details[f.key]
                          ? t(String(item.details[f.key]))
                          : String(item?.details[f.key] ?? "—")}
                    </dd>
                  </div>
                ))}
            </dl>
          </section>
          <section className="detail-section">
            <h2>{t("description")}</h2>
            <p>{item?.description || t("previewBody")}</p>
          </section>
          {category === "housing" && (
            <section className="detail-section">
              <h2>{t("housingFees")}</h2>
              <p>
                {preview
                  ? t("previewBody")
                  : String(item?.details.fee_disclosure || "")}
              </p>
            </section>
          )}
          <div className="detail-secondary">
            <p>
              {t("originalLanguage")}
              {item?.expires_at && (
                <>
                  {" "}
                  · {t("expires")}: {date(item.expires_at)}
                </>
              )}
            </p>
            <ListingDialog
              kind="report"
              id={item?.id || ""}
              preview={preview}
            />
          </div>
        </div>
        <aside className="contact-card">
          <p className="detail-price">{price}</p>
          <div className="publisher">
            <span className="publisher-icon">
              <UserRound size={21} />
            </span>
            <div>
              <small>{t("publisher")}</small>
              <strong>{item?.publisher || t("member")}</strong>
            </div>
          </div>
          <ListingDialog kind="contact" id={item?.id || ""} preview={preview} />
          {preview && (
            <>
              <p className="small-note">{t("previewUnavailable")}</p>
              <Link className="button button-outline" href={`/${category}`}>
                {t("previewExplore")}
              </Link>
            </>
          )}
          <div className="safety-note">
            <ShieldCheck size={18} />
            <p>{t("safetyTip")}</p>
          </div>
          <Link className="text-link" href="/safety" style={{ marginTop: 14 }}>
            {t("safety")}
          </Link>
        </aside>
      </div>
    </div>
  );
}
