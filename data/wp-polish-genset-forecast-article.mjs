const WP_BASE = process.env.WP_BASE ?? 'https://www.haifengmachinery.com'
const WP_USER = process.env.WP_USER
const WP_APPLICATION_PASSWORD = process.env.WP_APPLICATION_PASSWORD
const WP_BASIC_AUTH = process.env.WP_BASIC_AUTH
const TARGET_ID = Number(process.env.WP_NEWS_ID ?? 21330)
const DRY_RUN = process.env.DRY_RUN !== '0'

function authHeader() {
  if (WP_BASIC_AUTH) return `Basic ${WP_BASIC_AUTH}`
  if (WP_USER && WP_APPLICATION_PASSWORD) {
    return `Basic ${Buffer.from(`${WP_USER}:${WP_APPLICATION_PASSWORD}`).toString('base64')}`
  }
  return null
}

async function wpJson(path, options = {}) {
  const headers = {
    'User-Agent': 'Codex WP article polisher',
    Accept: 'application/json',
    ...(options.headers ?? {}),
  }
  const auth = authHeader()
  if (auth) headers.Authorization = auth

  const res = await fetch(`${WP_BASE}${path}`, { ...options, headers })
  const text = await res.text()
  let json
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = { raw: text }
  }
  if (!res.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path} failed: ${res.status} ${JSON.stringify(json).slice(0, 800)}`)
  }
  return json
}

const leadImages = `<img src="https://ecdn.cnyandex.com/haifengmachinery/uploads/market-104-1000.webp" alt="Industrial generator sets and genset production forecast chart for 2026 market planning" itemprop="image" height="692" width="1000" title="Industrial generator sets for 2026 market planning" onerror="this.style.display='none'"  />
\t\t\t\t<img src="https://ecdn.cnyandex.com/haifengmachinery/uploads/03_btm_gas_generation_facility-scaled.webp" alt="Gas generator facility and industrial power generation demand" itemprop="image" height="1097" width="2560" title="Gas generator facility and industrial power generation demand" onerror="this.style.display='none'"  />
\t\t\t\t<img src="https://ecdn.cnyandex.com/haifengmachinery/uploads/04_diesel_bess_hybrid_system.webp" alt="Hybrid diesel generator and BESS system for generator market growth" itemprop="image" height="2304" width="1728" title="Hybrid diesel generator and BESS system" onerror="this.style.display='none'"  />`

const scopedStyle = `<style>
.hf-genset-article {
  max-width: 1000px;
  color: #1f2933;
}
.hf-genset-lead {
  display: grid;
  grid-template-columns: minmax(260px, 354px) minmax(0, 1fr);
  gap: 84px;
  align-items: start;
  margin: 90px 0 54px;
}
.hf-genset-rail img {
  display: block;
  width: 100%;
  height: 248px;
  object-fit: cover;
  border-radius: 2px;
  box-shadow: 0 12px 22px rgba(15, 23, 42, 0.16);
  margin: 0 0 40px;
}
.hf-genset-rail img:first-child {
  height: 248px;
}
.hf-genset-rail img:last-child {
  height: 248px;
  margin-bottom: 0;
}
.hf-genset-article img[src*="product-photobank"] {
  display: none !important;
}
.hf-genset-body p:has(> img),
.hf-genset-body img {
  display: none !important;
  margin: 0 !important;
}
.hf-genset-copy p,
.hf-genset-body p {
  font-size: 18px;
  line-height: 1.58;
  margin: 0 0 18px;
}
.hf-genset-copy p {
  max-width: 460px;
}
.hf-genset-copy strong {
  font-weight: 700;
}
.hf-genset-body {
  max-width: 920px;
}
.hf-genset-body h2 {
  font-size: 28px;
  line-height: 1.25;
  margin: 38px 0 14px;
}
.hf-genset-body table {
  width: 100%;
  border-collapse: collapse;
  margin: 22px 0 30px;
  font-size: 15px;
  line-height: 1.45;
}
.hf-genset-body th,
.hf-genset-body td {
  border: 1px solid #d9e2ec;
  padding: 12px 14px;
  vertical-align: top;
}
.hf-genset-body th {
  background: #f0f4f8;
  font-weight: 700;
}
.hf-genset-body ul,
.hf-genset-body ol {
  margin: 12px 0 24px 22px;
  padding: 0;
}
.hf-genset-body li {
  font-size: 18px;
  line-height: 1.55;
  margin: 0 0 8px;
}
@media (max-width: 900px) {
  .hf-genset-lead {
    display: block;
    margin-top: 40px;
  }
  .hf-genset-rail {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 28px;
  }
  .hf-genset-rail img,
  .hf-genset-rail img:first-child,
  .hf-genset-rail img:last-child {
    height: 160px;
    margin: 0;
  }
}
@media (max-width: 640px) {
  .hf-genset-rail {
    grid-template-columns: 1fr;
  }
  .hf-genset-rail img,
  .hf-genset-rail img:first-child,
  .hf-genset-rail img:last-child {
    height: auto;
  }
  .hf-genset-copy p,
  .hf-genset-body p,
  .hf-genset-body li {
    font-size: 16px;
  }
}
</style>`

function removeGeneratedToc(content) {
  return content.replace(
    /^\s*<div class='table-of-contents'[\s\S]*?<\/div>\s*/i,
    '',
  )
}

function replaceLeadFigure(content) {
  const leadFigurePattern = /^\s*<figure>\s*<img[^>]+market-104-1000\.webp[^>]*>\s*<\/figure>\s*/i
  if (leadFigurePattern.test(content)) {
    return content.replace(leadFigurePattern, '')
  }

  return content.replace(/^\s*(?:<img[^>]+(?:market-104-1000|03_btm_gas_generation_facility|04_diesel_bess_hybrid_system)[^>]*>\s*)+/i, '')
}

function normalizeIntro(content) {
  return content
    .replaceAll('<p><strong><b>Last updated:', '<p><strong>Last updated:')
    .replaceAll('</b></strong>', '</strong>')
    .replaceAll('<p><strong><b>Executive summary:</b></strong>', '<p><strong>Executive summary:</strong>')
}

function removeInjectedArticleImages(content) {
  return content
    .replace(/\s*<p>\s*<img[^>]+(?:haifeng-natgas-generator-cover|product-photobank)[^>]*>\s*<\/p>\s*/gi, '\n')
    .replace(/\s*<img[^>]+(?:haifeng-natgas-generator-cover|product-photobank)[^>]*>\s*/gi, '\n')
}

function recoverGeneratedArticle(content) {
  if (!content.includes('hf-genset-article')) return content

  let recovered = content
    .replace(/<style>[\s\S]*?\.hf-genset-article[\s\S]*?<\/style>\s*/i, '')
    .replace(/<img[^>]+(?:market-104-1000|03_btm_gas_generation_facility|04_diesel_bess_hybrid_system)[^>]*>\s*/gi, '')
    .replace(/<div class="hf-genset-(?:article|rail|copy|body)">\s*/gi, '')
    .replace(/<section class="hf-genset-lead">\s*/gi, '')

  const introStart = recovered.search(/<p><strong>Last updated:/i)
  if (introStart >= 0) recovered = recovered.slice(introStart)

  recovered = recovered
    .replace(/\s*<\/div>\s*<\/section>\s*<div class="hf-genset-body">\s*/gi, '\n')
    .replace(/\s*<\/div>\s*<\/section>\s*/gi, '\n')

  while (/<\/div>\s*$/i.test(recovered)) {
    recovered = recovered.replace(/<\/div>\s*$/i, '')
  }

  return recovered
}

function patchContent(content) {
  let next = recoverGeneratedArticle(content)
  next = next.replace(/^<!-- wp:fl-builder\/layout -->\s*/i, '')
  next = removeGeneratedToc(next)
  next = replaceLeadFigure(next)
  next = normalizeIntro(next)
  next = removeInjectedArticleImages(next)

  const firstHeading = next.search(/<h2\b/i)
  const intro = firstHeading >= 0 ? next.slice(0, firstHeading).trim() : next.trim()
  const body = firstHeading >= 0 ? next.slice(firstHeading).trim() : ''

  return `${scopedStyle}
<div class="hf-genset-article">
  <section class="hf-genset-lead">
    <div class="hf-genset-rail">
      ${leadImages}
    </div>
    <div class="hf-genset-copy">
      ${intro}
    </div>
  </section>
  <div class="hf-genset-body">
    ${body}
  </div>
</div>
`
}

async function main() {
  const context = authHeader() ? 'edit' : 'view'
  const post = await wpJson(`/wp-json/wp/v2/news/${TARGET_ID}?context=${context}&_fields=id,slug,status,link,title,content`)
  const current = post.content?.raw ?? post.content?.rendered
  if (!current) throw new Error(`No content found for news ${TARGET_ID}`)

  const patched = patchContent(current)
  const changed = patched !== current

  console.log(JSON.stringify({
    id: post.id,
    slug: post.slug,
    link: post.link,
    dryRun: DRY_RUN,
    changed,
    hasAuth: Boolean(authHeader()),
    currentLength: current.length,
    patchedLength: patched.length,
  }, null, 2))

  if (!changed || DRY_RUN) return
  if (!authHeader()) throw new Error('Set WP_USER + WP_APPLICATION_PASSWORD or WP_BASIC_AUTH before running with DRY_RUN=0.')

  const updated = await wpJson(`/wp-json/wp/v2/news/${TARGET_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: patched }),
  })
  console.log(`Updated ${updated.link}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
