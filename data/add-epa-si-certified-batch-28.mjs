// Add EPA-certified Cummins 350-500 kWe 60 Hz natural-gas packages.
// Dry-run by default; pass --apply to write and link the official brochure.

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
const source = 'https://mart.cummins.com/imagelibrary/data/assetfiles/0061933.pdf'
const storagePath =
  'cummins/gaseous/standby-gas-generators-20-815kw-60hz.pdf'
const localPath = path.join(os.tmpdir(), path.basename(storagePath))

const common = {
  brand: 'Cummins',
  status: 'active',
  origin: 'United States',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  emissions_standard: 'U.S. EPA Stationary',
  certifications: [
    'U.S. EPA Stationary',
    'U.S. EPA Stationary Emergency',
    'U.S. EPA Stationary Non-Emergency',
    'U.S. EPA NSPS',
  ],
  rpm_rated: 1800,
  rpm_max: 1800,
}

const records = [
  {
    ...common,
    slug: 'cummins-c350n6',
    model: 'C350N6',
    series: 'KTA19SLB Genset',
    cylinders: 6,
    displacement_l: 19,
    configuration: 'Inline-6 Lean-Burn Turbocharged Aftercooled',
    standby_power_kwe_60hz: 350,
    standby_power_kva_60hz: 437,
  },
  ...[
    ['C400N6', 400, 500],
    ['C450N6', 450, 562],
    ['C500N6B', 500, 625],
  ].map(([model, kwe, kva]) => ({
    ...common,
    slug: `cummins-${model.toLowerCase()}`,
    model,
    series: 'GTA28E Genset',
    cylinders: 12,
    displacement_l: 28,
    configuration: 'V12 Stoichiometric Turbocharged Aftercooled',
    standby_power_kwe_60hz: kwe,
    standby_power_kva_60hz: kva,
  })),
].map((record) => ({
  ...record,
  description:
    `Cummins ${record.model} is a ${record.standby_power_kwe_60hz} kWe `
    + 'standby, 60 Hz natural-gas generator set operating at 1800 RPM. '
    + `Cummins lists the ${record.series.replace(' Genset', '')} engine `
    + 'and EPA stationary emergency/non-emergency compliance.',
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
  standby_kwe: record.standby_power_kwe_60hz,
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
    label: 'Cummins 20-815 kW 60 Hz Standby Gas Generators',
    storage_path: storagePath,
    file_size_bytes: fs.statSync(localPath).size,
  }))
if (rows.length) {
  const { error } = await supabase.from('engine_pdfs').insert(rows)
  if (error) throw error
}

console.log(`Applied ${records.length} EPA-certified Cummins records.`)
