import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { createPublicCatalogClient, fetchAll } from '../helpers/supabase.mjs'

const baseUrl = process.env.QA_BASE_URL ?? 'http://127.0.0.1:3000'
const canonicalOrigin =
  process.env.QA_CANONICAL_ORIGIN ?? 'https://engines.haifengmachinery.com'
const supabase = createPublicCatalogClient()

function slugify(value) {
  return value
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function sitemapLocations(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    signal: AbortSignal.timeout(60_000),
  })
  assert.equal(response.status, 200, `${path} returned HTTP ${response.status}`)
  const xml = await response.text()
  assert.match(xml, /<urlset/i, `${path} is not a URL sitemap`)
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => match[1].replaceAll('&amp;', '&'))
  const duplicates = locations.filter(
    (location, index) => locations.indexOf(location) !== index,
  )
  assert.deepEqual(
    [...new Set(duplicates)],
    [],
    `${path} contains duplicate URLs`,
  )
  return new Set(locations)
}

function assertContainsAll(actual, expected, label) {
  const missing = expected.filter((url) => !actual.has(url))
  assert.deepEqual(
    missing,
    [],
    `${label} missing ${missing.length} URL(s): ${missing.slice(0, 20).join(', ')}`,
  )
}

const [engines, alternators, guideFiles, engineUrls, alternatorUrls, brandUrls, guideUrls, comparisonUrls] =
  await Promise.all([
    fetchAll(supabase, 'engines', 'slug, brand'),
    fetchAll(supabase, 'alternators', 'slug'),
    fs.readdir(new URL('../../content/guides/', import.meta.url)),
    sitemapLocations('/engines/sitemap.xml'),
    sitemapLocations('/alternators/sitemap.xml'),
    sitemapLocations('/brands/sitemap.xml'),
    sitemapLocations('/guides/sitemap.xml'),
    sitemapLocations('/engines/compare/sitemap.xml'),
  ])

assertContainsAll(
  engineUrls,
  engines.map((engine) => `${canonicalOrigin}/engines/${engine.slug}`),
  'engine sitemap',
)
assertContainsAll(
  alternatorUrls,
  alternators.map(
    (alternator) => `${canonicalOrigin}/alternators/${alternator.slug}`,
  ),
  'alternator sitemap',
)
assertContainsAll(
  brandUrls,
  [...new Set(engines.map((engine) => engine.brand))].map(
    (brand) => `${canonicalOrigin}/brands/${slugify(brand)}`,
  ),
  'brand sitemap',
)
assertContainsAll(
  guideUrls,
  guideFiles
    .filter((file) => file.endsWith('.md'))
    .map(
      (file) =>
        `${canonicalOrigin}/guides/${file.replace(/\.md$/, '')}`,
    ),
  'guide sitemap',
)

assert.ok(
  comparisonUrls.size >= 3000,
  `comparison sitemap unexpectedly fell to ${comparisonUrls.size} URLs`,
)
assert.ok(
  comparisonUrls.has(
    `${canonicalOrigin}/engines/compare/baudouin-8m33g4d2-5-vs-cummins-qsk19-g34`,
  ),
  'comparison sitemap lost the Baudouin vs Cummins landmark pair',
)

console.log(
  `Sitemap parity passed: ${engines.length} engines, `
    + `${alternators.length} alternators, `
    + `${new Set(engines.map((engine) => engine.brand)).size} brands, `
    + `${guideFiles.filter((file) => file.endsWith('.md')).length} guides, `
    + `${comparisonUrls.size} comparisons.`,
)
