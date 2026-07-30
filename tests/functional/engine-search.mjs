import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const baseUrl = process.env.QA_BASE_URL ?? 'http://127.0.0.1:3000'
const expectedOriginSlugs = [
  'origin-engines-3-6l-na',
  'origin-engines-3-6l-turbo',
  'origin-engines-4-3l',
  'origin-engines-6-2l-na',
  'origin-engines-6-2l-turbo',
  'origin-engines-8-0l',
  'origin-engines-9-1l-turbo',
  'origin-engines-10-3l-turbo',
]

const browser = await chromium.launch()

async function waitForVisibleEngineLink(page, slug) {
  await page.waitForFunction((engineSlug) => {
    return [...document.querySelectorAll(`main a[href="/engines/${engineSlug}"]`)].some(
      (link) => link.getClientRects().length > 0,
    )
  }, slug)
}

try {
  const page = await browser.newPage()

  async function open(path) {
    const response = await page.goto(`${baseUrl}${path}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    })
    assert.ok(response?.ok(), `${path} returned HTTP ${response?.status()}`)
  }

  await open('/engines')
  await assert.doesNotReject(
    () => page.getByRole('heading', { name: 'Generator Engine Specifications' }).waitFor(),
    'Engine catalog heading did not render',
  )
  const catalogCount = await page
    .locator('main')
    .getByText(/^[\d,]+ engines$/)
    .first()
    .textContent()
  assert.ok(
    Number(catalogCount?.replace(/\D/g, '')) >= 2700,
    `Engine catalog count is unexpectedly low: ${catalogCount}`,
  )

  await open('/brands')
  const brandCards = page.locator('main a[href^="/brands/"]')
  const brandCardCount = await brandCards.count()
  assert.ok(
    brandCardCount >= 75,
    `Brand catalog count is unexpectedly low: ${brandCardCount}`,
  )
  const brandsMissingIdentity = await brandCards.evaluateAll((cards) =>
    cards
      .filter((card) => !card.querySelector('img[alt$=" logo"], [role="img"]'))
      .map((card) => card.querySelector('h2')?.textContent?.trim())
      .filter(Boolean),
  )
  assert.deepEqual(
    brandsMissingIdentity,
    [],
    `Every brand card must render a logo or approved wordmark fallback`,
  )

  await open('/engines?q=origin')
  await assert.doesNotReject(
    () => page.getByRole('heading', { name: 'Results for "origin"' }).waitFor(),
    'Origin search heading did not render',
  )
  await assert.doesNotReject(
    () => page.getByText('8 engines', { exact: true }).waitFor(),
    'Origin search count must remain eight',
  )

  const hrefs = await page
    .locator('main a[href^="/engines/origin-engines-"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')))
  const slugs = [...new Set(
    hrefs
      .filter(Boolean)
      .map((href) => href.replace('/engines/', '')),
  )].sort()

  assert.deepEqual(
    slugs,
    [...expectedOriginSlugs].sort(),
    'The default table view must render every Origin search result',
  )
  assert.equal(
    await page.getByText('Power rating not listed', { exact: true }).count(),
    0,
    'Estimated engines must remain in normal power bands',
  )
  await assert.doesNotReject(
    () => page.getByText('≈ 220.5 kWe est.', { exact: true }).waitFor(),
    'Origin 10.3L Turbo must show its 0.9 electrical-output estimate',
  )
  await assert.doesNotReject(
    () => page
      .getByText('Estimated kWe = 0.9 × mechanical kW; reference only', {
        exact: true,
      })
      .waitFor(),
    'Estimated ratings must include the reference-only disclosure',
  )

  await open('/engines?fuel_type=Natural+Gas&q=jenbacher')
  for (const slug of ['jenbacher-j612', 'jenbacher-j616', 'jenbacher-j620', 'jenbacher-j624']) {
    await assert.doesNotReject(
      () => waitForVisibleEngineLink(page, slug),
      `Natural-gas Jenbacher search omitted ${slug}`,
    )
  }

  await open('/engines?emissions=U.S.+EPA+Final+Tier+4')
  await assert.doesNotReject(
    () => waitForVisibleEngineLink(page, 'volvo-penta-twd1682ge'),
    'EPA Final Tier 4 search omitted Volvo Penta TWD1682GE',
  )
  await page.getByLabel('Sort engines').selectOption('kwe_desc')
  await page.waitForURL(/sort=kwe_desc/)
  assert.ok(
    page.url().includes('view=grid'),
    'Sorting the engine catalog must switch to grid view so ordered results are visible',
  )
  assert.ok(
    !page.url().includes('page='),
    'Changing sort must reset stale pagination',
  )
  await assert.doesNotReject(
    () => page.getByText('Grid view shows each engine as a specification card.').waitFor(),
    'Sorted engine results should render as a card list instead of the power-band matrix',
  )

  const searchInput = page.locator('input[type="search"]')
  await searchInput.fill('cummins')
  await searchInput.press('Enter')
  await page.waitForURL(/q=cummins/)
  assert.ok(
    page.url().includes('emissions=U.S.+EPA+Final+Tier+4'),
    'Searching from a filtered catalog must preserve the selected emissions filter',
  )
  assert.ok(
    page.url().includes('view=grid'),
    'Searching the engine catalog must render ordered results in grid view',
  )
  await assert.doesNotReject(
    () => page.getByText('7 matching engines', { exact: true }).waitFor(),
    'EPA Final Tier 4 Cummins search should return the expected narrowed result count',
  )

  await open('/engines/origin-engines-3-6l-turbo')
  await assert.doesNotReject(
    () => page
      .getByRole('heading', { name: 'Origin Engines 3.6L Turbo', exact: true })
      .waitFor(),
    'Origin engine detail page did not render',
  )

  await open(
    '/engines/compare/baudouin-8m33g4d2-5-vs-perkins-2806',
  )
  await assert.doesNotReject(
    () => page.getByText('8M33G4D2/5', { exact: false }).first().waitFor(),
    'Comparison page omitted the Baudouin model',
  )
  await assert.doesNotReject(
    () => page.getByText('2806', { exact: false }).first().waitFor(),
    'Comparison page omitted the Perkins model',
  )

  console.log(
    `Functional QA passed: ${brandCardCount} brand identities, catalog, filters, details, comparison, and ${slugs.length} Origin models.`,
  )
} finally {
  await browser.close()
}
