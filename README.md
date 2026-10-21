# OofCourse — independent bilingual shopping discovery

**Great Deals? Of Course!** An independent English / Simplified Chinese, multi-retailer discovery website. This upgrade uses Next.js 16 App Router, React 19, TypeScript and Tailwind CSS 4, with optional Supabase Auth and database administration.

## Start

Verified toolchain: Node.js 24 LTS, npm 11.

```bash
cd /workspace/oofcourse
npm ci --cache /workspace/.npm-cache
npm run dev
```

Production: `npm run build` then `npm run start`. The normal port is 3000. Public browsing and the local demo admin need **no credentials**. This cloud task is already isolated: use the existing checkout; do not create a Git worktree unless requested.

## Implemented experience

- Original navy/blue/green identity, double-o wordmark, SVG favicon, mobile-first design.
- Product-first homepage with global search, Featured Deals, Today’s Finds, Recently Added, Popular Categories and original buying guides. No featured retailer promotion.
- `/deals`, `/search`: real keyword/category/retailer filtering, newest/name sorting, URL state, clear filters, empty states and saved-only filtering.
- `/categories`, `/category/[slug]`: Home & Kitchen, Electronics, Toys & Kids, Baby, Beauty & Personal Care, Sports & Outdoors, Pet Supplies, Everyday Essentials, and Fashion (honest empty state).
- `/stores`, `/stores/amazon`, `/stores/walmart`: internal **demo collections**, never represented as official stores or approved affiliate offers. Future retailer card has no fake shopping link.
- `/deals/[slug]`: original illustrations, descriptions, considerations, retailer/source/status details, honest verification state, saves and related ideas.
- `/saved`: localStorage favorites across reloads, un-save, clear, filtering, empty and storage-failure states. No account needed; saves stay in this browser.
- `/guides` plus five substantive original guides: kitchens, smart homes, family shopping, small spaces, seasonal planning. No invented product tests or rankings.
- `/about`, `/contact`, `/privacy`, `/affiliate-disclosure`, `/terms`.
- `/admin`: interactive local demo workspace by default; optional authenticated database workspace when explicitly configured.

## Languages and reusable architecture

All UI routes are prefixed `/en` (default) or `/zh`; legacy paths redirect to English while preserving query strings. Navigation, search, categories, details, saves, guides, policies and administration are localized. Product names/descriptions have separate translations; merchant facts and saved IDs are shared. Language switches retain the current path and filters. No second database is created.

Locale-aware canonical, hreflang (en-US, zh-CN, x-default) and sitemap entries use `https://oofcourse.com`. A web manifest, original 192/512 icons and standalone launch metadata provide PWA foundations; there is no service worker or offline-price promise. `lib/offers.ts` defines reusable source-scoped retailer/offer authorization contracts for future clients.

## Demo integrity and sourcing

All 16 public records are original concepts, not retailer products. Prices, discounts, verification times, expiration dates, ratings, inventory and affiliate URLs are null. No fictitious commerce numbers are rendered. The two retailer labels only demonstrate organization and filtering. Every record carries an original-artwork license and its own retailer-specific demo source ID.

`public/images/family-kitchen.webp` is an original AI-generated lifestyle illustration, optimized to WebP (about 201 KB). It is not a real customer testimonial or retailer photograph. Product SVGs are self-authored original concept illustrations; no merchant photography, scraped content, paid fonts, or third-party image hotlinks are used. Lucide icons retain their package's ISC license.

`safeAffiliateUrl` rejects demo/unpublished records, absent approval, expired or stale/future verification, unsafe schemes, URL credentials and cross-retailer hosts. Only exact HTTPS hosts from the retailer registry are accepted; unknown retailers have no fallback host. Future actual links are named “View at Amazon” or “View at Walmart”, with an external indicator, `sponsored nofollow noopener noreferrer`, and nearby commission disclosure. This gate is a safeguard, not proof of affiliate enrollment. Review official program material usage, API/caching/time rules and approved hosts before enabling any live record. The public data adapter intentionally remains demo-only even if administration is connected.

## Supabase: implemented versus pending

No remote Supabase project, account, or database has been created or connected in this session. `.env.example` contains names only, never credentials.

Apply all three SQL migrations, in order, to a **new development project**:

1. `202610210001_initial_schema.sql`: categories, products, sources, checks, protected admin membership.
2. `202610210002_multi_retailer.sql`: retailers, affiliate links, explicit product lifecycle, administrator roles, source/retailer foreign keys, link-host enforcement, public-offer freshness gates, private event schema and admin audit log. Legacy active records become unverified for review.

3. `202610210003_bilingual_offers.sql`: shared bilingual product identity, generic multi-retailer offers, scoped content licensing, exact offer/link provenance and protected public visibility.

Step-by-step Chinese setup: [Supabase connection guide](docs/supabase-setup.zh.md).

Then supply `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` securely through environment settings. Create an administrator through Supabase Auth, and provision `admin_users(user_id, role='admin')` through a trusted SQL/server path. Never offer public self-registration for privileged membership. The implemented admin uses the publishable client with the user's session and RLS, **not a service-role key**.

When both values are configured, `/admin` requires Supabase Auth sign-in, calls `auth.getUser()` server-side, and verifies an explicit admin role. All save/archive server actions repeat authorization and validate input with Zod. Product, offer, category, retailer, affiliate-link and source editors support create/update; products support review statuses and archive. The lifecycle is Draft, Pending Review, Published, Unverified, Expired and Archived. Public reads require source/retailer approval, same-retailer provenance, a current approved link, a licensed non-demo product, and a check within 24 hours. RLS denies public writes and nonadmin management. Source and link tables contain no credentials. Privileged writes are audited privately.

**Hosted Auth integration has not been exercised without a real project and provisioned administrator.** Isolated PostgreSQL tests validate actual migrations and RLS against a minimal auth fixture, not the entire hosted auth service. Do not apply `tests/database/auth-fixture.sql` to Supabase. Production activation still needs session-expiry/refresh testing, rate-limiting/CAPTCHA policy for privileged login, operational alerts, backups, an explicit expiry-checking job, and program-specific price permissions. Public ingestion is deliberately not wired to the database yet.

### Local admin mode

If Supabase is absent, a clearly labeled sandbox supports create/edit/review/archive for demo products and management of categories, retailers, sources and links. It stores data under `oofcourse:admin-demo:v2`, never changes the public catalog, never authenticates a user, and never sends mutations to a server/database. “Published” in this mode is a **local demo state only**. Reset restores the original sandbox fixtures. Do not enter personal information or credentials in demo fields.

## Privacy and analytics

Favorites use `oofcourse:saved:v1`; local admin edits use `oofcourse:admin-demo:v2`. Both stay on the device. The Privacy page explains use and deletion. Normal visitors have no accounts or session cookies; future connected administrator auth uses necessary Supabase session cookies.

No analytics SDK, provider, event sink, tracking cookies, newsletter intake or marketing script is enabled. `lib/analytics.ts` defines a future consent-gated event contract; SQL prepares private page/search/product/category/save/merchant-click event storage without raw search terms, IPs, emails or stable visitor IDs. No events are currently emitted. Admin shows **Not collecting**, not fake statistics. Merchant clicks must never be treated as orders or commission; official program reports are the source of those outcomes. Any provider or Google Search Console setup requires verified ownership, privacy review and applicable notice/consent. Search terms in URLs can appear in browser history and hosting logs.

## SEO and accessibility

Canonical origin: `https://oofcourse.com`. Unique metadata, Open Graph image, sitemap, robots, semantic navigation, visible focus, skip link, accessible forms/buttons/dialog, reduced-motion handling and mobile layouts are included. `WebSite` JSON-LD is truthful; no fabricated Product/Offer/Review markup is generated.

Keep `SITE_INDEXABLE=false` on demos and previews. It defaults to noindex and disallows crawling. Deal/category/retailer collection/search/saved/admin routes remain noindex, and demo records never enter the sitemap. Editorial guides contain original content. Before production indexing, review content and update live-data indexing rules, policies and operator/support details. Index flags are build-time settings and require rebuilding. Noindex is not access control.

Automated axe WCAG 2 A/AA and 2.1 A/AA checks complement interaction and overflow tests. These checks do not establish full WCAG conformance: manual assistive-technology, zoom, real-device and usability review remains necessary.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npm run test:db
```

`typecheck` generates Next route types first, including on a clean checkout; generated `next-env.d.ts` is ignored. Browser tests launch the production server on **3100** to avoid a dev server on 3000. Chromium defaults to `/usr/bin/chromium`; override `PLAYWRIGHT_EXECUTABLE_PATH` if needed. Tests use one worker to avoid CPU contention between route sweeps and axe in this cloud environment. Tests run at **390, 768 and 1440 px**, including saved persistence, real filters, retailer collections, details, guides, local admin isolation and accessibility. Screenshots are saved in ignored `test-results/home-{en,zh}-{mobile,tablet,desktop}.png` and `admin-zh-*.png`.

Database tests require Docker, run in a disposable PostgreSQL 17 container without network/exposed ports, apply all three actual migrations, and check RLS, administrator isolation, cross-retailer rejection, exact destination hosts, stale links, program approval revocation and private audit records. The auth fixture never touches a real Supabase project.

## Deployment and permissions

Repository: `https://github.com/derek2955d/oofcourse` (private status verified through GitHub API during this upgrade). Existing production: `https://oofcourse.vercel.app/`, originally deployed from `main`.

This upgrade belongs on `feat/independent-bilingual-discovery` so the connected `main` branch does not automatically change production before approval. Vercel may create a branch preview automatically. Deployment URLs must be obtained from actual GitHub/Vercel status, never guessed. Review the preview before merging. No Cloudflare DNS changes, new production domains or paid subscriptions are authorized by this upgrade.

Use Vercel Next.js defaults, Node 24, root `.`, `npm ci`, `npm run build`, and `SITE_INDEXABLE=false`. No Supabase credentials are needed for preview. Before commercial operation, confirm hosting-plan eligibility and affiliate approvals, finish real auth/content integration and legal/support details, and perform a production readiness review.
