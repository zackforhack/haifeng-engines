import fs from 'fs'
import https from 'https'
import path from 'path'

const OUTPUT_DIR = '/Users/ziqianhuang/haifeng-engines/data/volvo-pdfs'
fs.mkdirSync(OUTPUT_DIR, { recursive: true })

// All 49 Volvo Penta models from our database
const models = [
  // 5L
  'TAD580VE', 'TAD581VE', 'TAD582VE',
  // 8L Stage II
  'TAD840GE', 'TAD841GE', 'TAD842GE', 'TAD843GE',
  // 8L Stage IIIA
  'TAD851GE', 'TAD852GE', 'TAD853GE',
  // 8L Stage V
  'TAD880GE', 'TAD881GE', 'TAD882GE',
  // 8L Tier 4f
  'TAD880VE', 'TAD881VE', 'TAD882VE', 'TAD883VE',
  // 11L
  'TAD1181VE',
  // 13L Stage II
  'TAD1341GE', 'TAD1342GE', 'TAD1343GE', 'TAD1344GE', 'TAD1345GE', 'TAD1346GE',
  // 13L Stage IIIA
  'TAD1350GE', 'TAD1351GE', 'TAD1352GE', 'TAD1353GE', 'TAD1354GE', 'TAD1355GE',
  // 13L Stage V
  'TAD1380GE', 'TAD1381GE', 'TAD1382GE',
  // 13L Tier 4f
  'TAD1381VE', 'TAD1382VE', 'TAD1383VE', 'TAD1384VE', 'TAD1385VE',
  // 16L Stage II
  'TAD1641GE', 'TAD1642GE', 'TWD1644GE', 'TWD1645GE',
  // 16L Stage IIIA
  'TAD1650GE', 'TAD1651GE', 'TWD1652GE', 'TWD1653GE',
  // 17L
  'TWD1682GE', 'TWD1683GE', 'TWD1744GE',
]

// URL patterns to try in order
const urlPatterns = (model) => [
  `https://www.raad-eng.com/techdata/volvo/prodbull/${model.toLowerCase()}.pdf`,
  `https://www.sermakpower.com/brosur/gen/${model.toLowerCase()}.pdf`,
]

function download(url, dest) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(dest)
    https.get(url, { timeout: 10000 }, (res) => {
      if (res.statusCode !== 200) {
        file.close()
        fs.unlinkSync(dest)
        resolve({ ok: false, status: res.statusCode })
        return
      }
      // Check it's actually a PDF
      const contentType = res.headers['content-type'] || ''
      if (!contentType.includes('pdf') && !contentType.includes('octet')) {
        res.destroy()
        file.close()
        fs.unlinkSync(dest)
        resolve({ ok: false, status: 'not-pdf' })
        return
      }
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve({ ok: true }) })
    }).on('error', () => {
      file.close()
      try { fs.unlinkSync(dest) } catch {}
      resolve({ ok: false, status: 'error' })
    })
  })
}

const found = []
const missing = []

for (const model of models) {
  const dest = path.join(OUTPUT_DIR, `${model.toLowerCase()}.pdf`)
  let downloaded = false

  for (const url of urlPatterns(model)) {
    const result = await download(url, dest)
    if (result.ok) {
      const size = Math.round(fs.statSync(dest).size / 1024)
      console.log(`✅ ${model.padEnd(14)} ${size} KB  ← ${url}`)
      found.push({ model, url, dest })
      downloaded = true
      break
    }
  }

  if (!downloaded) {
    console.log(`❌ ${model} — not found on third-party sources`)
    missing.push(model)
  }
}

console.log(`\n--- SUMMARY ---`)
console.log(`Downloaded: ${found.length} / ${models.length}`)
console.log(`Missing:    ${missing.length}`)
if (missing.length) console.log(`Missing models:\n  ${missing.join(', ')}`)

fs.writeFileSync(
  '/Users/ziqianhuang/haifeng-engines/data/volvo-pdf-results.json',
  JSON.stringify({ found, missing }, null, 2)
)
