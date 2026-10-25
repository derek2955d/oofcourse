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
