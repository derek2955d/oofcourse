import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
export default async function NotFound() {
  const t = await getTranslations();
  return (
    <div className="container page centered">
      <p className="eyebrow">404</p>
      <h1>{t("notFoundTitle")}</h1>
      <p>{t("notFoundText")}</p>
      <Link href="/" className="button primary">
        {t("backHome")}
      </Link>
    </div>
  );
}
