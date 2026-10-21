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
        Useful ideas for the whole family. Explore clearly labeled demo concepts
        organized by category and retailer, without live prices or buying links.
      </p>
      <Catalog query={normalizeQuery(await searchParams)} />
    </div>
  );
}
