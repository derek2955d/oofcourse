# Development verification — 2026-10-23

Environment: Node 24, Next.js 16.4.3 production server, system Chromium. Supabase is not configured in this execution environment.

- TypeScript route generation and type checking: passed.
- ESLint: passed with no warnings.
- Unit tests: 7 passed, covering bilingual taxonomy, fact-based filtering/expiry, partial vs complete submissions, review flags, safe redirects, image signatures and guarded structured data.
- Production build: passed.
- Disposable PostgreSQL 17: all six migrations applied; two workflow suites passed. Tests cover owner/administrator boundaries, audited publication, verified submission, Chinese search, media membership/order, private messages/favorites/reports, duplicates, business review and member restrictions. The fixtures are never intended for a hosted Supabase project.
- Responsive browser checks: passed at 375, 390, 430, 768, 1024, 1440 and 1920px across home, filters, detail previews, posting and restricted administration. English/Chinese desktop and mobile screenshots captured.

Browser interaction checks: all 12 desktop/mobile cases passed after targeted fixes and reruns, including real URL search/filter state, browser draft restoration, validation, unconfigured-service restrictions, isolated previews and bilingual metadata. Both desktop and mobile automated WCAG AA checks passed across six key routes each. Together with the seven responsive projects, all 21 distinct browser cases have passing results across the grouped runs.

Hosted signup/email delivery, real session refresh, Storage API upload and the two-account submit → review → contact flow remain unverified until the new development project is configured. Automated accessibility checks do not replace real-device and assistive-technology review. See readiness.md for launch blockers.

Next.js can return HTTP 200 with a noindex 404 fallback after streaming has begun; browser checks verify the actual unavailable-page fallback and noindex rather than treating the status alone as proof that a listing exists.

## Configuration regression — 2026-10-25

Malformed Supabase URLs previously threw during proxy client construction before its error handler. Configuration now validates URL syntax and keeps construction inside the guarded refresh; server clients share the same validated values. Typecheck, lint and all 8 unit tests passed. A local Next.js request with the deliberately invalid `https://…supabase.co` returned HTTP 200, the connection notice and disabled login instead of a server error. This reproduces one possible cause of the hosted screenshot; protected Vercel runtime logs remain unavailable, so it does not prove the exact hosted cause or a working hosted database connection.

## Authentication design refresh — 2026-10-25

Replaced the plain authentication card with a responsive illustrated split layout, shared by login, signup and password reset in both languages. Added accessible password visibility controls, field placeholders, linked signup policies and an explicit reason for unavailable submission. Existing authentication server actions and role checks are unchanged.

Typecheck, zero-warning lint, 8 unit tests and the final production build passed. Four browser cases passed: desktop/mobile bilingual auth layout checks (all three auth routes, no horizontal overflow, password visibility, preserved language-switch query, automated WCAG AA checks) plus desktop/mobile authentication and administration fail-closed regressions. English/Chinese screenshots were visually reviewed. Local tests use no hosted Supabase credentials; they do not claim a new live registration or email test.

## Personalized account navigation — 2026-10-25

The shared header now verifies the session on the server and displays the member's profile display name, falling back to registration metadata or the localized account label. The label links directly to the existing personal center. Desktop, mobile header tools and the mobile menu share that behavior. Only the display name reaches the client; identity and authorization still depend on server verification. Personalized navigation always reads request cookies, and session-bound database requests explicitly use no-store. Profile saves revalidate the localized layout and refresh the current view.

Typecheck, lint, 8 unit tests and production build passed during implementation. `npm run test:header` passed all six desktop/mobile browser cases, using an isolated loopback Auth/database provider fixture: verified-cookie display, account navigation, long-name layout, profile rename synchronization, logout, forged-cookie rejection, and direct password login updating the header without a manual reload. Header WCAG AA scans also passed. The fixture contains no public listing data and does not contact hosted Supabase or mutate the owner's account; a hosted end-to-end identity test is not claimed.

## Compact location and language controls — 2026-10-25

Header preferences now collapse to a location-pin icon and globe icon. The location control retains the native select, selected value, keyboard support and current-location tooltip. The language disclosure exposes ordinary locale links with the current choice marked, retains the full route/query, and closes on selection, outside pointer input or Escape (restoring trigger focus). Its label includes the current language. Search-form and category-filter location fields retain their existing text presentation.

Typecheck, lint, 8 unit tests and production build passed. Six desktop/mobile browser cases passed: compact preference interactions and open/closed WCAG AA header checks, plus existing search/locale and isolated-detail navigation regressions. Search term, sort and location survive locale changes; location changes reset pagination. Desktop/mobile screenshots were visually checked.

## State → category-local areas — 2026-10-25

The header and homepage search now choose a US state (50 states plus DC), while category filters and publishing expose detailed enabled areas belonging to that state. A functional state cookie preserves the choice across category navigation and reloads; locale changes preserve it too. Changing state clears the previous local area. Draft editing/restoration keeps the listing's own geographic location. State labels replace the fixed NYC category heading.

Migration 007 adds an invoker-rights state-scoped search RPC that filters before counting, sorting and pagination. It preserves existing tables, records and the original RPC. Before installation, the compatibility path proves enabled-area scope (including exact count checks) and fails closed for unsupported mixed-state statewide searches. Business directories are also state-scoped. No cities or public listings were invented; current reference areas remain in New York, and other states show empty states until operators add real areas.

Typecheck, zero-warning lint, 11 unit tests and production build passed. All seven migrations and three PostgreSQL fixture suites passed, including NY/CA isolation, contradictory state/area filters, empty-state queries and pagination. Eight desktop/mobile geography, compact-control, search and category-filter browser cases passed, followed by two publishing/draft-restoration regressions. Compact header accessibility scans passed and desktop/mobile captures were reviewed. Hosted migration execution still requires the project owner's SQL Editor; no hosted completion is inferred from local tests.

## New York-only rollout — 2026-10-25

Consumer state choices now come from one availability list (`enabledStateCodes = ['NY']`). Header, homepage search and publishing expose only New York; the full geographic reference and state-aware database capability remain intact for future expansion. Server-side selection and saved preferences resolve closed states to NY, and the proxy redirects older closed-state URLs to NY while clearing stale area/page filters. No SQL or data modification is required for this rollout.

Typecheck, lint, 12 unit tests, production build and four desktop/mobile browser cases passed. Checks cover the single NY option in header/home/publishing, old CA/TX links and CA preference normalization, retained Queens filtering, language/query preservation and compact-control accessibility.

## Homepage visual redesign — 2026-10-26

Recomposed the existing bilingual homepage with a brand-led split hero, original neighborhood illustration and functional category links, a dedicated search panel, rental/part-time/free-item/moving shortcuts, six colored category cards, responsive housing/jobs/marketplace/local-service sections, help/safety links and a posting call to action. Mobile prioritizes search and categories; desktop retains the illustration and two hero actions. Existing state scope, real-data queries, honest empty states, authentication and moderation remain in use. Styles are scoped to the homepage in `app/home.css`; no database migration, paid service, production merge or DNS change was made.

Typecheck, lint, 14 unit tests and the final production build passed. An initial broader browser run passed six responsive scenarios (375–1440px) and the desktop/mobile hero-search flows; the 1920px scenario timed out, and that run was stopped rather than reported as passing. A subsequent focused Playwright review against the final production build passed both locales at 375/390/430/768/1024/1440/1920px, four desktop/mobile WCAG AA scans, and desktop/mobile search/locale, structured rental/part-time filters, free-item and safety-guide navigation checks. The scans identified low-contrast step numbers during implementation; those were corrected before the final successful review.

Final local screenshots (English/Chinese, desktop/mobile, full-page and first viewport) are stored outside the repository under `/workspace/oofcourse-review-screenshots/home-redesign/`. They deliberately show empty states because this execution environment has no hosted Supabase configuration. These checks do not claim a real hosted account or listing-publication test. The focused review log is `/tmp/oofcourse-home-review.log` and the final build log is `/tmp/oofcourse-home-design-build-final.log`.

## New York life guides and activity discovery — 2026-10-26

Added a prominent homepage section, `/[locale]/living`, three original bilingual guide routes, official-calendar links, footer/mobile navigation entries and sitemap/hreflang/canonical coverage. The guides cover rental viewings, secondhand pickup/payment checks and using libraries to find local programs. They are source-controlled editorial content, separate from member listings. No individual third-party event, price, booking availability, popularity or attendance was invented. Official calendars are clearly labeled outbound resources; access restrictions encountered during reference checks are recorded in `docs/local-life-content.zh.md`.

Upcoming community activities reuse existing published listings and RLS. The query applies category/subcategory, publication expiry, enabled NY areas, New York's current date and ordering before its three-record limit; invalid or absent dates are rejected. Empty and failed queries retain useful official calendar links. No new migration or hosted database write was needed.

Typecheck, lint, 16 unit tests and production build passed. All seven existing migrations and four disposable PostgreSQL suites passed, including the new activity visibility/date/scope/order case. Six browser cases passed: desktop/mobile responsive regressions, bilingual guide navigation and all three article routes/metadata, same-article language switching, external-link safety, sitemap/unknown-slug behavior, and automated WCAG AA scans of the new hub/articles plus existing page regressions. An initial accessible-name mismatch on calendar links was fixed before the final successful run. Positive hosted activity rendering and real organizer availability are not claimed; the cloud has no Supabase configuration.

Final logs: `/tmp/oofcourse-living-build-final.log`, `/tmp/oofcourse-living-db.log`, `/tmp/oofcourse-living-browser-final.log`. Screenshots are saved outside the repository at `/workspace/oofcourse-review-screenshots/living-update/`.

## Activity-first homepage simplification — 2026-10-26

Following the owner's preference for fewer homepage sections, replaced the large hero, six listing feeds, guide-card grid, business directory and promotional/help sections with a compact introduction and an activities/calendar main column. Six existing classifieds categories are kept in a small desktop sidebar, placed after the activities on mobile. A native disclosure retains real classifieds search; life guides, safety resources and community posting remain secondary links. Original category pages, guide routes, user features and activity visibility rules are preserved. Removed the unused prior homepage stylesheet/component and stopped requesting six listing feeds on the homepage.

Typecheck, lint, 16 unit tests and production build passed. Eight browser cases passed: desktop/mobile layouts, disclosure search/category selection and locale retention, all bilingual guide/calendar routes through the sidebar entry, metadata/sitemap/unknown-slug regression and automated WCAG AA checks. Desktop/mobile screenshots were visually inspected and saved to `/workspace/oofcourse-review-screenshots/activity-home/`. Logs: `/tmp/oofcourse-event-home-build.log` and `/tmp/oofcourse-event-home-browser.log`. No database schema, production DNS or paid service changed.

## First source-checked editorial activity — 2026-10-26

Published the independently written Bryant Park Winter Village opening summary through the existing source-controlled editorial deployment channel, separate from authenticated member listings. The homepage card links to bilingual `/activities/bryant-park-winter-village-opening-2026` detail routes with an editorial label, source/check date and an official details/reservations link. No organizer photos, posters, long-form text, rental price table, ticket availability or fictional publisher was copied/created. The opening day is October 28, 2026 at noon New York time; rink-season dates are explicitly separate from the broader event. The card expires after opening day, archived details become noindex, and request-generated sitemap entries exclude expired openings.

Typecheck, lint, 17 unit tests and production build passed. Six desktop/mobile browser cases passed, covering responsive regressions, the actual editorial card/detail/source link, language switching on the same activity, truthful fee/scope copy, unknown-slug and metadata handling, and automated WCAG AA checks. Screenshots are saved outside the repository at `/workspace/oofcourse-review-screenshots/first-activity/`; logs are `/tmp/oofcourse-first-activity-build.log` and `/tmp/oofcourse-first-activity-browser.log`.

No hosted database write or privileged API was used. This entry is managed in `lib/editorial-activities.ts`, not the Supabase member-listing admin UI; source changes require a repository deployment. Production DNS/main were not changed. Rights/source observations remain in the activity draft and content-maintenance documentation; no blanket republication authorization is claimed.

### Community activity entry connection — 2026-10-26

- Community landing and its events subcategory now include the same source-controlled editorial activity cards and four official calendar directories as the homepage. Member submissions remain in the existing searchable listing area; editorial records are not inserted into Supabase.
- Keyword, local-area, other-subcategory and paginated results omit the editorial/calendar block so these resources do not appear to match unrelated filters.
- Typecheck, lint, all 17 unit tests and production build passed. Focused bilingual desktop/mobile browser coverage verifies both entry URLs, calendar links, editorial card counts, preserved search and no horizontal overflow.
- Hosted Supabase writes/auth are not exercised by this local check. Production domain unchanged.

### Unified community hub — 2026-10-26

- Supersedes the conditional editorial resource display above: community now keeps editorial activities and official calendars visible together with member posts, including during keyword searches.
- Removed the community filter sidebar, mobile filter drawer and quick-area links. Community listing queries ignore legacy location and subcategory parameters; keyword searches and pagination remain functional. Search forms do not carry those obsolete filters forward. NY state scope and publisher venue facts remain intact.
- Housing, jobs and other category filters are unchanged. Community results are explicitly titled Community posts / 社区发布 so editorial resources are not counted as keyword matches.
- Typecheck, lint, 17 unit tests and production build passed. Desktop/mobile browser checks cover bilingual community entry points and absence of area controls, with other-category filtering regression coverage. Hosted database identity/write flows remain untested locally without credentials.

### Marketplace filter simplification — 2026-10-26

- Removed condition and free-only browse controls from desktop and mobile marketplace filters. Existing condition/free URL parameters are ignored by marketplace browsing and omitted from keyword-search submissions; price and other remaining filters stay available. Publishing fields and stored listing facts are unchanged.
- Typecheck, lint, all 17 unit tests, production build and both desktop/mobile category-filter browser checks passed. Browser coverage checks removed controls and legacy query state while retaining min/max price inputs; housing and jobs filtering regression checks also pass.
- No database migration or production-domain change.

### Jobs filter simplification — 2026-10-26

- Jobs browse filters now contain keyword, local area and employment type (Any / Full-time / Part-time). Removed subcategory, industry, workplace, pay-period controls and the explanatory hint from desktop/mobile filters. Publisher job fields and salary facts remain unchanged.
- Jobs browsing ignores old removed-filter parameters and unsupported employment choices. Keyword submission drops those legacy parameters; full-time and part-time use the existing real employment query field.
- Typecheck, lint, 17 unit tests, production build and desktop/mobile category-filter browser checks passed, including selecting full-time and submitting it, verifying only three employment options, and retaining housing/marketplace filtering checks. Hosted DB/auth flows were not retested without credentials.
