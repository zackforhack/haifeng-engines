import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { createPublicCatalogClient, fetchAll } from '../helpers/supabase.mjs'

const baseUrl = process.env.QA_BASE_URL ?? 'http://127.0.0.1:3000'
const concurrency = Number(process.env.QA_ROUTE_CONCURRENCY ?? 8)
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

const [engines, alternators, guideFiles] = await Promise.all([
  fetchAll(supabase, 'engines', 'slug, brand, model, status'),
  fetchAll(supabase, 'alternators', 'slug, brand, model, series, status'),
  fs.readdir(new URL('../../content/guides/', import.meta.url)),
])

const representativeEngineByBrand = new Map()
for (const engine of engines) {
  const current = representativeEngineByBrand.get(engine.brand)
  if (!current || (current.status !== 'active' && engine.status === 'active')) {
    representativeEngineByBrand.set(engine.brand, engine)
  }
}

const fixedFacetRoutes = [
  '/engines/fuel/diesel',
  '/engines/fuel/gas',
  '/engines/power/under-100-kwe',
  '/engines/power/100-500-kwe',
  '/engines/power/500-1500-kwe',
  '/engines/power/1500-plus-kwe',
  '/engines/configuration/v6',
  '/engines/configuration/v8',
  '/engines/configuration/v10',
  '/engines/configuration/v12',
  '/engines/configuration/v16',
  '/engines/configuration/v20',
  '/engines/configuration/inline-3',
  '/engines/configuration/inline-4',
  '/engines/configuration/inline-6',
  '/engines/configuration/inline-8',
  '/engines/emissions/epa-tier-4-final',
  '/engines/emissions/epa-tier-3',
  '/engines/emissions/epa-tier-2',
  '/engines/emissions/epa-stationary',
  '/engines/emissions/euro-stage-v',
  '/engines/emissions/euro-stage-iiia',
  '/engines/emissions/china-stage-iii',
  '/engines/emissions/china-stage-iv',
  '/engines/rpm/1500-rpm',
  '/engines/rpm/1800-rpm',
  '/engines/rpm/1000-rpm',
]

const routes = new Set([
  '/',
  '/engines',
  '/alternators',
  '/brands',
  '/guides',
  ...fixedFacetRoutes,
  ...[...representativeEngineByBrand.values()].map(
    (engine) => `/engines/${engine.slug}`,
  ),
  ...[...representativeEngineByBrand.keys()].map(
    (brand) => `/brands/${slugify(brand)}`,
  ),
  ...alternators.map((alternator) => `/alternators/${alternator.slug}`),
  ...new Set(
    alternators
      .map((alternator) => alternator.series)
      .filter(Boolean)
      .map((series) => `/alternators/series/${slugify(series)}`),
  ),
  ...guideFiles
    .filter((file) => file.endsWith('.md'))
    .map((file) => `/guides/${file.replace(/\.md$/, '')}`),
])

const pending = [...routes].sort()
const failures = []
let completed = 0

async function checkRoute(path) {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      redirect: 'manual',
      signal: AbortSignal.timeout(30_000),
    })
    assert.equal(response.status, 200, `HTTP ${response.status}`)
    assert.match(
      response.headers.get('content-type') ?? '',
      /text\/html/i,
      `unexpected content type ${response.headers.get('content-type')}`,
    )
    const html = await response.text()
    assert.match(html, /<html/i, 'response is not an HTML document')
    assert.doesNotMatch(html, /Application error: a server-side exception/i)
  } catch (error) {
    failures.push(`${path}: ${error.message}`)
  } finally {
    completed += 1
  }
}

async function worker() {
  while (pending.length) {
    const path = pending.shift()
    if (path) await checkRoute(path)
  }
}

await Promise.all(
  Array.from(
    { length: Math.max(1, Math.min(concurrency, routes.size)) },
    () => worker(),
  ),
)

assert.equal(completed, routes.size, 'Route audit did not complete its queue')
if (failures.length) {
  console.error(`Catalog route integration failed for ${failures.length} route(s):`)
  for (const failure of failures.slice(0, 50)) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(
  `Catalog route integration passed: ${routes.size} routes `
    + `(${representativeEngineByBrand.size} engine samples, `
    + `${representativeEngineByBrand.size} brand hubs, `
    + `${alternators.length} alternator pages).`,
)
