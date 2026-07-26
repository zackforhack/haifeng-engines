// Correct GTA855E duty ratings and add its separately certified continuous
// calibration from Cummins' official G-Drive gas-engine guide.
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
const source = 'https://mart.cummins.com/imagelibrary/data/assetfiles/0057733.pdf'
const storagePath = 'cummins/gas/g-drive-gas-engine-product-guide.pdf'
const localPath = path.join(os.tmpdir(), path.basename(storagePath))
const certifications = ['U.S. EPA Stationary', 'U.S. EPA NSPS', 'MOH']

const records = [
  {
    slug: 'cummins-gta855e',
    values: {
      model: 'GTA855E',
      series: 'GTA855 Gas Series',
      configuration: 'Inline-6 Turbocharged Aftercooled',
      power_kw: 286,
      power_hp: 383,
      standby_power_kw_60hz: 286,
      standby_power_kwe_60hz: 245,
      standby_power_kva_60hz: 307,
      prime_power_kw_60hz: 262,
      prime_power_kwe_60hz: 225,
      prime_power_kva_60hz: 281,
      emissions_standard: 'U.S. EPA Stationary',
      certifications,
      description:
        'Cummins GTA855E is a 14 L stoichiometric natural-gas '
        + 'generator-drive engine. The official G-Drive guide publishes '
        + '286 kWm standby with an estimated 245 kWe output and 262 kWm '
        + 'prime with an estimated 225 kWe output at 1800 RPM. Listed '
        + 'fuel ratings carry EPA NSPS and MOH certification.',
    },
  },
  {
    slug: 'cummins-gta855e-continuous',
    values: {
      brand: 'Cummins',
      model: 'GTA855E (Continuous)',
      series: 'GTA855 Gas Series',
      status: 'active',
      origin: 'United States',
      fuel_type: 'Natural Gas',
      ignition_type: 'Spark Ignition',
      cooling_method: 'Liquid-Cooled',
      cylinders: 6,
      displacement_l: 14,
      configuration: 'Inline-6 Turbocharged Aftercooled',
      power_kw: 191,
      power_hp: 256,
      emissions_standard: 'U.S. EPA Stationary',
      certifications,
      rpm_rated: 1800,
      rpm_max: 1800,
      description:
        'Cummins GTA855E Continuous is the 191 kWm continuous-duty '
        + 'stoichiometric natural-gas calibration of the 14 L inline-six '
        + 'GTA855E at 1800 RPM. Cummins estimates 164 kWe / 205 kVA '
        + 'continuous generator output and identifies matching fuel '
        + 'ratings as EPA NSPS and MOH certified.',
    },
  },
]

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
  mechanical_kw: record.values.power_kw,
  duty: record.slug.endsWith('continuous') ? 'continuous' : 'standby/prime',
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
    ? supabase.from('engines').update(record.values).eq('slug', record.slug)
    : supabase.from('engines').insert({ slug: record.slug, ...record.values })
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
    label: 'Cummins G-Drive Gas Engine Product Guide',
    storage_path: storagePath,
    file_size_bytes: fs.statSync(localPath).size,
  }))
if (rows.length) {
  const { error } = await supabase.from('engine_pdfs').insert(rows)
  if (error) throw error
}

console.log('Applied the Cummins GTA855E duty-rating reconciliation.')
