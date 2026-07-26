// Complete Cummins' current 1800 RPM North American gaseous generator range
// below 125 kWe from the official 2025 model-range card.
// Dry-run by default; pass --apply to write and link the official PDF.

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
  'https://www.cummins.com/sites/default/files/2025-04/'
  + 'gaseous-generator-sets-rating-cards-north-america-60hz-2025.pdf'
const storagePath =
  'cummins/gas/north-america-gaseous-generator-range-60hz-2025.pdf'
const label = 'Cummins North America Gaseous Generator Range 60 Hz 2025'
const localPath = path.join(os.tmpdir(), path.basename(storagePath))

const platforms = {
  'QSJ2.4G': {
    displacement_l: 2.4,
    cylinders: 4,
    configuration: 'Inline-4 Spark Ignition',
  },
  'QSJ5.9G-G1': {
    displacement_l: 5.9,
    cylinders: 6,
    configuration: 'Inline-6 Turbocharged Spark Ignition',
  },
  'QSJ5.9G-G2': {
    displacement_l: 5.9,
    cylinders: 6,
    configuration: 'Inline-6 Turbocharged Spark Ignition',
  },
  'QSJ5.9G-G3': {
    displacement_l: 5.9,
    cylinders: 6,
    configuration: 'Inline-6 Turbocharged Spark Ignition',
  },
}

const ratings = [
  ['C20N6', 'QSJ2.4G', 20, 25],
  ['C25N6', 'QSJ2.4G', 25, 31],
  ['C30N6', 'QSJ2.4G', 30, 38],
  ['C36N6', 'QSJ2.4G', 36, 45],
  ['C40N6', 'QSJ2.4G', 40, 50],
  ['C45N6', 'QSJ5.9G-G1', 45, 56],
  ['C50N6', 'QSJ5.9G-G1', 50, 63],
  ['C60N6', 'QSJ5.9G-G2', 60, 75],
  ['C70N6', 'QSJ5.9G-G3', 70, 88],
  ['C80N6', 'QSJ5.9G-G3', 80, 100],
  ['C100N6', 'QSJ5.9G-G3', 100, 125],
]

const records = ratings.map(([model, engineModel, kwe, kva]) => ({
  slug: `cummins-${model.toLowerCase()}`,
  brand: 'Cummins',
  model,
  series: `${engineModel} Genset`,
  status: 'active',
  origin: 'United States',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  emissions_standard: 'U.S. EPA Stationary',
  certifications: [
    'U.S. EPA Stationary',
    'U.S. EPA NSPS',
    'U.S. EPA Stationary Emergency',
  ],
  rpm_rated: 1800,
  rpm_max: 1800,
  standby_power_kwe_60hz: kwe,
  standby_power_kva_60hz: kva,
  ...platforms[engineModel],
  description:
    `Cummins ${model} is a ${kwe} kWe / ${kva} kVA, 60 Hz gaseous `
    + `standby generator set powered by the ${engineModel} engine. Cummins' `
    + 'official 2025 North American model-range card lists the set for '
    + 'natural gas or propane and identifies EPA NSPS certification. This '
    + 'database uses the published natural-gas generator rating.',
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
  standby_kwe_60hz: record.standby_power_kwe_60hz,
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
  .eq('storage_path', storagePath)
  .in('engine_id', engineIds)
if (linkedError) throw linkedError
const linkedIds = new Set(linked.map((row) => row.engine_id))
const rows = engineIds
  .filter((engineId) => !linkedIds.has(engineId))
  .map((engineId) => ({
    engine_id: engineId,
    type: 'datasheet',
    label,
    storage_path: storagePath,
    file_size_bytes: fs.statSync(localPath).size,
  }))
if (rows.length) {
  const { error } = await supabase.from('engine_pdfs').insert(rows)
  if (error) throw error
}

console.log(`Applied ${records.length} Cummins gaseous generator records.`)
