# OofCourse V2 execution

The old shopping project was explicitly cleared by the owner; its source remains archived outside this checkout. This branch builds a new local-classifieds application, not an affiliate storefront. Do not apply the old shopping database migrations to the new application.

1. Foundation: current compatible Next.js/React, TypeScript, Tailwind, next-intl, original design tokens and six-category schemas. Check types/lint before progressing.
2. Visual experience: responsive bilingual home, six category catalogs with URL filters/pagination, shared category-specific detail layouts, honest empty states, explicit layout-preview routes. Inspect all seven requested viewport widths.
3. Core: Supabase-backed authentication, owner-controlled drafts/submission/media/favorites/account, validated server actions. Missing configuration must fail explicitly, never simulate authentication or published content.
4. Administration: server-verified moderation, reports, member restrictions, audited operations. No unauthenticated management or client role assignment.
5. Business: free business profiles and listings; disabled-by-policy paid promotion/payment schemas, no payment success simulation; expiry workflow.
6. Readiness: RLS/database tests, browser interaction/accessibility/SEO checks, documentation and deployment preparation. Report any hosted-service flows that cannot be exercised without credentials.

Public browsing uses real approved, nonexpired database records or professional empty states. Layout previews are separately labeled, noindex, contain no fabricated business, housing or salary claims, and cannot be published.
