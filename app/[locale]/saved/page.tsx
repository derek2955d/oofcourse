import { Catalog } from "@/components/catalog";
import { normalizeQuery } from "@/lib/query";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/messages";
import { metadata } from "@/lib/seo";
export async function generateMetadata() {
  const l = await getLocale();
  return metadata(t(l, "saved"), t(l, "savedIntro"), "/saved", true);
}
export default async function Saved({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const l = await getLocale();
  return (
    <div className="container page">
      <h1 className="page-title">{t(l, "savedTitle")}</h1>
      <p className="page-intro">{t(l, "savedIntro")}</p>
      <Catalog
        onlySaved
        action="/saved"
        query={normalizeQuery(await searchParams)}
      />
    </div>
  );
}
