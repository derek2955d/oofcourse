import { Catalog } from "@/components/catalog";
import { normalizeQuery } from "@/lib/query";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/messages";
import { metadata } from "@/lib/seo";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const l = await getLocale(),
    q = normalizeQuery(await searchParams).q;
  return metadata(
    `${t(l, "search")}${q ? `: ${q}` : ""}`,
    t(l, "browseIntro"),
    "/search",
    true,
  );
}
export default async function Search({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const l = await getLocale();
  return (
    <div className="container page">
      <h1 className="page-title">{t(l, "searchResults")}</h1>
      <Catalog action="/search" query={normalizeQuery(await searchParams)} />
    </div>
  );
}
