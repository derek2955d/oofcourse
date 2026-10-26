# OofCourse local-classifieds development

This is the new bilingual New York classifieds project. The old affiliate-shopping source is archived outside this checkout. Do not restore old product data or apply old shopping migrations.

- Read the relevant bundled Next.js documentation in node_modules/next/dist/docs before changing framework routing, metadata or request handling; this version has newer APIs.
- Use the existing checkout. Preserve the six unified categories, next-intl routes and shared design tokens. Publisher content remains in its original language.
- Keep the homepage activity-first: community activities and official calendars lead. Housing, jobs, marketplace and other essentials belong in a compact desktop sidebar / secondary mobile section; guides remain behind an optional link. Do not restore large classifieds feeds, guide-card grids or promotional sections on the homepage without a new owner request.
- Never seed fake public homes, jobs, merchants, prices, users or reviews. No-credential browsing uses empty states; isolated layout previews are labeled and noindex.
- Privileged writes must re-check server identity and satisfy RLS. Never assign administrator roles through client metadata or simulate hosted authentication/payment success.
- New production providers, DNS changes, purchases and production merges require the owner's explicit authorization. Feature-branch preview builds and reversible development are within the existing project scope.
- Run typecheck, lint, unit tests and a production build. Use isolated database fixtures only in the disposable test database, never on Supabase. Report hosted flows that remain untested without credentials.
- Community is a unified statewide hub: show editorial activities, official calendars and community posts together. Do not restore area or subcategory filtering on this page without an owner request; keep precise local-area filtering for housing, jobs and other classified categories.
- Enabled consumer states are NY and NJ. Browse choices use NYC's five boroughs and the five near-Manhattan NJ municipalities in geography.ts; keep their actual NJ state identity and require real enabled database location records. Do not label NJ places as part of New York.
