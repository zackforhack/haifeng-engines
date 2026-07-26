// Enrich Cummins QSJ8.9G packages with the mechanical certification nodes
// published in the EPA annual certification workbook.
// Dry-run by default; pass --apply to update and verify the official brochure.

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
const source = 'https://mart.cummins.com/imagelibrary/data/assetfiles/0075811.pdf'
const storagePath =
  'cummins/gas/qsj8-9g-125-200kw-gaseous-generators.pdf'
const localPath = path.join(os.tmpdir(), path.basename(storagePath))

const updates = [
  ['cummins-c125n6', 'C125N6', 'QSJ8.9G-G2', 125, 156, 179],
  ['cummins-c150n6', 'C150N6', 'QSJ8.9G-G2', 150, 188, 179],
  ['cummins-c175n6b', 'C175N6B', 'QSJ8.9G-G3', 175, 218, 231.2],
  ['cummins-c200n6b', 'C200N6B', 'QSJ8.9G-G3', 200, 250, 231.2],
].map(([slug, model, engineModel, kwe, kva, mechanicalKw]) => ({
  slug,
  values: {
    series: `${engineModel} Genset`,
    configuration: 'Inline-6 Turbocharged',
    power_kw: mechanicalKw,
    standby_power_kw_60hz: mechanicalKw,
    standby_power_kwe_60hz: kwe,
    standby_power_kva_60hz: kva,
    emissions_standard: 'U.S. EPA Stationary',
    certifications: [
      'U.S. EPA Stationary',
      'U.S. EPA Stationary Emergency',
      'U.S. EPA NSPS',
    ],
    description:
      `Cummins ${model} is a ${kwe} kWe, 60 Hz natural-gas standby `
      + `generator set powered by the 8.9 L inline-six ${engineModel} `
      + `engine at 1800 RPM. Cummins publishes this package in its `
      + `EPA-certified QSJ8.9G range. EPA annual certification data `
      + `records the matching calibration at ${mechanicalKw} kW maximum `
      + 'engine test power.',
  },
}))

const slugs = updates.map((update) => update.slug)
const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (existingError) throw existingError
if (existing.length !== updates.length) {
  const found = new Set(existing.map((engine) => engine.slug))
  throw new Error(`Missing records: ${slugs.filter((slug) => !found.has(slug)).join(', ')}`)
}

console.table(updates.map((update) => ({
  action: 'update',
  slug: update.slug,
  engine: update.values.series,
  mechanical_kw: update.values.power_kw,
  standby_kwe: update.values.standby_power_kwe_60hz,
})))
if (!apply) {
  console.log(`Dry run: ${updates.length} updates and one official PDF link set.`)
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

for (const update of updates) {
  const { error } = await supabase
    .from('engines')
    .update(update.values)
    .eq('slug', update.slug)
  if (error) throw error
}

const uploaded = await uploadPdf(
  supabase,
  'engine-pdfs',
  localPath,
  storagePath,
)
if (!uploaded.ok) throw new Error(`Could not upload ${storagePath}`)

const engineIds = existing.map((engine) => engine.id)
const { data: linked, error: linkedError } = await supabase
  .from('engine_pdfs')
  .select('engine_id')
  .in('engine_id', engineIds)
  .eq('storage_path', storagePath)
if (linkedError) throw linkedError
const linkedIds = new Set(linked.map((row) => row.engine_id))
const rows = existing
  .filter((engine) => !linkedIds.has(engine.id))
  .map((engine) => ({
    engine_id: engine.id,
    type: 'datasheet',
    label: 'Cummins QSJ8.9G 125-200 kW Gaseous Generators',
    storage_path: storagePath,
    file_size_bytes: fs.statSync(localPath).size,
  }))
if (rows.length) {
  const { error } = await supabase.from('engine_pdfs').insert(rows)
  if (error) throw error
}

console.log(`Applied ${updates.length} Cummins QSJ8.9G enrichments.`)
