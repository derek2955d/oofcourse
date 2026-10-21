import { Information } from "@/components/information";
import { metadata } from "@/lib/seo";
export const generateMetadata = () =>
  metadata(
    "Affiliate Disclosure",
    "Understand the OofCourse demo, planned affiliate relationships, separate retailer sources, and independent status.",
    "/affiliate-disclosure",
  );
export default function Disclosure() {
  return (
    <Information
      eyebrow="CLEAR INFORMATION. THOUGHTFUL CHOICES."
      title="Independent, by design."
    >
      <div className="info-box">
        <strong>You are browsing demo concepts.</strong>
        <p>
          No live prices, discounts, stock levels, ratings, review counts,
          promotion deadlines, or buying links are connected. Retailer labels
          organize example records; they do not identify actual retailer offers
          or claim a partnership.
        </p>
      </div>
      <h2>Future affiliate links</h2>
      <p>
        OofCourse may apply to Amazon Associates, the Walmart Affiliate Program,
        and other programs. We do not claim current enrollment or approval. Once
        authorized and configured, we may earn a commission on qualifying
        purchases through clearly labeled links. Disclosure will appear near the
        relevant recommendation and link.
      </p>
      <h2>Amazon statement reserved for approved participation</h2>
      <p>“As an Amazon Associate I earn from qualifying purchases.”</p>
      <p>
        This exact statement is reserved here for future approved Amazon
        Associates participation; it is not a claim of current membership. No
        Amazon API is connected. Merchant product-data permissions, cache
        periods, required timestamps, pricing displays, and other program rules
        must be checked before publishing authorized content.
      </p>
      <h2>Separate sources for separate retailers</h2>
      <p>
        Amazon and Walmart data, licenses, and affiliate links must be managed
        independently. Content authorized by one retailer must not be used to
        divert shoppers to another. The prepared database links each source,
        product, and affiliate URL to the same retailer. No scraping or invented
        offers are used.
      </p>
      <h2>Where a future purchase happens</h2>
      <p>
        All purchases will occur on the retailer’s official website. The
        retailer determines final pricing, availability, shipping, payments,
        warranties, and returns. OofCourse does not sell products or provide
        merchant customer service. Outbound links will clearly name the
        destination and identify when you leave OofCourse.
      </p>
      <h2>No implied endorsement</h2>
      <p>
        OofCourse is not owned, operated, sponsored, or endorsed by Amazon,
        Walmart, Target, Best Buy, or any other retailer. Their names and marks
        belong to their owners. Retailer names here are plain-text references,
        not official store badges.
      </p>
      <h2>Clicks are not commissions</h2>
      <p>
        Any future click analytics will measure navigation only. Orders and
        commission amounts must come from each affiliate program’s official
        reporting. We do not manufacture testimonials, ratings, verified-deal
        labels, or shopping outcomes.
      </p>
    </Information>
  );
}
