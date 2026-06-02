import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Yuchai (YC) gen-set engine spec sheets — user-provided folder of official per-model
// "配套参数表" (matching-parameter / spec) PDFs, most in bilingual CN + EN (英文版) pairs.
// We pick the English sheet when present (else Chinese), match each by its embedded model
// token (e.g. YC6MK420L-D20) to the DB, and link as a datasheet.
//   Source: ~/Downloads/Yuchai配套参数表-20230209  (T2 + T3 land/genset diesel engines)
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const ROOT = '/Users/ziqianhuang/Downloads/Yuchai配套参数表-20230209'
const DRY = process.argv.includes('--dry')

// Explicit aliases for filename typos -> canonical DB model
const ALIAS = { 'YCMK360-D30': 'YC6MK360-D30' }

// recursively collect .pdf files
function walk(dir) {
  const out = []
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) out.push(...walk(p))
    else if (ent.isFile() && ent.name.toLowerCase().endsWith('.pdf')) out.push(p)
  }
  return out
}

const TOKEN = /YC[0-9A-Z]+-D?\d+/   // model token embedded in the filename
const files = walk(ROOT)

// group files by model token -> best file (prefer English spec; skip load-curve PDFs)
const byModel = {}
for (const f of files) {
  const base = path.basename(f)
  if (base.includes('负荷特性')) continue          // load-characteristic curve, not a spec table
  if (!base.includes('配套参数')) continue          // must be a matching-parameter spec sheet
  const m = base.match(TOKEN)
  if (!m) continue
  let model = m[0]
  model = ALIAS[model] || model
  const isEn = base.includes('英')                  // 英文版 / 英文 / 英译文 / 英
  const score = isEn ? 2 : 1
  const cur = byModel[model]
  if (!cur || score > cur.score) byModel[model] = { file: f, score, isEn }
}

// load DB Yuchai models
const PAGE = 1000; let engs = []; let from = 0
while (true) { const { data } = await supabase.from('engines').select('id, model').eq('brand', 'Yuchai').range(from, from + PAGE - 1); engs.push(...(data ?? [])); if (!data || data.length < PAGE) break; from += PAGE }
const dbByModel = new Map(engs.map(e => [e.model, e]))

const matched = [], noDbMatch = []
for (const [model, info] of Object.entries(byModel)) {
  if (dbByModel.has(model)) matched.push({ model, ...info })
  else noDbMatch.push(model)
}
const matchedModels = new Set(matched.map(m => m.model))
const dbNoPdf = engs.filter(e => !matchedModels.has(e.model)).map(e => e.model)

console.log(`PDF model tokens found: ${Object.keys(byModel).length}  (EN: ${Object.values(byModel).filter(i => i.isEn).length}, CN-only: ${Object.values(byModel).filter(i => !i.isEn).length})`)
console.log(`Matched to DB: ${matched.length} / ${engs.length} DB models`)
console.log(`\nPDF tokens with NO DB match (${noDbMatch.length}): ${noDbMatch.sort().join(', ') || 'none'}`)
console.log(`\nDB models with NO PDF (${dbNoPdf.length}): ${dbNoPdf.sort().join(', ')}`)

if (DRY) { console.log('\n[dry run] no uploads performed'); process.exit(0) }

let linked = 0, failed = 0
for (const { model, file, isEn } of matched) {
  const e = dbByModel.get(model)
  const buf = fs.readFileSync(file)
  if (buf.slice(0, 4).toString() !== '%PDF') { console.error(`skip ${model}: not a PDF`); failed++; continue }
  const STORE = `yuchai/spec-sheets/${model}.pdf`
  const { error: up } = await supabase.storage.from(BUCKET).upload(STORE, buf, { contentType: 'application/pdf', upsert: true })
  if (up) { console.error(`upload failed ${model}: ${up.message}`); failed++; continue }
  await supabase.from('engine_pdfs').delete().eq('engine_id', e.id).eq('storage_path', STORE)
  const { error } = await supabase.from('engine_pdfs').insert({
    engine_id: e.id, type: 'datasheet',
    label: `Yuchai ${model} Spec Sheet${isEn ? '' : ' (中文)'}`,
    storage_path: STORE, file_size_bytes: buf.length,
  })
  if (error) { console.error(`insert failed ${model}: ${error.message}`); failed++; continue }
  linked++
}
console.log(`\n✓ Linked ${linked} Yuchai spec sheets (${failed} failed)`)
