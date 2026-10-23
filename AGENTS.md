# OofCourse local-classifieds development

This is the new bilingual New York classifieds project. The old affiliate-shopping source is archived outside this checkout. Do not restore old product data or apply old shopping migrations.

- Read the relevant bundled Next.js documentation in node_modules/next/dist/docs before changing framework routing, metadata or request handling; this version has newer APIs.
- Use the existing checkout. Preserve the six unified categories, next-intl routes and shared design tokens. Publisher content remains in its original language.
- Never seed fake public homes, jobs, merchants, prices, users or reviews. No-credential browsing uses empty states; isolated layout previews are labeled and noindex.
- Privileged writes must re-check server identity and satisfy RLS. Never assign administrator roles through client metadata or simulate hosted authentication/payment success.
- New production providers, DNS changes, purchases and production merges require the owner's explicit authorization. Feature-branch preview builds and reversible development are within the existing project scope.
- Run typecheck, lint, unit tests and a production build. Use isolated database fixtures only in the disposable test database, never on Supabase. Report hosted flows that remain untested without credentials.
