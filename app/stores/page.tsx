import { StoreCards } from "@/components/stores";
import { metadata } from "@/lib/seo";
export const generateMetadata = () =>
  metadata(
    "Browse by Store",
    "Explore clearly labeled Amazon and Walmart demo collections. No retailer partnerships or active affiliate offers are claimed.",
    "/stores",
  );
export default function Stores() {
  return (
    <div className="container page">
      <p className="eyebrow">FAMILIAR NAMES. INDEPENDENT DISCOVERY.</p>
      <h1 className="page-title">Your stores. One useful place.</h1>
      <p className="page-intro">
        Find ideas organized by retailer. These are internal demo collections,
        not official storefronts or live shopping links.
      </p>
      <h2 className="sr-only">Retailer demo collections</h2>
      <StoreCards />
      <div className="info-box">
        <strong>Independent, always.</strong>
        <p>
          OofCourse is not owned, operated, or endorsed by Amazon, Walmart, or
          any other retailer. No affiliate program enrollment is claimed. Live
          links will appear only after approval and verification.
        </p>
      </div>
    </div>
  );
}
