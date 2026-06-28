# Haifeng Engines

Generator engine and alternator specification catalog built with Next.js App Router,
Supabase, and Vercel.

The site powers `engines.haifengmachinery.com` and includes:

- Engine and alternator browse/search pages
- Engine, alternator, brand, guide, category, and comparison detail routes
- SEO metadata, Open Graph images, robots, sitemap, and llms.txt routes
- Markdown-authored buying/specification guides
- Supabase-backed catalog data and PDF spec-sheet links

## Stack

- Next.js 16.2
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase JavaScript client
- Vercel Analytics
- Recharts

This project uses the App Router. Before changing Next.js APIs or route conventions,
check the local versioned docs in `node_modules/next/dist/docs/`.

## Environment

Create `.env.local` from `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Required:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Optional:

```bash
NEXT_PUBLIC_GA_ID=
```

The same variables must be configured in Vercel. Production builds query Supabase
while collecting page data and generating static routes.

## Development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Validate the app:

```bash
npm run lint
npm run build
```

`npm run build` uses `next build --webpack` and requires network access to Supabase.
The project pins Node 22 through `.nvmrc` and `package.json` so local, CI, and
Vercel builds use the same major runtime.

## Project Layout

- `app/` - App Router pages, route handlers, metadata routes, and Open Graph images
- `components/` - UI components for filters, tables, cards, charts, nav, and downloads
- `lib/` - Supabase access, catalog filtering, display helpers, facets, guides, and comparisons
- `content/guides/` - Markdown guide content with frontmatter
- `public/` - brand logos, guide images, hero image, fonts, and static assets
- `supabase/` - schema and migration SQL
- `data/` - one-off import, extraction, upload, and QA scripts for catalog maintenance

## Data Notes

The runtime catalog reads from Supabase tables including:

- `engines`
- `engine_pdfs`
- `alternators`

The PDF route `/specsheets/:path*` is rewritten in `next.config.ts` to the public
Supabase storage bucket, keeping public links on the site domain.

## Deployment

Vercel should use the GitHub integration with `main` as the production branch.
The default install/build flow is:

```bash
npm ci
npm run build
```

GitHub Actions runs on pushes and pull requests to `main`:

- `npm ci`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build` when Supabase Actions secrets are configured

Configure these GitHub repository secrets for CI:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GA_ID` (optional)

Configure the same environment variables in Vercel for Production, Preview, and
Development as needed. Vercel performs the actual deployment after GitHub receives
the commit; GitHub Actions acts as the quality gate.

Current build output prerenders thousands of static catalog pages through
`generateStaticParams`, while selected routes remain dynamic for fresh catalog data
and generated assets.

## SEO Reporting

The project includes a local read-only reporting script for Google Search Console
and GA4:

```bash
npm run seo:report
```

Required local environment:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/google-service-account.json
GSC_SITE_URL=https://engines.haifengmachinery.com/
GA4_PROPERTY_ID=123456789
```

`GA4_PROPERTY_ID` is the numeric GA4 property id, not the `G-...` measurement id.
`GOOGLE_APPLICATION_CREDENTIALS` should point to a Google Cloud service-account
JSON file that is not committed to git.

The service account needs read-only access:

- Google Search Console API enabled in Google Cloud
- Google Analytics Data API enabled in Google Cloud
- Service account added as a Search Console user for `https://engines.haifengmachinery.com/`
- Service account added as a Viewer on the GA4 property

Generated reports are written to `reports/seo/` and ignored by git.

Generate a daily Search Console indexing queue with:

```bash
npm run seo:indexing-queue
```

The queue writes `reports/seo/indexing-queue-YYYY-MM-DD.md` and groups URLs into
10-URL daily batches by default. Set `INDEXING_DAILY_QUOTA=20` or another value
to change the batch size. The queue prioritizes canonical hubs first, then
curated engine facets, high-inventory brand hubs, alternator series hubs, and
GSC-visible detail pages from the latest local SEO report.

GitHub Actions also includes a manual/daily `SEO Monitor` workflow. To enable it,
add this repository secret:

- `GOOGLE_SERVICE_ACCOUNT_JSON` - the full Google service-account JSON content

The workflow runs `npm run seo:report` when Google credentials are configured.
It also runs `npm run data:qa` when the Supabase Actions secrets are configured,
then uploads generated `reports/` files as a workflow artifact for 30 days. It
does not commit generated reports back to the repository.

## Data QA

Run the catalog integrity report with:

```bash
npm run data:qa
```

The script reads Supabase using the local `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` values, then writes ignored reports to
`reports/data-qa/`.

Checks include:

- engine completeness score
- missing key fields and datasheets
- duplicate brand/model rows
- kVA/kWe/kWm consistency
- prime vs standby consistency
- fuel/ignition sanity
- alternator missing data-sheet and rating checks
- SEO-priority data fixes using the latest `reports/seo/*.json` file when present
