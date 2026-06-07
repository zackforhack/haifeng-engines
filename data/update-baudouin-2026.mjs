// Reconcile Baudouin against the 2026 PowerKit Rating Cards (50 Hz + 60 Hz).
// Sections parsed: Gas (COP/PRP), Regulated diesel (PRP/ESP + emissions),
// Unregulated diesel (PRP/ESP). Data Center (DCP) is intentionally skipped.
// Mapping: PRP -> prime, ESP -> standby (kWm gross -> _kw, kWe -> _kwe, kVA -> _kva).
// Gas: prime = PRP if present else COP; standby blank. Rows are combined by model
// stem (e.g. 4M06G25/5 + 4M06G25/6 -> one row with both frequencies).
// Existing rows are UPDATED in place (only the columns below); new models inserted.
// Dry-run by default; pass --apply to write.
import { execFileSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const CARD50 = '/Users/ziqianhuang/Downloads/2026  Baudouin PowerKit Rating Card 50hz.pdf'
const CARD60 = '/Users/ziqianhuang/Downloads/2026  Baudouin PowerKit Rating Card 60hz.pdf'

const num = (t) => (/^[\d.]+$/.test(t) ? Number(t) : null)
const cleanModel = (t) => t.replace(/[\^*]+$/, '')               // strip footnote markers ^ *
const stemOf = (m) => m.replace(/\/[56S].*$/i, '')               // drop /5 //6 //S suffix
const emissionMap = (e) => {
  if (/stage\s*v\b/i.test(e)) return 'Euro Stage V'
  if (/stage\s*iiia/i.test(e)) return 'Euro Stage IIIA'
  if (/tier\s*2/i.test(e)) return 'U.S. EPA Tier 2'
  return 'Unregulated'
}
const cylConfig = (m) => {
  const n = Number(m.match(/^(\d+)M/)?.[1])
  if (!n) return {}
  return { cylinders: n, configuration: n <= 6 ? `L${n}` : `V${n}` }
}

// Parse one card into { stem: record } for a given frequency (50|60).
function parseCard(pdf, hz) {
  const txt = execFileSync('pdftotext', ['-layout', pdf, '-']).toString()
  const out = new Map()
  let section = null
  for (const raw of txt.split('\n')) {
    if (/GAS ENGINES/.test(raw)) { section = 'gas'; continue }
    if (/DATA CENTER DIESEL/.test(raw)) { section = 'skip'; continue }
    if (/REGULATED DIESEL/.test(raw)) { section = 'regulated'; continue }
    if (/UNREGULATED DIESEL/.test(raw)) { section = 'unregulated'; continue }
    if (!section || section === 'skip') continue

    const cells = raw.trim().split(/\s{2,}/)
    if (cells.length < 4) continue
    const model = cleanModel(cells[0])
    if (!/^\d+M\d+[A-Z0-9]*\/[56S]/i.test(model)) continue
    const rest = cells.slice(1)
    // first 6 value columns (number or "/")
    const vals = []
    for (const c of rest) {
      if (vals.length >= 6) break
      if (/^[\d.]+$/.test(c) || c === '/') vals.push(c === '/' ? null : Number(c))
      else if (vals.length === 0) continue // skip stray leading text
      else break
    }
    const tail = rest.join(' ')
    const stem = stemOf(model)
    const rec = { model, stem, hz }

    if (section === 'gas') {
      // [COP_kWm, PRP_kWm, COP_kWe, COP_kVA, PRP_kWe, PRP_kVA]
      const [copKw, prpKw, copKwe, copKva, prpKwe, prpKva] = vals
      rec.fuel_type = /bio/i.test(tail) ? 'Biogas' : 'Natural Gas'
      rec.ignition_type = 'Spark Ignition'
      rec.emissions_standard = 'Unregulated'
      rec.prime_kw = prpKw ?? copKw
      rec.prime_kwe = prpKwe ?? copKwe
      rec.prime_kva = prpKva ?? copKva
    } else {
      // diesel: [PRP_kWm, ESP_kWm, PRP_kWe, PRP_kVA, ESP_kWe, ESP_kVA]
      const [prpKw, espKw, prpKwe, prpKva, espKwe, espKva] = vals
      rec.fuel_type = 'Diesel'
      rec.ignition_type = 'Compression Ignition'
      rec.emissions_standard = section === 'regulated' ? emissionMap(tail) : 'Unregulated'
      rec.prime_kw = prpKw; rec.prime_kwe = prpKwe; rec.prime_kva = prpKva
      rec.standby_kw = espKw; rec.standby_kwe = espKwe; rec.standby_kva = espKva
    }
    out.set(stem, rec)
  }
  return out
}

const c50 = parseCard(CARD50, 50)
const c60 = parseCard(CARD60, 60)
console.log(`Parsed 50Hz: ${c50.size} stems · 60Hz: ${c60.size} stems`)

// Merge by stem into combined records
const stems = new Set([...c50.keys(), ...c60.keys()])
const slugOf = (m) => 'baudouin-' + m.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const records = []
for (const stem of stems) {
  const r50 = c50.get(stem), r60 = c60.get(stem)
  const base = r50 ?? r60
  const model = r50?.model ?? r60.model // prefer the /5 designation as canonical
  const rec = {
    slug: slugOf(model),
    brand: 'Baudouin',
    model,
    status: 'active',
    fuel_type: base.fuel_type,
    ignition_type: base.ignition_type,
    cooling_method: 'Liquid-Cooled',
    emissions_standard: base.emissions_standard,
    ...cylConfig(model),
  }
  const put = (r, hz) => {
    if (!r) return
    rec[`prime_power_kw_${hz}hz`] = r.prime_kw ?? null
    rec[`prime_power_kwe_${hz}hz`] = r.prime_kwe ?? null
    rec[`prime_power_kva_${hz}hz`] = r.prime_kva ?? null
    if ('standby_kw' in r) {
      rec[`standby_power_kw_${hz}hz`] = r.standby_kw ?? null
      rec[`standby_power_kwe_${hz}hz`] = r.standby_kwe ?? null
      rec[`standby_power_kva_${hz}hz`] = r.standby_kva ?? null
    }
  }
  put(r50, 50); put(r60, 60)
  records.push(rec)
}

// section tallies
const tally = { gas: 0, regulated: 0, unregulated: 0 }
for (const r of records) {
  if (r.ignition_type === 'Spark Ignition') tally.gas++
  else if (r.emissions_standard === 'Unregulated') tally.unregulated++
  else tally.regulated++
}
console.log(`Merged into ${records.length} combined rows  (gas ${tally.gas} · regulated ${tally.regulated} · unregulated ${tally.unregulated})`)

// reconcile with DB
const { data: existing } = await supabase.from('engines').select('id, slug, model').eq('brand', 'Baudouin')
const bySlug = new Map((existing ?? []).map((e) => [e.slug, e]))
const updates = records.filter((r) => bySlug.has(r.slug))
const inserts = records.filter((r) => !bySlug.has(r.slug))
const orphans = (existing ?? []).filter((e) => !records.some((r) => r.slug === e.slug))

console.log(`\nDB has ${existing.length} Baudouin rows`)
console.log(`  → UPDATE ${updates.length}  ·  INSERT ${inserts.length}`)
console.log(`  → existing rows NOT in 2026 cards (left untouched): ${orphans.length}${orphans.length ? ' → ' + orphans.map((o) => o.model).join(', ') : ''}`)

console.log('\nSample inserts:')
for (const r of inserts.slice(0, 10)) console.log(`  ${r.model.padEnd(15)} ${r.fuel_type.padEnd(12)} ${String(r.emissions_standard).padEnd(16)} P50e=${r.prime_power_kwe_50hz ?? '-'} S50e=${r.standby_power_kwe_50hz ?? '-'} P60e=${r.prime_power_kwe_60hz ?? '-'}`)

if (APPLY) {
  let okU = 0, okI = 0
  for (const r of updates) {
    const { slug, brand, model, ...fields } = r
    const { error } = await supabase.from('engines').update(fields).eq('slug', slug)
    if (error) console.error(`  ✗ update ${model}: ${error.message}`); else okU++
  }
  for (let i = 0; i < inserts.length; i += 50) {
    const { error } = await supabase.from('engines').insert(inserts.slice(i, i + 50))
    if (error) console.error(`  ✗ insert batch: ${error.message}`); else okI += Math.min(50, inserts.length - i)
  }
  console.log(`\n✓ updated ${okU}, inserted ${okI}`)
} else {
  console.log('\n(dry run — pass --apply to write)')
}
