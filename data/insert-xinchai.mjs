// Add the Xinchai brand from the 2026 catalog (small diesel/LPG genset engines,
// 13–105 kW). Power is engine kW at genset speeds (3000/1500 rpm = 50 Hz, 1800 =
// 60 Hz). Stored in the _kw fields (mechanical); kWe not published. Dry-run unless --apply.
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const txt = readFileSync('/tmp/xinchai.txt', 'utf8')

// rows: "No  Model  Displ  Standby(kW/rpm[，kW/rpm])  Rated(kW/rpm[，kW/rpm])"
const ROW = /^\s*\d+\s+([0-9A-Z]+)\s+([\d.]+)\s+([\d.]+\/\d+(?:，[\d.]+\/\d+)?)\s+([\d.]+\/\d+(?:，[\d.]+\/\d+)?)/
// 1800/3600 rpm = 60 Hz; 1500/3000 rpm = 50 Hz (small 2-pole sets run at 3000/3600)
const parsePow = (s) => s.split('，').map((p) => { const [kw, rpm] = p.split('/').map(Number); return { kw, rpm, hz: rpm === 1800 || rpm === 3600 ? 60 : 50 } })

const seen = new Set()
const records = []
for (const line of txt.split('\n')) {
  const m = line.match(ROW)
  if (!m) continue
  const model = m[1]
  if (seen.has(model)) continue
  seen.add(model)
  const displacement_l = Number(m[2])
  const standby = parsePow(m[3])
  const rated = parsePow(m[4])

  const cylinders = /^3/.test(model) ? 3 : 4
  const isLpg = /LPG/i.test(model)
  const rec = {
    slug: 'xinchai-' + model.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    brand: 'Xinchai',
    model,
    status: 'active',
    origin: 'China',
    fuel_type: isLpg ? 'LPG' : 'Diesel',
    ignition_type: isLpg ? 'Spark Ignition' : 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    configuration: `L${cylinders}`,
    cylinders,
    displacement_l,
    emissions_standard: 'Unregulated',
    rpm_rated: rated[0].rpm,
  }
  for (const p of rated) { rec[`prime_power_kw_${p.hz}hz`] = p.kw }
  for (const p of standby) { rec[`standby_power_kw_${p.hz}hz`] = p.kw }
  records.push(rec)
}

console.log(`Parsed ${records.length} Xinchai models  ·  ${APPLY ? 'APPLYING' : 'dry run'}`)
for (const r of records) {
  console.log(`  ${r.model.padEnd(14)} ${r.displacement_l}L ${r.cylinders}cyl ${r.fuel_type.padEnd(7)} P50=${r.prime_power_kw_50hz ?? '-'} S50=${r.standby_power_kw_50hz ?? '-'} P60=${r.prime_power_kw_60hz ?? '-'} ${r.rpm_rated}rpm`)
}

if (APPLY) {
  const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id')
  if (error) { console.error('✗', error.message); process.exit(1) }
  console.log(`\n✓ upserted ${data.length} Xinchai engines`)
}
