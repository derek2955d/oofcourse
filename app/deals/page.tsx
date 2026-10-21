import { Catalog } from "@/components/catalog";
import { normalizeQuery } from "@/lib/query";
import { metadata } from "@/lib/seo";
export const generateMetadata = () =>
  metadata(
    "All Deals",
    "Explore all OofCourse demo finds. Search, filter by category, and sort illustrative offers.",
    "/deals",
    true,
  );
export default async function Deals({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="container page">
      <p className="eyebrow">THE GOOD-FINDS DIRECTORY</p>
      <h1 className="page-title">Find your next favorite.</h1>
      <p className="page-intro">
        Everyday things, thoughtfully selected. Explore our demo collection —
        all prices and savings are examples, with no live offers.
      </p>
      <Catalog query={normalizeQuery(await searchParams)} />
    </div>
  );
}
