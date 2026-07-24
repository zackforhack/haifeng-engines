// Correct FPT Tier 3 commercial records and attach the current official brochure.
// Dry-run by default. Use --apply to update Supabase.

import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'
import os from 'os'
import path from 'path'

const apply = process.argv.includes('--apply')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
)
const bucket = 'engine-pdfs'
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-certified-batch-07')

const common = {
  brand: 'FPT',
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  origin: 'Italy',
  emissions_standard: 'U.S. EPA Tier 3',
  certifications: ['U.S. EPA Tier 3'],
}

const variants = [
  ['fpt-nef45sm1x', 'NEF45SM1X', 'N45 Series', 4, 'L4', 4.5, 52, 47, 59, 57, 52, 65],
  ['fpt-nef45sm2x', 'NEF45SM2X', 'N45 Series', 4, 'L4', 4.5, 61, 55, 69, 67, 61, 76],
  ['fpt-nef45-te1p', 'NEF45 TE1P', 'N45 Series', 4, 'L4', 4.5, 79, 72, 90, 87, 79, 99],
  ['fpt-nef45-te2p', 'NEF45 TE2P', 'N45 Series', 4, 'L4', 4.5, 111, 102, 128, 122, 112, 141],
  ['fpt-nef67-tm1x', 'NEF67 TM1X', 'N67 Series', 6, 'L6', 6.7, 128, 117, 147, 141, 129, 162],
  ['fpt-nef67-te1pv', 'NEF67 TE1PV', 'N67 Series', 6, 'L6', 6.7, 141, 130, 163, 156, 144, 180],
  ['fpt-nef67-te2pv', 'NEF67 TE2PV', 'N67 Series', 6, 'L6', 6.7, 182, 170, 212, 201, 187, 234],
  ['fpt-nef67-te3pv', 'NEF67 TE3PV', 'N67 Series', 6, 'L6', 6.7, 191, 178, 223, 211, 197, 246],
  ['fpt-c87-te3f', 'C87 TE3F', 'Cursor 9 Series', 6, 'L6', 8.7, 251, 233, 292, 280, 260, 326],
  ['fpt-c87-te1pv', 'C87 TE1PV', 'Cursor 9 Series', 6, 'L6', 8.7, 291, 271, 338, 321, 299, 373],
  ['fpt-c13-te2f', 'C13 TE2F', 'Cursor 13 Series', 6, 'L6', 12.9, 301, 286, 357, 334, 317, 397],
]

const records = variants.map(([
  slug,
  model,
  series,
  cylinders,
  configuration,
  displacement_l,
  primeKwm,
  primeKwe,
  primeKva,
  standbyKwm,
  standbyKwe,
  standbyKva,
]) => ({
  ...common,
  slug,
  model,
  series,
  cylinders,
  configuration,
  displacement_l,
  power_kw: standbyKwm,
  prime_power_kw_60hz: primeKwm,
  prime_power_kwe_60hz: primeKwe,
  prime_power_kva_60hz: primeKva,
  standby_power_kw_60hz: standbyKwm,
  standby_power_kwe_60hz: standbyKwe,
  standby_power_kva_60hz: standbyKva,
  description:
    `FPT ${model} ${displacement_l} L ${configuration} diesel engine for `
    + `generator sets. At 60 Hz and 1800 RPM, FPT publishes ${primeKwm} kWm / `
    + `${primeKwe} kWe prime and ${standbyKwm} kWm / ${standbyKwe} kWe standby. `
    + 'U.S. EPA Tier 3.',
}))

const document = {
  source:
    'https://www.fptindustrial.com/-/media/FPT/Brochures/Engines/POWER-GEN/'
    + 'FPT_Power_Generation_Brochure_EN.pdf?rev=-1',
  storagePath: 'fpt/brochures/fpt-power-generation-brochure-en.pdf',
  label: 'FPT Industrial Power Generation Brochure',
  type: 'brochure',
}

async function downloadPdf(source, destination) {
  const response = await fetch(source, {
    headers: { 'User-Agent': 'Mozilla/5.0 HaifengEngineDatabase/1.0' },
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
  })
  if (!response.ok) throw new Error(`${source}: HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${source}: response is not a PDF`)
  }
  fs.writeFileSync(destination, buffer)
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const slugs = records.map((record) => record.slug)
const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug, model')
  .in('slug', slugs)
if (existingError) throw existingError

const existingSlugs = new Set(existing.map((engine) => engine.slug))
console.table(records.map((record) => ({
  action: existingSlugs.has(record.slug) ? 'update' : 'missing',
  slug: record.slug,
  model: record.model,
  prime_kwe_60hz: record.prime_power_kwe_60hz,
  standby_kwe_60hz: record.standby_power_kwe_60hz,
})))

if (existing.length !== records.length) {
  throw new Error(`Expected ${records.length} existing FPT pages; found ${existing.length}`)
}

if (!apply) {
  console.log(`\nDry run: ${records.length} FPT Tier 3 records will be corrected.`)
  process.exit(0)
}

const { error: upsertError } = await supabase
  .from('engines')
  .upsert(records, { onConflict: 'slug' })
if (upsertError) throw upsertError

fs.mkdirSync(tempDir, { recursive: true })
const localPath = path.join(tempDir, path.basename(document.storagePath))
await downloadPdf(document.source, localPath)
const uploaded = await uploadPdf(
  supabase,
  bucket,
  localPath,
  document.storagePath,
)
if (!uploaded.ok) throw new Error(`Could not upload ${document.storagePath}`)

const engineIds = existing.map((engine) => engine.id)
const fileSize = fs.statSync(localPath).size
const { data: linked, error: linkedError } = await supabase
  .from('engine_pdfs')
  .select('engine_id')
  .eq('storage_path', document.storagePath)
  .in('engine_id', engineIds)
if (linkedError) throw linkedError

const linkedIds = new Set(linked.map((row) => row.engine_id))
const links = engineIds
  .filter((engineId) => !linkedIds.has(engineId))
  .map((engineId) => ({
    engine_id: engineId,
    type: document.type,
    label: document.label,
    storage_path: document.storagePath,
    file_size_bytes: fileSize,
  }))
if (links.length) {
  const { error: linkError } = await supabase.from('engine_pdfs').insert(links)
  if (linkError) throw linkError
}

console.log(
  `Corrected ${records.length} FPT Tier 3 pages and added ${links.length} brochure links.`,
)
