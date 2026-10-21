import { Catalog } from "@/components/catalog";
import { normalizeQuery } from "@/lib/query";
import { metadata } from "@/lib/seo";
export const generateMetadata = () =>
  metadata(
    "Your Saved Finds",
    "Keep your favorite demo finds in this browser. No account needed.",
    "/saved",
    true,
  );
export default async function Saved({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="container page">
      <p className="eyebrow">A LITTLE COLLECTION OF YOU</p>
      <h1 className="page-title">The ones you love.</h1>
      <p className="page-intro">
        Your saved finds stay on this device, in this browser. No account,
        email, or cross-device tracking.
      </p>
      <Catalog
        onlySaved
        action="/saved"
        query={normalizeQuery(await searchParams)}
      />
    </div>
  );
}
