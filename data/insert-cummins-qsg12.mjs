import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import fs from 'fs'

// Add the two Cummins QSG12 G-drive models from the official spec sheets (user-provided):
//   QSG12-G3 → mart.cummins.com/.../0064185.pdf
//   QSG12-G4 → mart.cummins.com/.../0064186.pdf
// 11.8 L, in-line 6, HPCR, air-to-air charge cooled. Power = net engine output (kWm) +
// typical genset output (kWe/kVA), straight from the sheets. PDFs are uploaded & linked.
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'

const COMMON = {
  brand: 'Cummins',
  series: 'QSG12',
  status: 'active',
  displacement_l: 11.8,
  cylinders: 6,
  configuration: 'Turbocharged, Charge Air Cooled',
  rpm_rated: 1500,
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-cooled',
  origin: 'China',
  weight_kg: 1110,
  length_mm: 2293,
  width_mm: 1083,
  height_mm: 1705,
}

const MODELS = [
  {
    model: 'QSG12-G3', slug: 'cummins-qsg12-g3', file: '/tmp/cum_0064185.pdf',
    fuel_consumption_l_per_hr: 72,
    prime_power_kw_50hz: 317, prime_power_kwe_50hz: 296, prime_power_kva_50hz: 370,
    standby_power_kw_50hz: 350, standby_power_kwe_50hz: 327, standby_power_kva_50hz: 409,
    prime_power_kw_60hz: 362, prime_power_kwe_60hz: 340, prime_power_kva_60hz: 425,
    standby_power_kw_60hz: 393, standby_power_kwe_60hz: 370, standby_power_kva_60hz: 462,
    description: 'Cummins QSG12-G3 11.8L in-line 6-cylinder diesel engine for generator sets. 296 kWe prime / 327 kWe standby at 50Hz (340 / 370 kWe at 60Hz). Cummins High Pressure Common Rail fuel system, air-to-air charge cooled.',
  },
  {
    model: 'QSG12-G4', slug: 'cummins-qsg12-g4', file: '/tmp/cum_0064186.pdf',
    fuel_consumption_l_per_hr: 82,
    prime_power_kw_50hz: 356, prime_power_kwe_50hz: 333, prime_power_kva_50hz: 416,
    standby_power_kw_50hz: 390, standby_power_kwe_50hz: 364, standby_power_kva_50hz: 455,
    prime_power_kw_60hz: 408, prime_power_kwe_60hz: 383, prime_power_kva_60hz: 479,
    standby_power_kw_60hz: 445, standby_power_kwe_60hz: 418, standby_power_kva_60hz: 523,
    description: 'Cummins QSG12-G4 11.8L in-line 6-cylinder diesel engine for generator sets. 333 kWe prime / 364 kWe standby at 50Hz (383 / 418 kWe at 60Hz). Cummins High Pressure Common Rail fuel system, air-to-air charge cooled.',
  },
]

for (const m of MODELS) {
  const { file, ...specs } = m
  // guard against duplicates
  const { data: existing } = await supabase.from('engines').select('id').eq('slug', m.slug).limit(1)
  if (existing?.length) { console.log(`skip ${m.model}: slug already exists`); continue }

  const id = randomUUID()
  const { error: insErr } = await supabase.from('engines').insert({ id, ...COMMON, ...specs })
  if (insErr) { console.error(`insert ${m.model} failed: ${insErr.message}`); continue }

  // upload + link the spec sheet
  const buf = fs.readFileSync(file)
  const STORE = `cummins/spec-sheets/${m.model}.pdf`
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(STORE, buf, { contentType: 'application/pdf', upsert: true })
  if (upErr) { console.error(`upload ${m.model} failed: ${upErr.message}`); continue }
  await supabase.from('engine_pdfs').delete().eq('engine_id', id).eq('storage_path', STORE)
  const { error: pdfErr } = await supabase.from('engine_pdfs').insert({
    engine_id: id, type: 'datasheet', label: `Cummins ${m.model} Spec Sheet`, storage_path: STORE, file_size_bytes: buf.length,
  })
  if (pdfErr) { console.error(`pdf link ${m.model} failed: ${pdfErr.message}`); continue }
  console.log(`✓ added ${m.model} (${m.slug}) + datasheet (${Math.round(buf.length / 1024)}KB)`)
}
