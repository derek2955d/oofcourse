import { Information } from "@/components/information";
import { metadata } from "@/lib/seo";
export const generateMetadata = () =>
  metadata(
    "Affiliate Disclosure",
    "Understand OofCourse’s planned affiliate relationships, demo pricing, and independent status.",
    "/affiliate-disclosure",
  );
export default function Disclosure() {
  return (
    <Information
      eyebrow="NO FINE-PRINT SURPRISES"
      title="A clear word on affiliate links."
    >
      <div className="info-box">
        <strong>This entire collection is demo data.</strong>
        <p>
          Product names, prices, discounts, dates, and availability are
          illustrative examples. No live Amazon pricing, inventory, ratings, or
          reviews are displayed. No buying links are active.
        </p>
      </div>
      <h2>How affiliate links will work</h2>
      <p>
        Once approved and configured, OofCourse may earn a commission when you
        make a qualifying purchase after following a labeled affiliate link. Any
        commission arrangement will be disclosed near the relevant link. Final
        pricing, availability, shipping, and terms are determined by the
        merchant at checkout.
      </p>
      <h2>Amazon Associates statement</h2>
      <p>As an Amazon Associate I earn from qualifying purchases.</p>
      <p>
        This statement is reserved for future qualifying affiliate links. It
        does not claim current enrollment or an active integration. Amazon
        Associates approval and compliant product-data access must be confirmed
        before those links are enabled.
      </p>
      <h2>Independent, always</h2>
      <p>
        OofCourse is independently operated. It is not owned, operated,
        sponsored, or endorsed by Amazon. Amazon and its marks belong to their
        respective owners. We do not scrape Amazon product pages.
      </p>
      <h2>Honest information</h2>
      <p>
        We do not fabricate customer reviews or present example discounts as
        real offers. Future live offers must include their source and last-check
        status. Expired or unverified offers must not be presented as available
        purchases.
      </p>
    </Information>
  );
}
