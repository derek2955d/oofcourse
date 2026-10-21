# OofCourse

**Great Deals? Of Course!** A US English, mobile-first shopping discovery site built with Next.js App Router, TypeScript, React Server Components, and Tailwind CSS 4.

## Run in the cloud

Use Node.js 24 LTS and npm 11 (the verified environment: Node 24.19.0, npm 11.9.0).

```bash
cd /workspace/oofcourse
npm ci --cache /workspace/.npm-cache
npm run dev
```

For production: `npm run build`, then `npm run start`. Both servers bind to `0.0.0.0:3000`. No environment values or database are needed for Phase 1. The platform may provide its own authorized preview surface; this README does not imply a public deployment exists.

This cloud task is already isolated. Use the existing checkout; do not create another Git worktree unless explicitly requested.

## Features and routes

- `/`: original editorial homepage, featured demo finds, trending edit, categories, recently added, and non-collecting newsletter placeholder.
- `/deals`: all 12 demo records, category filters, keyword search, price/savings/date sorting, reset, and empty states.
- `/category/[slug]`: tech, home, outdoors, wellness; filters compose with the category.
- `/deals/[slug]`: original local illustration, demo pricing, dates, source notes, unavailable purchase state, related finds.
- `/search?q=...`: shareable, server-rendered search with case-insensitive multiword matching.
- `/about`, `/contact`, `/privacy`, `/affiliate-disclosure`: honest Phase 1 information.
- `/admin`: read-only placeholder. No login, credentials, mutation APIs, or product editing exist.
- Unknown routes return a custom 404; application errors provide retry UI.

Forms use GET so search, filtering, and sorting work without JavaScript. Only the responsive menu requires client state. Search terms are part of URLs; do not enter sensitive information.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run test:db
```

Browser tests use the environment's `/usr/bin/chromium` by default. Set `PLAYWRIGHT_EXECUTABLE_PATH` to another installed Chromium path if needed. On a machine without Chromium, run `npx playwright install chromium` and configure the path to that installed browser. Browser tests automatically start the production server if none is running, so build first. Tests cover desktop/mobile, actual search submissions, category and sort interactions, reset/empty states, product navigation, metadata, index protection, missing routes, and admin mutation rejection. Screenshots appear in ignored `test-results/`.

Database tests require Docker. They launch a disposable PostgreSQL 17 container with no network or exposed ports, create a minimal Supabase auth fixture, apply the actual migration, and test anonymous visibility, denied public writes, regular-user isolation, administrator CRUD, privilege-escalation denial, expiration, stale checks, and disabled-source hiding. They do not contact or modify Supabase.

`npm run typecheck` generates Next.js route types before running TypeScript, so it also works on a fresh checkout. `next-env.d.ts` is framework-generated and intentionally ignored.

## Architecture

```text
app/                         Server-rendered pages, metadata, error handling
components/                  Shared layout, cards, search/filter forms, mobile menu
lib/data.ts                  Typed demo data and pure filtering / link safeguards
lib/seo.ts                   Canonical and page metadata helpers
public/illustrations/        Original self-authored SVG concept artwork
supabase/migrations/         Future database schema and RLS
scripts/test-database.sh     Isolated migration / permission verification
tests/                       Data, security, browser, and database checks
```

Illustrations are original project assets; no merchant product photographs, scraped pages, third-party fonts, or paid media are used. Lucide icons are supplied under their package's ISC license. Demo concepts are not actual branded products.

## Data and affiliate safeguards

`lib/data.ts` is the current data adapter. Each record includes ID, name, slug, description, category, merchant, local image URL, nullable affiliate URL, example current/original prices, computed discount, status, created/expiration/last-check dates, and editorial flags. All displayed values are fictional and labeled. Dates are demonstration metadata, not actual merchant checks. There are no ratings, reviews, inventory claims, API connections, or live purchasing links.

`safeAffiliateUrl` only accepts explicitly active, unexpired records with HTTPS URLs on an explicit approved host list and no URL credentials. Demo and expired records cannot produce a buying link. Future active records must come from a reviewed, authorized live-data adapter; do not relabel fixture data as live. Expand merchant hosts only after source and affiliate approval. Outbound affiliate links carry `sponsored nofollow noopener noreferrer` and a nearby disclosure. This is a validation safeguard, not proof of Associates enrollment or official API approval.

## SEO and indexing

The canonical origin is `https://oofcourse.com`; DNS is unchanged. Each page has its own title, description, canonical and Open Graph data. An original social image, favicon, robots file, sitemap and truthful `WebSite` JSON-LD are included. There is no Product/Offer/Review schema for demo data.

By default `SITE_INDEXABLE` is absent or `false`, all pages are `noindex,nofollow`, and robots disallows the site. Leave it false on previews. Deal, category, search and admin routes are explicitly noindex even if the site-level flag is enabled, and demo listings are excluded from the sitemap. Before production, replace demo data, implement reviewed live-data indexing rules and update the sitemap. This flag is read at build time: rebuild after changing it. Noindex is not access control; previews are readable by anyone with access to their deployment unless hosting protection is configured.

## Supabase preparation

`.env.example` documents optional future configuration. There is no live client or database dependency in Phase 1. Never commit `.env.local`, tokens, Supabase service-role keys or server credentials. Publishable keys are only safe when RLS is correctly enforced; service-role keys must remain server-only and bypass RLS.

Apply `supabase/migrations/202610210001_initial_schema.sql` only to a new development project after reviewing it. It defines categories, products, deal sources, deal checks and admin membership, constraints, indexes and update timestamps. Products default to demo drafts. Public reads require an active, non-demo, unexpired record checked in the last 24 hours and an enabled, affiliate-approved source. Public clients cannot mutate data or inspect operational checks. Authenticated nonadmins cannot write. Privileged admin membership is provisioned through a trusted SQL/server path, never through self-service clients. Admin policies support future controlled management, but no application admin endpoints exist yet.

The migration was designed for Supabase's existing `auth.users` and `auth.uid()`; isolated PostgreSQL tests use fixtures for these. They validate the schema and RLS logic, not hosted Supabase integration or the complete auth service. Do not apply the fixture SQL in Supabase. Phase 2 must add real auth integration tests, rate limits, source validation, audit records, and a scheduled expiry/checking job. Do not store credentials or unsanitized provider responses in `deal_sources` or `deal_checks`.

## Vercel preview

Import the GitHub repository in Vercel; use Next.js defaults, Node.js 24, root directory `.`, install `npm ci`, build `npm run build`. No Supabase values are required. Keep `SITE_INDEXABLE=false`. Deploy a `.vercel.app` preview first; do not attach the production domain or modify Cloudflare DNS in Phase 1. Verify its build and the key routes after deployment. GitHub repository privacy and Vercel authorization must be verified through their official account settings; no visibility changes are performed by this project.

## Before real operations (Phase 2)

1. Establish a real operator/support/privacy contact and review public policies.
2. Create an isolated Supabase development project; apply migration and verify RLS with real auth.
3. Add secure authenticated admin management and audited source ingestion.
4. Obtain affiliate approval and legitimate merchant-data access; implement price freshness and expiry checks.
5. Replace demo content and review price/discount presentation and program rules.
6. Enable production indexing only after a content, accessibility, privacy and security review.
7. Add newsletter collection only after backend, consent, retention and unsubscribe flows exist.

No paid services, production resource changes, or Cloudflare DNS edits are part of this phase.
