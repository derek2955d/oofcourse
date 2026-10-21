import { GuideCards } from "@/components/guides";
import { guides } from "@/lib/guides";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/messages";
import { metadata } from "@/lib/seo";
export async function generateMetadata() {
  const l = await getLocale();
  return metadata(t(l, "guides"), t(l, "guideIntro"), "/guides");
}
export default async function Guides() {
  const l = await getLocale();
  return (
    <div className="container page">
      <h1 className="page-title">{t(l, "guides")}</h1>
      <p className="page-intro">{t(l, "guideIntro")}</p>
      <h2 className="sr-only">{t(l, "originalGuide")}</h2>
      <GuideCards items={guides} />
    </div>
  );
}
