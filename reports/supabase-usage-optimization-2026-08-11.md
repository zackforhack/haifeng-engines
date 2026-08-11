# Supabase Usage Optimization Review

Date: 2026-08-11

## Scope

The Supabase dashboard usage tab was open in Chrome, but the dashboard client timed out during automated read attempts. This review therefore combines:

- Live Supabase row/link counts from the catalog tables.
- Code-path inspection of the Next.js app.
- A low-risk implementation pass to reduce avoidable read payload.

## Live Data Volume

Measured from the live Supabase catalog:

| Metric | Value |
| --- | ---: |
| Engines | 3,388 |
| Alternators | 149 |
| Engine PDF links | 3,913 |
| Unique PDF storage objects referenced | 1,381 |
| Duplicate PDF links to shared files | 2,532 |
| Estimated unique PDF storage from metadata | 1.6 GB |
| Full engine catalog with nested PDF metadata | 5.24 MB JSON |
| Lightweight engine index | 0.44 MB JSON |
| Full-vs-lightweight payload ratio | 12x |

## Implemented Optimization

Added lightweight Supabase read functions in `lib/engines.ts`:

- `getAllEngineSlugs()`
- `getEngineSitemapEntries()`
- `getBrandCounts()`

Rewired these routes to stop pulling full engine rows plus nested PDF metadata when they only need slugs, timestamps, status, or counts:

- `app/engines/[slug]/page.tsx` static params
- `app/engines/sitemap.ts`
- `app/sitemap.ts`
- `app/brands/page.tsx`

Expected impact:

- Reduces repeated build/runtime sitemap and static-param reads from about 5.24 MB payloads to about 0.44 MB or smaller.
- Keeps detail pages unchanged, so user-facing engine pages still load full specs and PDF links.
- Avoids changing SEO URL coverage.

## Continued Optimization Pass

Additional changes applied:

- Replaced per-request dynamic rendering on low-volatility routes with revalidation windows:
  - `/` now revalidates hourly.
  - `/sitemap.xml`, `/engines/sitemap.xml`, and `/brands/sitemap.xml` revalidate hourly.
  - `/alternators/sitemap.xml`, `/engines/compare/sitemap.xml`, and `/guides/sitemap.xml` revalidate daily.
- Added a comparison-specific catalog query used by comparison pages and the comparison sitemap.
- Narrowed hub/facet and brand-page engine queries to display fields plus `engine_pdfs(id)` instead of full PDF records.
- Reworked homepage stats to use an exact head count plus the existing aggregate `engine_filter_options()` path instead of scanning all engine rows for brand/origin counts.
- Added DB-side prefilters for hub/facet pages while keeping the existing in-memory post-filters as a correctness backstop:
  - fuel pages prefilter by `fuel_type`.
  - power pages prefilter across populated kWe/kW rating fields.
  - emissions pages prefilter by broad emissions tokens, then normalize in memory.
  - frequency pages now prefilter against both kWe and kW rating columns.

Measured query-shape impact:

| Query shape | Payload |
| --- | ---: |
| Full engine catalog with full PDF join | 5.24 MB |
| Comparison catalog | 1.92 MB |
| Slug-only static params | 0.10 MB |
| Sitemap entries | 0.31 MB |
| Hub catalog with PDF IDs only | 4.08 MB |

The comparison catalog is now about 2.7x smaller than the old full-catalog path. Static params and sitemaps now avoid the full catalog entirely, and crawler hits should mostly land on cached sitemap responses rather than direct Supabase reads.

Homepage stats now avoid the old paginated `brand, origin` table scan when the aggregate RPC is available; the fallback still exists through `getFilterOptions()` for local/dev databases without the migration.

Hub prefilter regression check:

| Hub case | Full-scan baseline | Optimized result | Missing |
| --- | ---: | ---: | ---: |
| Fuel: gas | 443 | 443 | 0 |
| Fuel: diesel | 2,942 | 2,942 | 0 |
| Power: 100-500 kWe | 1,110 | 1,110 | 0 |
| Power: 2,000+ kWe | 261 | 261 | 0 |
| Emissions: EPA Final Tier 4 | 262 | 262 | 0 |
| Emissions: Euro Stage V | 200 | 200 | 0 |

## Main Usage Drivers

1. Sitemap crawler traffic

`app/sitemap.ts` and `app/engines/sitemap.ts` used to be `force-dynamic`, so bots could cause live Supabase reads on every hit. They now use lighter selects and hourly revalidation. The comparison, alternator, and guide sitemaps use daily revalidation.

2. Static generation

`generateStaticParams()` previously called `getAllEngines()`, which joined `engine_pdfs`. It now fetches only slugs.

3. PDF storage and egress

PDF storage is around 1.6 GB by metadata. Shared brochure/catalog PDFs are linked to many engines, which is good for storage dedupe, but any crawl/user download still egresses from Supabase Storage through the `/specsheets/*` rewrite.

4. Full-catalog helper reuse

`getAllEngines()` remains useful for pages that truly need full rows, but it should not be reused for lightweight infrastructure surfaces like sitemaps, static params, brand counts, indexing queues, or simple existence checks.

## Recommended Next Steps

1. Add database RPCs for brand counts and sitemap entries so Supabase returns pre-aggregated compact payloads.
2. Move popular PDFs behind a cache layer if Supabase storage egress is the usage spike.
3. Consider excluding or noindexing low-value PDF downloads from crawlers if storage egress is bot-heavy.
4. Audit scripts that fetch `*` or `*, pdfs:engine_pdfs(*)`; keep those for QA/import only, not runtime or frequent scheduled jobs.
5. Add a cached JSON snapshot for `llms-full.txt` if AI crawler traffic starts hitting the full data dump heavily.

## Verification

- `npm run build` passed after both optimization passes.
- `npm run test:database` passed: 3,388 engines, 149 alternators, 3,913 PDF links, 76 engine brands.
- `DATA_QA_FAIL_ON=high npm run data:qa` passed with only the existing low-severity Ricardo wordmark fallback issue.
