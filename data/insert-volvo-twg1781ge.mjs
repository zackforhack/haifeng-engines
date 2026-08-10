// Add the Volvo Penta TWG1781GE — a 17.26 L inline-6 spark-ignited gas genset engine
// (60 Hz / 1800 rpm only) — from its product datasheet. Idempotent: upsert on slug,
// upsert the PDF, link engine_pdfs once.
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const PDF_LOCAL = '/Users/ziqianhuang/Downloads/TWG1781GE_SC_PRE_FINAL (1).pdf'
const STORAGE_PATH = 'volvo/twg1781ge.pdf'

const engine = {
  slug: 'volvo-penta-twg1781ge',
  brand: 'Volvo Penta',
  model: 'TWG1781GE',
  status: 'active',
  displacement_l: 17.26,
  cylinders: 6,
  configuration: 'L6',
  rpm_rated: 1800,
  compression_ratio: '13.5:1',
  weight_kg: 1900,
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  emissions_standard: 'U.S. EPA Stationary',
  origin: 'Sweden',
  description:
    'The Volvo Penta TWG1781GE is a 17.26-litre inline-6 spark-ignited gas engine built on the Volvo Penta 17-litre platform for generator sets. It runs on natural gas and biomethane with single-point injection, lambda-controlled combustion and a three-way catalyst for low exhaust emissions, and is certified to U.S. EPA stationary standards. It delivers 414 kWe prime / 456 kWe standby (518 / 570 kVA) at 1800 rpm (60 Hz).',
  // 60 Hz / 1800 rpm (kWm net w/ fan, kWe, kVA @ 0.8 pf)
  prime_power_kw_60hz: 441,
  prime_power_kwe_60hz: 414,
  prime_power_kva_60hz: 518,
  standby_power_kw_60hz: 485,
  standby_power_kwe_60hz: 456,
  standby_power_kva_60hz: 570,
}

// 1) upsert the engine row
const { data: up, error: upErr } = await supabase
  .from('engines')
  .upsert(engine, { onConflict: 'slug' })
  .select('id, model')
  .single()
if (upErr) { console.error('✗ engine upsert:', upErr.message); process.exit(1) }
console.log(`✓ engine ${up.model} (${up.id})`)

// 2) upload the datasheet PDF (upsert)
const buf = readFileSync(PDF_LOCAL)
const { error: ulErr } = await supabase.storage
  .from('engine-pdfs')
  .upload(STORAGE_PATH, buf, { contentType: 'application/pdf', upsert: true })
if (ulErr) { console.error('✗ pdf upload:', ulErr.message); process.exit(1) }
console.log(`✓ uploaded ${STORAGE_PATH} (${buf.length} bytes)`)

// 3) link engine_pdfs once
const { data: existing } = await supabase
  .from('engine_pdfs')
  .select('id')
  .eq('engine_id', up.id)
  .eq('storage_path', STORAGE_PATH)
if (existing?.length) {
  console.log('• engine_pdfs link already present')
} else {
  const { error: linkErr } = await supabase.from('engine_pdfs').insert({
    engine_id: up.id,
    type: 'datasheet',
    label: 'Product Datasheet',
    storage_path: STORAGE_PATH,
    file_size_bytes: buf.length,
  })
  if (linkErr) { console.error('✗ engine_pdfs:', linkErr.message); process.exit(1) }
  console.log('✓ linked engine_pdfs')
}

console.log('\nDone.')
