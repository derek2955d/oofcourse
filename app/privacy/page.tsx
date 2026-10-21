import { Information } from "@/components/information";
import { metadata } from "@/lib/seo";
export const generateMetadata = () =>
  metadata(
    "Privacy Policy",
    "Learn what the OofCourse demo collects, what remains disconnected, and how future privacy practices will be reviewed.",
    "/privacy",
  );
export default function Privacy() {
  return (
    <Information
      eyebrow="TRANSPARENCY FIRST · UPDATED OCTOBER 21, 2026"
      title="Your privacy matters."
    >
      <p>
        This policy describes the current Phase 1 OofCourse demonstration. It
        must be reviewed and updated before live data collection, affiliate
        tracking, or accounts are enabled.
      </p>
      <h2>Information in this demo</h2>
      <p>
        We do not offer accounts, checkout, email subscriptions, or contact
        submission forms. We do not intentionally collect names, emails, or
        payment information. Newsletter and contact sections are non-collecting
        placeholders.
      </p>
      <h2>Technical information</h2>
      <p>
        Your hosting provider may process IP addresses, request URLs, browser
        information, and access logs to serve pages, maintain security, and
        diagnose errors. Search terms are included in page URLs and can appear
        in browser history or hosting logs. Do not put personal or sensitive
        information into search.
      </p>
      <h2>Cookies and analytics</h2>
      <p>
        The application does not add analytics, advertising scripts, marketing
        cookies, or browser storage. Hosting infrastructure may use necessary
        technical mechanisms. Any future analytics, cookie consent, or affiliate
        tracking configuration will require a separate review.
      </p>
      <h2>Third parties and links</h2>
      <p>
        All product illustrations are hosted locally. No live affiliate
        purchasing links, Amazon API integration, or Supabase database
        connections are active. Future third-party destinations will have their
        own privacy policies.
      </p>
      <h2>Retention and privacy requests</h2>
      <p>
        No application database of visitor profiles exists in this phase.
        Infrastructure log retention depends on the deployed hosting
        configuration and must be documented before launch. A verified privacy
        contact channel is not yet configured; it will be published on the
        Contact page before the site starts collecting submissions.
      </p>
      <h2>Children and changes</h2>
      <p>
        OofCourse is intended for general adult shopping discovery and is not
        directed to children under 13. This policy will be updated as the
        service changes. The full policy, responsible operator details, and
        applicable consumer privacy rights must be reviewed before production
        operation.
      </p>
    </Information>
  );
}
