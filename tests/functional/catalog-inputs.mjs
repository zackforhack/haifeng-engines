import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const baseUrl = process.env.QA_BASE_URL ?? 'http://127.0.0.1:3000'
const cases = [
  ['/alternators?poles=abc', '/alternators'],
  ['/alternators?poles=NaN', '/alternators'],
  ['/alternators?poles=4&poles=abc', '/alternators?poles=4'],
  ['/alternators?min_kva=Infinity', '/alternators'],
  ['/alternators?min_kva=200&max_kva=100', '/alternators?min_kva=100&max_kva=200'],
  ['/alternators?brand=Stamford&page=1.5', '/alternators?brand=Stamford&page=1'],
  ['/engines?page=Infinity', '/engines?page=1'],
  ['/engines?page=-1', '/engines?page=1'],
  ['/engines?page=999999999999999999999', '/engines?page=1'],
  ['/engines?q=Perkins&q=invalid', '/engines?q=Perkins'],
]

const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  const pageErrors = []
  page.on('pageerror', error => pageErrors.push(error.message))
  async function open(path) {
    const response = await page.goto(new URL(path, baseUrl).href, { waitUntil: 'domcontentloaded', timeout: 60000 })
    assert.equal(response.status(), 200, `${path}: final HTTP status`)
    await page.locator('main h1').waitFor({ timeout: 30000 })
    assert.ok(!(await page.locator('main').innerText()).includes('Application error:'))
  }
  for (const [path, expected] of cases) {
    const response = await fetch(new URL(path, baseUrl), { redirect: 'manual', signal: AbortSignal.timeout(60000) })
    assert.equal(response.status, 307, `${path}: normalization should redirect before rendering`)
    const location = new URL(response.headers.get('location'), baseUrl)
    assert.equal(location.pathname + location.search, expected)
    await response.body?.cancel()
    await open(path)
    assert.equal(new URL(page.url()).pathname + new URL(page.url()).search, expected)
  }
  for (const route of ['engines', 'alternators']) {
    await open(`/${route}?brand=NonexistentRegressionBrand&page=999999`)
    assert.ok((await page.locator('main').innerText()).includes(`No ${route} found.`))
    assert.equal(new URL(page.url()).searchParams.get('page'), null)
  }

  await open('/alternators?brand=Stamford&view=grid&sort=kva_asc')
  const cards = page.locator('main a.group[href^="/alternators/"]')
  assert.equal(await cards.count(), 24, 'First page should contain 24 models')
  const firstPage = await cards.evaluateAll(links => links.map(link => link.getAttribute('href')))
  const next = page.getByRole('link', { name: 'Next page', exact: true })
  const nextUrl = new URL(await next.getAttribute('href'), baseUrl)
  assert.equal(nextUrl.searchParams.get('view'), 'grid')
  assert.equal(nextUrl.searchParams.get('sort'), 'kva_asc')
  await next.click()
  await page.waitForURL(url => url.searchParams.get('page') === '2')
  await page.getByText(/^Page 2 of /).waitFor()
  assert.equal(await cards.count(), 24)
  const secondPage = await cards.evaluateAll(links => links.map(link => link.getAttribute('href')))
  assert.ok(secondPage.every(href => !firstPage.includes(href)), 'Adjacent pages must not overlap')

  await open('/alternators?brand=Stamford&view=grid&page=999999')
  assert.notEqual(new URL(page.url()).searchParams.get('page'), '999999')
  assert.ok(await cards.count() > 0 && await cards.count() <= 24)
  assert.equal(await page.getByRole('link', { name: 'Next page', exact: true }).count(), 0)

  await open('/alternators?brand=Stamford&view=grid&min_kva=100&max_kva=200')
  const ratings = await cards.locator('span.text-lg').allTextContents()
  assert.ok(ratings.length > 0)
  assert.ok(ratings.every(text => Number(text.replaceAll(',', '')) >= 100 && Number(text.replaceAll(',', '')) <= 200))

  await open('/alternators?q=' + encodeURIComponent('a,b).x%_"\\'))
  assert.ok((await page.locator('main').innerText()).includes('No alternators found.'))
  await open('/alternators')
  await page.getByRole('heading', { name: 'Representative Stamford models' }).waitFor()
  assert.deepEqual(pageErrors, [], 'No client rendering errors')
  console.log('Catalog browser regression passed: 10 malformed-input cases, empty results on both routes, pagination, grid/filter preservation, kVA bounds, escaped search, and featured models.')
} finally {
  await browser.close()
}
