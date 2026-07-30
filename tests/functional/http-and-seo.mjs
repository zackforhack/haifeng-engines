import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const baseUrl = process.env.QA_BASE_URL ?? 'http://127.0.0.1:3000'
const canonicalOrigin =
  process.env.QA_CANONICAL_ORIGIN ?? 'https://engines.haifengmachinery.com'

async function expectText(path, patterns) {
  const response = await fetch(`${baseUrl}${path}`)
  assert.equal(response.status, 200, `${path} returned HTTP ${response.status}`)
  const text = await response.text()
  for (const pattern of patterns) {
    assert.match(text, pattern, `${path} did not match ${pattern}`)
  }
}

await Promise.all([
  expectText('/robots.txt', [
    /User-Agent:/i,
    /Sitemap:.*\/sitemap\.xml/i,
    /\/engines\/sitemap\.xml/i,
  ]),
  expectText('/sitemap.xml', [
    /<urlset/i,
    /\/engines\/fuel\/diesel/i,
    /\/guides\/how-to-choose-a-generator-engine/i,
  ]),
  expectText('/engines/sitemap.xml', [
    /<urlset/i,
    /\/engines\/cummins-6ltaa95-g1/i,
    /\/engines\/volvo-penta-twd1682ge/i,
  ]),
  expectText('/llms.txt', [
    /Generator Engine Encyclopedia/i,
    /engine models across/i,
    /\/llms-full\.txt/i,
  ]),
  expectText('/llms-full.txt', [
    /Cummins 6LTAA9\.5-G1/i,
    /Volvo Penta TWD1682GE/i,
  ]),
])

const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  let response = await page.goto(`${baseUrl}/engines?q=origin`, {
    waitUntil: 'domcontentloaded',
  })
  assert.ok(response?.ok(), 'Filtered engine page failed')
  assert.equal(
    await page.locator('link[rel="canonical"]').getAttribute('href'),
    `${canonicalOrigin}/engines`,
    'Filtered engine page canonical changed',
  )
  assert.match(
    (await page.locator('meta[name="robots"]').getAttribute('content')) ?? '',
    /noindex/i,
    'Filtered engine page must remain noindex',
  )

  response = await page.goto(`${baseUrl}/engines/cummins-6ltaa95-g1`, {
    waitUntil: 'domcontentloaded',
  })
  assert.ok(response?.ok(), 'Engine detail page failed')
  assert.equal(
    await page.locator('link[rel="canonical"]').getAttribute('href'),
    `${canonicalOrigin}/engines/cummins-6ltaa95-g1`,
    'Engine detail canonical changed',
  )
  const schemas = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents()
  const schemaText = schemas.join('\n')
  assert.match(schemaText, /6LTAA9\.5-G1/i, 'Engine schema omitted the model')
  assert.match(schemaText, /BreadcrumbList/, 'Engine schema omitted breadcrumbs')

  response = await page.goto(`${baseUrl}/engines/not-a-real-engine-model`, {
    waitUntil: 'domcontentloaded',
  })
  assert.equal(response?.status(), 404, 'Unknown engine route must return HTTP 404')

  response = await page.goto(`${baseUrl}/alternators/not-a-real-alternator`, {
    waitUntil: 'domcontentloaded',
  })
  assert.equal(response?.status(), 404, 'Unknown alternator route must return HTTP 404')

  assert.deepEqual(pageErrors, [], `Uncaught browser errors: ${pageErrors.join('; ')}`)
  console.log('HTTP and SEO integration QA passed: exports, sitemaps, metadata, schema, and 404s.')
} finally {
  await browser.close()
}
