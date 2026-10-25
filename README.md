# OofCourse — Your Local Life, Simplified.

A new English / Simplified Chinese local-classifieds platform for New York. This replaces the previous affiliate-shopping application after the owner explicitly cleared it. The old source is archived outside this checkout; its database migrations are **not compatible** with this project.

## Run

Node.js 24 LTS and npm 11 were used in this cloud environment.

```sh
npm ci
npm run dev
```

Open `/en` or `/zh` on port 3000. Production uses `npm run build` then `npm run start`. The npm cache is kept in the writable cloud workspace. No paid service, DNS change, external image purchase or personal computer is needed to browse this cloud implementation.

## Product and design

- Six unified categories: Housing, Jobs, Marketplace, Services, Businesses, Community; no separate student mode or social feed.
- Original blue/mint/purple/orange/coral design tokens, Inter and Noto Sans SC served locally, original neighborhood and posting illustrations.
- Responsive header, location picker, language switch, mobile bottom navigation, category-specific filter drawer, URL filters, real server-backed pagination and professional empty states.
- Shared detail layout with category facts, rental fee disclosures, structured salary ranges, private publisher contact, reports, database favorites and sharing.
- Category data is read from Supabase when configured. The seed contains real taxonomies and geographical names only, **zero housing, job, merchant, user, price or review records**.
- `/en/preview/housing` (and the other five category keys) are explicitly labeled noindex **layout previews**, not available listings. They contain no invented prices, salaries, addresses or businesses and cannot be contacted or published. Set `ENABLE_LAYOUT_PREVIEWS=false` to remove them.

## Routes

All UI routes use `/en` and `/zh`; `/` defaults to English. Switching language preserves the route/query. Publisher text remains in its original language.

- `/`, `/categories`, `/housing`, `/jobs`, `/marketplace`, `/services`, `/businesses`, `/community`, `/search`.
- `/{category}/{id}`: only publicly eligible real records; unavailable records are 404. Private drafts are accessed through the account editor.
- `/post`: four-step category → details → photos → preview/submission workflow.
- `/login`, `/signup`, `/reset-password`; confirmation callback at `/auth/confirm`.
- `/account` plus `/listings`, `/drafts`, `/pending`, `/saved`, `/messages`, `/profile`, `/business`, `/security`; `/saved` opens the saved-account view.
- `/businesses/profiles/{id}`: approved business profiles, including optional owned logo and reviewed website.
- `/admin` plus `/listings`, `/users`, `/reports`, `/categories`, `/locations`, `/businesses`, `/promotions`, `/settings`, `/audit`.
- `/about`, `/contact`, `/help`, `/terms`, `/privacy`, `/safety`, `/guidelines`.

## Supabase setup

Follow [the Chinese setup guide](docs/supabase-setup.zh.md). Use a **new independent development project** and apply every migration in filename order. Never run test fixtures or the archived shopping migrations on it.

Configure the Project URL and Publishable key using `.env.example`. `SITE_URL` sets the trusted callback origin (local development defaults to localhost; Vercel previews use their deployment origin). Allow the actual `/auth/confirm` URLs in Supabase Auth. Keep email verification enabled and configure appropriate password strength, SMTP, abuse protection and rate limits before launch. Ordinary signups create only a profile; an operator must provision `user_roles(role='admin')` through trusted SQL. No client can assign itself a role. Auth and administration use the signed-in user's session and RLS, **not a service-role key**.

Without configuration, catalogs show genuine empty states and account controls explain the missing connection. They never simulate authentication, upload, submission or moderation success. When a configured database cannot be read, queries return an error state rather than pretending the catalog is empty.

## Implemented workflows

- React Hook Form + Zod, category-specific validated fields. Partial private drafts can be saved before content is complete. Browser progress is saved separately and can be explicitly restored or cleared; valid signed-in progress also autosaves a real account draft after inactivity. Submission and autosave are serialized to avoid a late autosave reverting submitted status.
- Submissions require email verification, truthful category facts, full descriptions and structured housing/job details. They enter `pending`, never automatic approval. Owner edits remove public visibility and require resubmission/re-review. Users can archive their own listings.
- Photos: up to 8, input JPEG/PNG/WebP under 10 MB; client resize plus server-side byte validation, 40-million-pixel decode limit, orientation correction, resizing and WebP re-encoding that strips metadata. Private storage caps objects at 4 MB. Cover selection and ordering persist through a transaction-checked RPC. Deletion checks draft ownership. Public image signatures expire after five minutes; an already-issued signature may remain usable until then after unpublishing.
- Private contact conversations/messages; only participants can read them. Reports are visible to reporter and moderators, not automatically to the reported publisher. Database-backed favorites remain private to their owner.
- Free business profiles, logos, categories/areas, publisher listings and review. Paid promotion/payment tables are reserved and client writes are denied; there is no checkout or fake success flow.
- Server-verified administrator moderation (up to 25 visible records per bulk action), reasons, risk flags, user posting restrictions, report resolution, category/subcategory/location editing, posting limits/lifetimes, real summary counts/trends, audit records. Bulk operations are individually audited; an error can leave earlier decisions completed, which must be reviewed before retrying.
- Duplicate owner submissions are rejected; cross-publisher duplicates and explicit payment/contact/fairness/broker-fee language are risk flags for human review. These checks are limited heuristics, **not a legal-compliance guarantee**.
- Public RLS checks approval, publisher/category/location state and expiry on every read. A scheduled task is optional for updating stored expiry status. Auth email verification/reset notices and database in-app contact/moderation notices are implemented; extra outbound notification emails require provider configuration.

## Security and data

Migrations define profiles, roles, categories/subcategories, locations, listings, normalized housing/job detail tables, media, favorites, business profiles, conversations/messages, reports, moderation/check records, user restrictions, notifications, promotions/payments, audit logs and settings. RLS is enabled throughout. Publishing requires a verified publisher's submitted record and an audited moderation RPC; changing a URL or directly editing status cannot grant admin rights or approve a listing. Profile restriction fields, owner identities and timestamps are guarded. Category extensions are validated at both the action and database boundary before publication.

Privileged operations re-check server identity; SQL helpers use fixed search paths. Public queries use the anonymous client to avoid accidentally returning an owner's private drafts on public pages. Rendering escapes publisher content, and JSON-LD escapes script delimiters. Image MIME labels alone are not trusted by the server upload handler. Sensitive headers protect framing, content types and referrers. No credentials are committed.

Keep `SITE_INDEXABLE=false` on previews. Canonical, hreflang, Open Graph and sitemap use `https://oofcourse.com`. Only eligible real current jobs get JobPosting JSON-LD; previews, expired records and private pages do not. Indexable sitemaps include public real listings/businesses with launch-size limits; expand to paged sitemaps before exceeding 5,000 listings. Web manifest/icon provide installable-web foundations, with no offline-price or full PWA claim.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:db
npm run test:e2e
# After npm run build; isolated navigation/Auth-provider fixtures only:
npm run test:header
```

The database suite creates an isolated PostgreSQL 17 Docker container with no network/published ports. A minimal auth/storage fixture lets it execute the **real migrations and RLS**; it does not exercise hosted Supabase Auth, email delivery or Storage HTTP behavior. The container is removed on success/failure. Browser checks start the production build on port 3100, use system Chromium, run serially on shared cloud CPU, cover the seven requested widths and check bilingual navigation, filters, publishing validation, browser draft restoration, locked service states, server-action authorization, metadata, 404s, screenshots and automated axe AA checks.

## Deployment

Use the existing private GitHub repository and an isolated feature branch. Vercel defaults: Node 24, `npm ci`, `npm run build`, root `.`. Add development Supabase values to Preview only and rebuild. Do not merge to the production branch or modify Cloudflare DNS without explicit approval. Configure `SITE_URL` and Auth redirect allowlists for the actual preview domain.

Optional expiry automation: configure **server-only** `SUPABASE_SERVICE_ROLE_KEY` and a random `CRON_SECRET` of at least 32 characters. A trusted scheduler can GET `/api/cron/expire` with a Bearer secret. Missing configuration returns 503; unauthorized callers receive 401; no schedule or paid plan is activated automatically. Public expiry filtering remains effective without this job.

See [launch blockers and operational limits](docs/readiness.md). This repository is a runnable foundation with implemented real-service code, not a declaration that commercial readiness or hosted integration has been verified.

## State and local-area scope

The compact header selects a US state (50 states plus DC), remembered by a functional preference cookie. Category filters then list only enabled cities/areas in that state. A changed state clears the prior local area; locale switches preserve state and filters. The New York reference seed remains unchanged; unconfigured states show honest empty states. Apply `202610250007_state_geography.sql` to add SQL-level state filtering before adding mixed-state regions. Existing NY-only databases retain a strictly checked compatibility path. Publishing has its own explicit state → area fields so editing/restoring an existing draft preserves its real location.
