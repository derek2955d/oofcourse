import { StoreCards } from "@/components/stores";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/messages";
import { metadata } from "@/lib/seo";
export async function generateMetadata() {
  const l = await getLocale();
  return metadata(t(l, "stores"), t(l, "storeIntro"), "/stores", true);
}
export default async function Stores() {
  const l = await getLocale();
  return (
    <div className="container page">
      <h1 className="page-title">{t(l, "stores")}</h1>
      <p className="page-intro">{t(l, "storeIntro")}</p>
      <StoreCards />
      <p className="page-intro">{t(l, "futureStores")}</p>
    </div>
  );
}
