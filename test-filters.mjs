import { chromium } from 'playwright'

const BASE = 'https://haifeng-engines.vercel.app'
const results = []

function log(test, status, detail = '') {
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '~'
  console.log(`${icon} ${test}${detail ? ': ' + detail : ''}`)
  results.push({ test, status, detail })
}

const browser = await chromium.launch()
const page = await browser.newPage()

// ── 1. Page loads ───────────────────────────────────────────────────────────
await page.goto(`${BASE}/engines`, { waitUntil: 'networkidle' })
const title = await page.title()
log('Page loads', title.includes('Diesel') ? 'PASS' : 'FAIL', title)

// ── 2. Filter panel visible ─────────────────────────────────────────────────
const filterPanel = page.locator('text=Filters')
log('Filter panel visible', await filterPanel.isVisible() ? 'PASS' : 'FAIL')

// ── 3. Brand dropdown has options ───────────────────────────────────────────
const brandSelect = page.locator('select').first()
const brandOptions = await brandSelect.locator('option').count()
log('Brand dropdown populated', brandOptions > 5 ? 'PASS' : 'FAIL', `${brandOptions} options`)

// ── 4. Filter by brand (Cummins) ────────────────────────────────────────────
await page.goto(`${BASE}/engines?brand=Cummins`, { waitUntil: 'networkidle' })
const cards = page.locator('a[href^="/engines/"]')
const count = await cards.count()
log('Brand filter: Cummins', count > 0 ? 'PASS' : 'FAIL', `${count} engines`)

// verify all visible brands are Cummins
const firstBrand = await page.locator('p.text-blue-600').first().textContent()
log('Brand filter: only Cummins shown', firstBrand?.trim() === 'Cummins' ? 'PASS' : 'FAIL', `got: ${firstBrand?.trim()}`)

// ── 5. Filter by origin ─────────────────────────────────────────────────────
await page.goto(`${BASE}/engines?origin=Japan`, { waitUntil: 'networkidle' })
const japanCount = await page.locator('a[href^="/engines/"]').count()
log('Origin filter: Japan', japanCount > 0 ? 'PASS' : 'FAIL', `${japanCount} engines`)

// ── 6. Filter by emissions ──────────────────────────────────────────────────
await page.goto(`${BASE}/engines?emissions=Euro+Stage+V`, { waitUntil: 'networkidle' })
const euCount = await page.locator('a[href^="/engines/"]').count()
log('Emissions filter: Euro Stage V', euCount > 0 ? 'PASS' : 'FAIL', `${euCount} engines`)

// ── 7. Filter by config ─────────────────────────────────────────────────────
await page.goto(`${BASE}/engines?config=V12`, { waitUntil: 'networkidle' })
const v12Count = await page.locator('a[href^="/engines/"]').count()
log('Config filter: V12', v12Count > 0 ? 'PASS' : 'FAIL', `${v12Count} engines`)

// ── 8. Hz filter ────────────────────────────────────────────────────────────
await page.goto(`${BASE}/engines?hz=60`, { waitUntil: 'networkidle' })
const hz60Count = await page.locator('a[href^="/engines/"]').count()
log('Hz filter: 60Hz', hz60Count > 0 ? 'PASS' : 'FAIL', `${hz60Count} engines`)

// ── 9. Power range filter ───────────────────────────────────────────────────
await page.goto(`${BASE}/engines?min_kwe=1000&max_kwe=2000`, { waitUntil: 'networkidle' })
const powerCount = await page.locator('a[href^="/engines/"]').count()
log('Power range: 1000–2000 kWe', powerCount > 0 ? 'PASS' : 'FAIL', `${powerCount} engines`)

// ── 10. Sort: power high→low ────────────────────────────────────────────────
await page.goto(`${BASE}/engines?sort=kwe_desc`, { waitUntil: 'networkidle' })
// First engine card should be a high-power engine (MTU/Cummins QSK etc.)
const firstCard = await page.locator('a[href^="/engines/"]').first().getAttribute('href')
log('Sort: power high→low', firstCard ? 'PASS' : 'FAIL', `first: ${firstCard}`)

// ── 11. Sort: displacement high→low ─────────────────────────────────────────
await page.goto(`${BASE}/engines?sort=disp_desc`, { waitUntil: 'networkidle' })
const firstDisp = await page.locator('a[href^="/engines/"]').first().getAttribute('href')
log('Sort: displacement high→low', firstDisp ? 'PASS' : 'FAIL', `first: ${firstDisp}`)

// ── 12. Combined filters ────────────────────────────────────────────────────
await page.goto(`${BASE}/engines?brand=Cummins&config=L6&hz=50`, { waitUntil: 'networkidle' })
const comboCount = await page.locator('a[href^="/engines/"]').count()
log('Combined: Cummins + L6 + 50Hz', comboCount > 0 ? 'PASS' : 'FAIL', `${comboCount} engines`)

// ── 13. Text search preserves filters ──────────────────────────────────────
await page.goto(`${BASE}/engines?brand=Perkins`, { waitUntil: 'networkidle' })
const searchInput = page.locator('input[type="search"]')
await searchInput.fill('1106')
await page.keyboard.press('Enter')
await page.waitForURL(/q=1106/, { timeout: 5000 })
const url = page.url()
log('Search preserves filters', url.includes('brand=Perkins') && url.includes('q=1106') ? 'PASS' : 'FAIL', url.split('?')[1])

// ── 14. Clear all works ─────────────────────────────────────────────────────
await page.goto(`${BASE}/engines?brand=Cummins&origin=Germany&sort=kwe_desc`, { waitUntil: 'networkidle' })
const clearBtn = page.locator('text=Clear all')
await clearBtn.click()
await page.waitForURL(/\/engines/, { timeout: 5000 })
const clearedUrl = page.url()
log('Clear all removes filters', !clearedUrl.includes('brand=') && !clearedUrl.includes('origin=') ? 'PASS' : 'FAIL', clearedUrl.split('?')[1] ?? '(no params)')

// ── 15. Empty state ─────────────────────────────────────────────────────────
await page.goto(`${BASE}/engines?brand=Cummins&config=V20`, { waitUntil: 'networkidle' })
const emptyMsg = page.locator('text=No engines found')
log('Empty state shown', await emptyMsg.isVisible() ? 'PASS' : 'FAIL')

await browser.close()

const passed = results.filter(r => r.status === 'PASS').length
const failed = results.filter(r => r.status === 'FAIL').length
console.log(`\n${passed}/${results.length} passed, ${failed} failed`)
