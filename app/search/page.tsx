import { Catalog, normalizeQuery } from "@/components/catalog";
import { metadata } from "@/lib/seo";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { q } = normalizeQuery(await searchParams);
  return metadata(
    q ? `Search: ${q}` : "Search Finds",
    "Search the OofCourse demonstration collection by product or category.",
    "/search",
    true,
  );
}
export default async function Search({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = normalizeQuery(await searchParams);
  return (
    <div className="container page">
      <p className="eyebrow">A GOOD PLACE TO START</p>
      <h1 className="page-title">Let’s find your kind of good.</h1>
      <p className="page-intro">
        Search our illustrative collection. No live merchant pricing or
        inventory is connected.
      </p>
      <Catalog query={query} action="/search" />
    </div>
  );
}
