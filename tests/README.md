# Regression Test Suite

The suite protects three different failure surfaces. Keep them separate so a
failure points to the layer that actually regressed.

## Database integrity

```bash
npm run test:database
```

This is a read-only live Supabase contract test. It checks:

- catalog, document-link, brand, and major-brand count floors
- required public Supabase columns used by the application
- required engine and alternator landmark records
- non-empty identities and unique IDs/slugs
- URL-safe slugs and allowed status values
- non-negative numeric fields
- valid `engine_pdfs` types, labels, storage paths, sizes, and engine references
- duplicate engine/document link prevention
- public anonymous read access through the same credentials used by the site

## Linked document storage

```bash
npm run test:storage
```

This read-only audit checks every unique `engine_pdfs.storage_path` against the
public `engine-pdfs` Supabase Storage bucket. It uses bounded concurrency,
timeouts, and retries, and validates the response type and non-empty object
size without downloading the PDF contents.

Growth floors live in `tests/contracts/catalog-baseline.json`. Raise a floor
after a reviewed expansion batch. Do not lower one merely to make CI pass;
investigate whether records were deleted, renamed, hidden by RLS, or failed to
import.

## Source-data QA

```bash
DATA_QA_FAIL_ON=high npm run data:qa
```

This checks cross-field plausibility, source-verified rating fixtures, engine
configuration, power relationships, duplicate specifications, taxonomy, and
brand identity coverage. It writes detailed reports under
`reports/data-qa/`.

## Functional and integration QA

Run against a production build, matching the Next.js deployment runtime:

```bash
npm run build
npm run start
QA_BASE_URL=http://127.0.0.1:3000 npm run test:functional
```

The browser and HTTP suites cover:

- engine catalog counts, search, fuel/emissions filters, power bands, and estimates
- engine detail and comparison routes
- mobile homepage count visibility
- brand identities and the Baudouin buyer hub
- alternator catalog and Stamford detail page
- guide catalog and article rendering
- robots, sitemap indexes, engine sitemap, `llms.txt`, and `llms-full.txt`
- canonical/noindex rules, JSON-LD presence, and invalid-route 404 responses
- uncaught browser exceptions
- database-to-route consistency for every brand hub and alternator page
- one representative engine detail page per brand
- every guide, engine facet hub, and alternator series hub
- complete engine, alternator, brand, and guide sitemap parity with Supabase
- comparison sitemap volume and landmark-pair preservation

CI runs these checks after lint, type checking, live database QA, and the
production build. A single push therefore triggers one Vercel build while
protecting both the data and the application behavior.

The `Production Smoke` workflow reruns the functional and integration suite
against `https://engines.haifengmachinery.com` after successful GitHub
production deployment events and once daily. It is read-only and does not
build or deploy the site.

The existing daily `SEO Monitor` workflow also runs the database and linked
storage contracts and blocks on high-severity data QA issues. It uploads
reports even when a check fails. This scheduled monitor reads Supabase directly
and does not push code or trigger a Vercel deployment.
