// Add current Cummins continuous-duty gas packages whose range card makes no
// EPA certification claim. Emissions fields intentionally remain empty.
// Dry-run by default; pass --apply to write and link the official range card.

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const apply = process.argv.includes('--apply')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY
if (!url || !key) throw new Error('Supabase credentials are required')

const supabase = createClient(url, key)
const source =
  'https://www.cummins.com/sites/default/files/2025-09/'
  + 'north-america-60-model-range-2025.pdf'
const storagePath =
  'cummins/gaseous/north-america-60hz-model-range-2025.pdf'
const localPath = path.join(os.tmpdir(), path.basename(storagePath))

const common = {
  brand: 'Cummins',
  status: 'active',
  origin: 'United States',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  emissions_standard: null,
  certifications: null,
  rpm_rated: 1800,
  rpm_max: 1800,
}

const records = [
  {
    ...common,
    slug: 'cummins-c1000n6c',
    model: 'C1000N6C',
    series: 'QSK60G Genset',
    cylinders: 16,
    displacement_l: 60.2,
    configuration: 'V16 Lean-Burn Turbocharged Aftercooled',
    prime_power_kwe_60hz: 1000,
    prime_power_kva_60hz: 1250,
  },
  {
    ...common,
    slug: 'cummins-c1100n6c',
    model: 'C1100N6C',
    series: 'QSK60G Genset',
    cylinders: 16,
    displacement_l: 60.2,
    configuration: 'V16 Lean-Burn Turbocharged Aftercooled',
    prime_power_kwe_60hz: 1100,
    prime_power_kva_60hz: 1375,
  },
  ...[
    ['C1600N6CD', 1600, 2000],
    ['C1800N6CD', 1800, 2250],
    ['C2000N6CD', 2000, 2500],
  ].map(([model, kwe, kva]) => ({
    ...common,
    slug: `cummins-${model.toLowerCase()}`,
    model,
    series: 'HSK78G Genset',
    cylinders: 12,
    displacement_l: 78,
    configuration: 'V12 Lean-Burn Turbocharged Aftercooled',
    prime_power_kwe_60hz: kwe,
    prime_power_kva_60hz: kva,
  })),
].map((record) => ({
  ...record,
  description:
    `Cummins ${record.model} is a ${record.prime_power_kwe_60hz} kWe `
    + 'continuous-duty, 60 Hz natural-gas generator set using the '
    + `${record.series.replace(' Genset', '')} engine at 1800 RPM. `
    + 'The official 2025 North American range card does not publish an '
    + 'EPA certification for this model, so no emissions claim is assigned.',
}))

const slugs = records.map((record) => record.slug)
const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (existingError) throw existingError
const existingSlugs = new Set(existing.map((engine) => engine.slug))

console.table(records.map((record) => ({
  action: existingSlugs.has(record.slug) ? 'update' : 'insert',
  slug: record.slug,
  engine: record.series,
  continuous_kwe: record.prime_power_kwe_60hz,
  emissions: record.emissions_standard,
})))
if (!apply) {
  console.log(
    `Dry run: ${existing.length} updates and `
    + `${records.length - existing.length} inserts.`,
  )
  process.exit(0)
}

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
fs.writeFileSync(localPath, buffer)

for (const record of records) {
  const query = existingSlugs.has(record.slug)
    ? supabase.from('engines').update(record).eq('slug', record.slug)
    : supabase.from('engines').insert(record)
  const { error } = await query
  if (error) throw error
}

const { data: saved, error: savedError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (savedError) throw savedError
if (saved.length !== records.length) {
  throw new Error(`Expected ${records.length} records; found ${saved.length}`)
}

const uploaded = await uploadPdf(
  supabase,
  'engine-pdfs',
  localPath,
  storagePath,
)
if (!uploaded.ok) throw new Error(`Could not upload ${storagePath}`)

const engineIds = saved.map((engine) => engine.id)
const { data: linked, error: linkedError } = await supabase
  .from('engine_pdfs')
  .select('engine_id')
  .in('engine_id', engineIds)
  .eq('storage_path', storagePath)
if (linkedError) throw linkedError
const linkedIds = new Set(linked.map((row) => row.engine_id))
const rows = saved
  .filter((engine) => !linkedIds.has(engine.id))
  .map((engine) => ({
    engine_id: engine.id,
    type: 'datasheet',
    label: 'Cummins North America 60 Hz Gaseous Model Range 2025',
    storage_path: storagePath,
    file_size_bytes: fs.statSync(localPath).size,
  }))
if (rows.length) {
  const { error } = await supabase.from('engine_pdfs').insert(rows)
  if (error) throw error
}

console.log(`Applied ${records.length} Cummins continuous-duty records.`)
