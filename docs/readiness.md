# Launch blockers and remaining operational work

## External integration still required

- Configure an independent Supabase development project, apply all seven migrations, provision a verified administrator, and safely inject the public URL/key. Hosted signup, email verification, password reset, cookie refresh, private Storage uploads and the entire two-account submit → review → publish → contact cycle must be tested against that project. Local PostgreSQL fixtures do not prove these provider-specific flows.
- Configure authenticated SMTP, appropriate Auth rate limits/password rules and anti-bot protection. Optional Google OAuth has not been activated.
- Set correct callback origins/allowlists in each environment. Preview Vercel access may require the project owner's login.

## Before public commercial use

- Complete verified operator identity, support email, legal address, privacy retention/deletion procedures and privacy-rights handling. Policies are clearly marked review drafts and need appropriate professional review, especially New York housing fees/FARE Act, fair housing and salary transparency.
- Define moderation coverage, escalation/appeal procedures, prohibited-content rules, retention and operational incident response. Heuristic flags cannot ensure that all fraud or unlawful advertising is caught.
- Exercise accessibility with assistive technology and real devices; automated axe checks are not certification. Measure production Core Web Vitals with the actual database region and real authorized images.
- Review CSP against actual production asset/auth hosts; set monitoring, alerts, backup/restore and storage quota/orphan-cleanup policies. Enable optional expiry scheduling only after secrets and ownership are verified.
- Formal account deletion/export and operator support workflows require operational completion. Archives are implemented; they are not presented as permanent account erasure.

## Launch-size limits

- Category catalogs have true SQL-backed counting and pagination, 12 records/page (up to page 1,000); broad public searches are not a client-side demo array.
- Owner management currently loads the latest 100 records/favorites, 50 conversations and 500 messages; admin worklists load 25 listings, 50 members/reports/businesses and 100 audit entries per filtered view. Add paginated drill-downs before sustained high-volume operation; do not describe these views as a complete data export.
- The public business-profile directory displays a small latest subset; listing-category filters remain separate from the free business-profile directory.
- Sitemaps cap listing URLs at 5,000 and businesses at 1,000; add paginated sitemap generation as volume grows.
- Image signatures are short-lived and should be refreshed for long editor sessions. Storage cleanup and strict cross-request byte quotas need ongoing operational monitoring.

## Deliberately disabled commercial features

Stripe, purchases, paid promotion activation, ad networks and affiliate marketing are not active. Payment/order/event structures are reserved with no client write permission. Any future implementation needs verified server orders, signed/idempotent webhooks, appropriate disclosures and actual payment-provider testing before activation.

Administrator member controls currently restrict posting/contact and hide the member's public content; they do not claim to delete or ban the Supabase Auth identity. A full identity ban, session revocation and verified account-erasure workflow require a separately reviewed server-only Auth administration integration before enabling those controls.

Geography: the header offers 50 US states plus DC. Detailed areas come only from enabled database records; the launch seed still contains New York City areas. Operators must add factual city/borough/neighborhood records for other states. Apply migration 007 for mixed-state statewide search. Taxonomy and directory area lists currently need pagination beyond 1,000 enabled records in a request scope; compatibility checks fail closed when the registry is truncated.
