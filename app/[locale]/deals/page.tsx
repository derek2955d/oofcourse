import { Catalog } from "@/components/catalog";
import { normalizeQuery } from "@/lib/query";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/messages";
import { metadata } from "@/lib/seo";
export async function generateMetadata() {
  const l = await getLocale();
  return metadata(t(l, "allFinds"), t(l, "browseIntro"), "/deals", true);
}
export default async function Deals({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const l = await getLocale();
  return (
    <div className="container page">
      <h1 className="page-title">{t(l, "browse")}</h1>
      <p className="page-intro">{t(l, "browseIntro")}</p>
      <Catalog query={normalizeQuery(await searchParams)} />
    </div>
  );
}
