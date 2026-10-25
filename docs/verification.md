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
