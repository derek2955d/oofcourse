import { Information } from "@/components/information";
import { metadata } from "@/lib/seo";
export const generateMetadata = () =>
  metadata(
    "Terms of Use",
    "Terms for browsing the OofCourse independent shopping discovery demonstration.",
    "/terms",
  );
export default function Terms() {
  return (
    <Information
      eyebrow="CLEAR EXPECTATIONS · OCTOBER 21, 2026"
      title="A few things to know."
    >
      <p>
        OofCourse is an independent discovery website. By using this
        demonstration you agree to use it lawfully and understand the
        limitations described here.
      </p>
      <h2>We help you discover. Retailers handle the rest.</h2>
      <p>
        We do not sell products, accept payments, fulfill orders, provide
        product warranties, or manage returns. Future purchases will be made on
        a retailer’s website under that retailer’s terms. No purchases are
        available in this demo.
      </p>
      <h2>Demo concepts and editorial content</h2>
      <p>
        All current listings are original illustrative concepts, not available
        products or verified deals. No real price, inventory, rating, or
        promotional deadline is represented. Buying guides provide general
        editorial considerations, not individualized safety, medical, financial,
        or product certification advice. Follow manufacturer guidance and
        official safety recalls.
      </p>
      <h2>Affiliate relationships</h2>
      <p>
        We may apply to affiliate programs. No current approval or retailer
        endorsement is claimed. Any future commission relationship will be
        disclosed near the applicable link. Clicks do not imply orders or
        earnings.
      </p>
      <h2>Saved finds and local demos</h2>
      <p>
        Favorites and demo workspace edits may be stored only in your browser.
        They can be cleared or lost and do not create an account or publish
        content. Do not enter personal information or credentials in demo editor
        fields.
      </p>
      <h2>Availability and responsible use</h2>
      <p>
        Information may change and access is provided without a guarantee of
        uninterrupted service. Do not misuse the service, probe unauthorized
        resources, or republish content without appropriate permission. These
        terms do not limit rights that cannot legally be waived.
      </p>
      <h2>Before commercial launch</h2>
      <p>
        Operator identity, jurisdiction, a verified contact channel, complete
        legal terms, and hosting-plan eligibility require review before real
        affiliate operations begin. This demonstration is not an operational
        merchant or support service.
      </p>
    </Information>
  );
}
