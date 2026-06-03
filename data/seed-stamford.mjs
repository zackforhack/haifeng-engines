// Seed/refresh the lean Stamford alternator catalog from the Industrial Ratings
// Book Ed.6a. One row per model: identity + series + poles + nominal kVA (browse
// only, reused from prior vetted data) + a link to that family's official data
// sheets on stamford-avk.com. Upserts on slug. Dry-run by default; pass --apply.
//
//   SUPABASE_SERVICE_KEY=… node data/seed-stamford.mjs           # preview
//   SUPABASE_SERVICE_KEY=… node data/seed-stamford.mjs --apply   # write
import { execFileSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'

const PDF = '/Users/ziqianhuang/Downloads/STAMFORD-Industrial-Ratings-Book-Ed-6a.pdf'
const APPLY = process.argv.includes('--apply')
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)

const txt = execFileSync('pdftotext', ['-layout', PDF, '-']).toString()
// S-range has two naming forms: large frames carry a design letter ("S4L1D-C"),
// small frames don't ("S0L1-D") — hence the optional [A-Z]? before the dash.
const MODEL_RE = /\b(PI0?\d{2,3}[A-Z]|UC[DI]{1,2}\d{3}[A-Z]|HC[IM]\d{3}[A-Z]|S\d[A-Z]\d[A-Z]?-[A-Z]|P80 [LMH]VSI804[A-Z])\b/g

// family prefix → datasheet-filter term id (from the model dropdown on the site)
const FAMILY = [
  [/^PI0/, 761], [/^PI1/, 763], [/^PI7/, 758],
  [/^HCI444/, 906], [/^HCI544/, 781], [/^HCI63/, 766], [/^HCM/, 766],
  [/^UCI224/, 771], [/^UCI274/, 769], [/^UCDI274/, 787],
  [/^S0L1/, 774], [/^S0L2/, 776], [/^S1L2/, 785],
  [/^S4L1D/, 786], [/^S4L1S/, 767], [/^S4L1M/, 791],
  [/^S5L1D/, 770], [/^S5L1S/, 768], [/^S5L1M/, 1025],
  [/^S6L1D/, 782], [/^S6L1M/, 1020],
  [/^S7L1D/, 1021], [/^S7L1M/, 1271],
  [/^S9H1D/, 1022], [/^S9L1D/, 13226], [/^S9M1D/, 1261],
  [/^P80 LV/, 775], [/^P80 MV/, 788], [/^P80 HV/, 756],
]
const DS_BASE = 'https://www.stamford-avk.com/downloads/data-sheets'
const specUrl = (model) => {
  for (const [re, id] of FAMILY) if (re.test(model)) return `${DS_BASE}?field_datasheet_model_target_id_selective=${id}`
  return DS_BASE // S7H1D etc. have no filter family — fall back to the full datasheet search
}

// readable series = model minus its trailing variant letter ("PI734E"→"PI734", "S4L1D-C"→"S4L1D")
const seriesOf = (model) => model.replace(/-?[A-Z]$/, '').trim()
const slugOf = (m) => 'stamford-' + m.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// poles from the book's "N POLE" section headers
const poles = new Map()
let cur = null
for (const line of txt.split('\n')) {
  const ph = line.match(/\b([246])\s*POLE\b/i)
  if (ph) cur = Number(ph[1])
  for (const m of line.matchAll(MODEL_RE)) {
    const model = m[1].replace(/\s+/g, ' ').trim()
    if (!poles.has(model)) poles.set(model, cur)
    else if (poles.get(model) == null) poles.set(model, cur)
  }
}

// reuse vetted nominal kVA already stored (prime_kva_50hz)
const { data: existing } = await supabase.from('alternators').select('model, prime_kva_50hz').eq('brand', 'Stamford')
const kvaBy = new Map((existing ?? []).map((r) => [r.model, r.prime_kva_50hz]))

const records = [...poles.keys()].sort().map((model) => ({
  slug: slugOf(model),
  brand: 'Stamford',
  model,
  series: seriesOf(model),
  poles: poles.get(model),
  kva: kvaBy.get(model) ?? null,
  spec_sheet_url: specUrl(model),
  status: 'active',
}))

console.log(`${records.length} models  ·  ${records.filter((r) => r.kva != null).length} with kVA  ·  ${APPLY ? 'APPLYING' : 'dry run'}`)
for (const r of records) console.log(`  ${r.model.padEnd(16)} ${String(r.series).padEnd(10)} ${r.poles}p  ${String(r.kva ?? '—').padEnd(7)}`)

if (APPLY) {
  const { error } = await supabase.from('alternators').upsert(records, { onConflict: 'slug' })
  if (error) { console.error('✗', error.message); process.exit(1) }
  console.log(`\n✓ upserted ${records.length} Stamford alternators`)
}
