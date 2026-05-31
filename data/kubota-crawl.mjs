import fs from 'fs'
// Crawl Kubota engine product detail pages to build an id -> model index.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const detail = (id) => `https://engine.kubota.com/products/detail?id=${id}&ln=en`

async function fetchModel(id) {
  try {
    const res = await fetch(detail(id), { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) })
    if (!res.ok) return null
    const html = await res.text()
    const m = html.match(/detail-header__title[^>]*>\s*([^<]+?)\s*</i)
    return m ? m[1].trim() : null
  } catch { return null }
}

const out = []
const IDS = Array.from({ length: 300 }, (_, i) => i + 1)
const CONC = 12
for (let i = 0; i < IDS.length; i += CONC) {
  const batch = IDS.slice(i, i + CONC)
  const res = await Promise.all(batch.map(async id => ({ id, model: await fetchModel(id) })))
  for (const r of res) if (r.model) { out.push(r); process.stdout.write('.') }
}
fs.writeFileSync('/tmp/kubota_index.json', JSON.stringify(out, null, 0))
console.log(`\n${out.length} products indexed -> /tmp/kubota_index.json`)
console.log(out.slice(0, 20).map(r => `${r.id}\t${r.model}`).join('\n'))
