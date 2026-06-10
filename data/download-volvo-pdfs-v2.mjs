import fs from 'fs'
import https from 'https'
import http from 'http'
import path from 'path'

const OUTPUT_DIR = '/Users/ziqianhuang/haifeng-engines/data/volvo-pdfs'
fs.mkdirSync(OUTPUT_DIR, { recursive: true })

// All confirmed PDF URLs from public sources
const pdfs = [
  // --- Already downloaded (sermakpower.com) ---
  // TAD1341GE-1345GE already in volvo-pdfs/

  // --- dbmoteurs.fr (French Volvo Penta dealer) ---
  {
    filename: 'tad880ge-tad881ge-tad882ge.pdf',
    url: 'https://www.dbmoteurs.fr/sites/default/files/TAD880-82GE-moteur-generateur-kva-industriel-volvo-penta.pdf',
    models: ['TAD880GE', 'TAD881GE', 'TAD882GE'],
  },
  {
    filename: 'tad1346ge.pdf',
    url: 'https://www.dbmoteurs.fr/sites/default/files/TAD1346GE-moteur-generation-electricit%C3%A9-industriel-volvo-penta.pdf',
    models: ['TAD1346GE'],
  },
  {
    filename: 'tad1352ge.pdf',
    url: 'https://dbmoteurs.fr/sites/default/files/TAD1352GE-moteur-generateur-kva-industriel-volvo-penta.pdf',
    models: ['TAD1352GE'],
  },
  {
    filename: 'tad1380ge-tad1381ge-tad1382ge.pdf',
    url: 'https://www.dbmoteurs.fr/sites/default/files/TAD1380-82GE-moteur-generateur-kva-industriel-volvo-penta.pdf',
    models: ['TAD1380GE', 'TAD1381GE', 'TAD1382GE'],
  },
  {
    filename: 'twd1683ge.pdf',
    url: 'https://www.dbmoteurs.fr/sites/default/files/TWD1683GE-moteur-generateur-kva-industriel-volvo-penta.pdf',
    models: ['TWD1683GE'],
  },
  {
    filename: 'twd1744ge.pdf',
    url: 'https://www.dbmoteurs.fr/sites/default/files/Moteur-Volvo-Penta-TWD1744GE-fiche-commerciale-brochure-2023-47715495-English-DBMoteurs.pdf',
    models: ['TWD1744GE'],
  },
]

function download(url, dest) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(dest)
    const client = url.startsWith('https') ? https : http
    client.get(url, { timeout: 15000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close()
        fs.unlinkSync(dest)
        return download(res.headers.location, dest).then(resolve)
      }
      if (res.statusCode !== 200) {
        file.close()
        try { fs.unlinkSync(dest) } catch {}
        resolve({ ok: false, status: res.statusCode })
        return
      }
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve({ ok: true }) })
    }).on('error', (e) => {
      file.close()
      try { fs.unlinkSync(dest) } catch {}
      resolve({ ok: false, status: e.message })
    })
  })
}

const results = []

for (const pdf of pdfs) {
  const dest = path.join(OUTPUT_DIR, pdf.filename)
  if (fs.existsSync(dest)) {
    const size = Math.round(fs.statSync(dest).size / 1024)
    console.log(`⏭  ${pdf.filename.padEnd(45)} already exists (${size} KB)`)
    results.push({ ...pdf, dest, ok: true, skipped: true })
    continue
  }

  const result = await download(pdf.url, dest)
  if (result.ok) {
    const size = Math.round(fs.statSync(dest).size / 1024)
    console.log(`✅ ${pdf.filename.padEnd(45)} ${size} KB`)
  } else {
    console.log(`❌ ${pdf.filename.padEnd(45)} — ${result.status}`)
  }
  results.push({ ...pdf, dest, ...result })
}

// Summary
const ok = results.filter(r => r.ok)
const failed = results.filter(r => !r.ok)
const coveredModels = ok.flatMap(r => r.models)

console.log(`\n=== SUMMARY ===`)
console.log(`PDFs downloaded/available: ${ok.length} / ${results.length}`)
console.log(`Engine models with PDFs from this batch: ${coveredModels.join(', ')}`)
if (failed.length) console.log(`Failed: ${failed.map(r => r.filename).join(', ')}`)

fs.writeFileSync(
  '/Users/ziqianhuang/haifeng-engines/data/volvo-pdf-inventory.json',
  JSON.stringify(ok.map(r => ({ filename: r.filename, models: r.models, url: r.url })), null, 2)
)
console.log('\nInventory saved to data/volvo-pdf-inventory.json')
