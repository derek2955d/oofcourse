import { Information } from "@/components/information";
import { metadata } from "@/lib/seo";
export const generateMetadata = () =>
  metadata(
    "Privacy Policy",
    "Learn how OofCourse uses local browser storage for favorites and its demo workspace, and which services are not connected.",
    "/privacy",
  );
export default function Privacy() {
  return (
    <Information
      eyebrow="TRANSPARENCY FIRST · UPDATED OCTOBER 21, 2026"
      title="Your privacy matters."
    >
      <p>
        This policy describes the current OofCourse demonstration. It must be
        reviewed before live affiliate operations, analytics, or public
        submission collection begin.
      </p>
      <h2>Saved finds and browser storage</h2>
      <p>
        When you save a find, its demo product ID is stored on your device under{" "}
        <code>oofcourse:saved:v1</code>. The local admin sandbox stores your
        demo edits under <code>oofcourse:admin-demo:v2</code>. These records are
        not sent to a database or analytics provider. Clear saved finds on the
        Saved page, reset the demo workspace on Admin, or clear your browser’s
        site data to remove them. Storage may be unavailable in private
        browsing, and it does not synchronize across devices. Do not enter
        credentials or personal information into demo editor fields.
      </p>
      <h2>Accounts and administration</h2>
      <p>
        Visitors do not need an account. Supabase is not connected by default.
        If the site operator configures Supabase later, administrator sign-in
        uses Supabase Auth and necessary session cookies, with server
        authorization and Row Level Security. Administrator credentials are sent
        only to the configured authentication service, never stored in local
        demo records. Operator access, retention, and processing terms must be
        reviewed before enabling a hosted database.
      </p>
      <h2>Information we are not collecting</h2>
      <p>
        No newsletter signup, contact submission, checkout, marketing cookies,
        third-party analytics, advertising scripts, or user profiling is
        enabled. A typed analytics contract and private database schema prepare
        for future integration; they do not collect events. Merchant clicks are
        not purchases, and no orders or commissions are inferred.
      </p>
      <h2>Hosting and URLs</h2>
      <p>
        Hosting infrastructure may process IP addresses, browser details,
        request paths, timestamps, and access logs to deliver pages and protect
        the service. Search keywords and filter choices appear in URLs and can
        be stored in browser history or hosting logs. Do not include sensitive
        information in search. Infrastructure log retention depends on the
        hosting configuration and requires review before real operations.
      </p>
      <h2>Images and external services</h2>
      <p>
        Images are hosted locally. The family lifestyle image is originally
        AI-generated; product illustrations are original concept artwork, not
        merchant content. No live Amazon or Walmart product-data API, affiliate
        ordering system, or visitor analytics provider is connected. Future
        external destinations will apply their own privacy policies.
      </p>
      <h2>Privacy requests and children</h2>
      <p>
        A verified support and privacy contact is not yet configured and will be
        published on Contact before collection of submissions. OofCourse is
        intended for adult shopping decisions, not directed to children under
        13. No children’s accounts or profiles are offered. Operator details,
        applicable consumer privacy rights, retention rules, and any consent
        requirements must be finalized before commercial launch.
      </p>
    </Information>
  );
}
