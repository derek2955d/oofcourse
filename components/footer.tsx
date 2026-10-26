import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { FooterLocation } from "./footer-location";
export async function SiteFooter() {
  const t = await getTranslations();
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link className="wordmark" href="/">
            OofCourse<span>.</span>
            <i />
          </Link>
          <p>{t("footerBlurb")}</p>
          <FooterLocation />
        </div>
        <div>
          <h2>{t("footerPlatform")}</h2>
          <Link href="/housing">{t("housing")}</Link>
          <Link href="/jobs">{t("jobs")}</Link>
          <Link href="/marketplace">{t("marketplace")}</Link>
          <Link href="/services">{t("services")}</Link>
        </div>
        <div>
          <h2>{t("footerResources")}</h2>
          <Link href="/living">{t("living.nav")}</Link>
          {["help", "safety", "guidelines"].map((x) => (
            <Link href={`/${x}`} key={x}>
              {t(x)}
            </Link>
          ))}
          <Link href="/post">
            {t("navPost")}
            <ArrowUpRight size={13} />
          </Link>
        </div>
        <div>
          <h2>{t("footerCompany")}</h2>
          {["about", "contact", "terms", "privacy"].map((x) => (
            <Link href={`/${x}`} key={x}>
              {t(x)}
            </Link>
          ))}
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} OofCourse. {t("copyright")}
        </span>
        <p>{t("footerNote")}</p>
      </div>
    </footer>
  );
}
