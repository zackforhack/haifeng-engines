import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const baseUrl = process.env.QA_BASE_URL ?? 'http://127.0.0.1:3000'
const browser = await chromium.launch()

try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
  })
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  async function open(path) {
    const response = await page.goto(`${baseUrl}${path}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    })
    assert.ok(response?.ok(), `${path} returned HTTP ${response?.status()}`)
  }

  await open('/')
  const heroHeading = page.getByRole('heading', {
    name: /Generator Engine Specifications/,
  })
  await heroHeading.waitFor()
  await page.waitForTimeout(800)
  const headingText = await heroHeading.textContent()
  assert.match(
    headingText ?? '',
    /[\d,]+\+\s*Generator Engine Specifications/,
    `Mobile homepage engine count is missing: ${headingText}`,
  )
  const countBox = await heroHeading.locator('span').first().boundingBox()
  assert.ok(countBox, 'Mobile homepage engine count has no rendered box')
  assert.ok(
    countBox.x >= 0 && countBox.x + countBox.width <= 390,
    `Mobile homepage engine count is clipped: ${JSON.stringify(countBox)}`,
  )

  for (const label of ['Engines', 'Alternators', 'Brands', 'Countries']) {
    await page.locator('main').getByText(label, { exact: true }).first().waitFor()
  }

  await page.setViewportSize({ width: 1440, height: 1000 })

  await open('/alternators')
  await page.getByRole('heading', { name: 'Alternator Specifications' }).waitFor()
  await page.locator('main a[href="/alternators/stamford-uci224g"]').first().waitFor()

  await open('/alternators/stamford-uci224g')
  await page
    .getByRole('heading', { level: 1, name: /Stamford UCI224G/i })
    .waitFor()
  await page.getByRole('heading', { name: 'Specifications' }).waitFor()
  await page.getByText('Technical Data Sheet', { exact: true }).waitFor()

  await open('/brands/baudouin')
  await page
    .getByRole('heading', { level: 1, name: /Baudouin.*Generator/i })
    .waitFor()
  await page
    .getByRole('heading', { name: 'How to choose Baudouin for a generator set' })
    .waitFor()
  await page.getByRole('heading', { name: 'Common applications' }).waitFor()
  await page.getByRole('heading', { name: 'Related resources' }).waitFor()

  await open('/guides')
  await page
    .getByRole('heading', { name: 'Generator Engine & Alternator Guides' })
    .waitFor()
  await page
    .locator('main a[href="/guides/how-to-choose-a-generator-engine"]')
    .first()
    .waitFor()

  await open('/guides/how-to-choose-a-generator-engine')
  await page
    .getByRole('heading', { name: /How to Choose a Generator Engine/i })
    .waitFor()
  await page.getByRole('heading', { name: 'Related generator guides' }).waitFor()

  assert.deepEqual(pageErrors, [], `Uncaught browser errors: ${pageErrors.join('; ')}`)
  console.log('Site smoke QA passed: mobile hero, alternators, brands, and guides.')
} finally {
  await browser.close()
}
