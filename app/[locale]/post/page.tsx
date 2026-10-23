import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { configured, requireUser } from "@/lib/supabase/server";
import { fromRow, attachImages } from "@/lib/listings";
import { isCategory, type Listing, type Locale } from "@/lib/catalog";
import { ConnectionNotice } from "@/components/ui";
import { PublishingWizard } from "@/components/publishing";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMetadata(locale, t("navPost"), t("postIntro"), "/post", true);
}
export default async function Post({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ category?: string; id?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations(),
    q = await searchParams;
  let existing: Listing | undefined;
  let needsLogin = false;
  let missing = false;
  if (configured()) {
    try {
      const { db, user } = await requireUser();
      if (q.id) {
        const { data, error } = await db
          .from("listings")
          .select("*")
          .eq("id", q.id)
          .eq("user_id", user.id)
          .single();
        if (error || !data) missing = true;
        else existing = fromRow(data) || undefined;
        if (existing) await attachImages([existing], db);
      }
    } catch {
      needsLogin = true;
    }
  }
  if (needsLogin)
    return (
      <div className="container page centered">
        <h1>{t("authRequired")}</h1>
        <Link href="/login?next=/post" className="button primary">
          {t("login")}
        </Link>
      </div>
    );
  if (missing)
    return (
      <div className="container page">
        <h1>{t("notFoundTitle")}</h1>
        <p>{t("notFoundText")}</p>
      </div>
    );
  return (
    <div className="container page">
      <div className="wizard">
        <p className="eyebrow">{t("freeBadge")}</p>
        <h1 className="page-title">{t("postTitle")}</h1>
        <p className="page-intro">{t("postIntro")}</p>
        {!configured() && <ConnectionNotice />}
      </div>
      <PublishingWizard
        connected={configured()}
        initialCategory={
          q.category && isCategory(q.category) ? q.category : "housing"
        }
        existing={existing}
      />
    </div>
  );
}
