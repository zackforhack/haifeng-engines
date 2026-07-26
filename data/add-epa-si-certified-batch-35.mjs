// Reconcile current Cummins QSJ2.4G package certification scope and ensure
// the official 20-815 kW gaseous range brochure is linked to each model.
// Dry-run by default; pass --apply to update and link the official PDF.

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
const certifications = [
  'U.S. EPA Stationary',
  'U.S. EPA Stationary Emergency',
  'U.S. EPA Stationary Non-Emergency',
  'U.S. EPA NSPS',
]

const ratings = [
  ['C20N6', 20, 25],
  ['C25N6', 25, 31],
  ['C30N6', 30, 38],
  ['C36N6', 36, 45],
  ['C40N6', 40, 50],
]
const updates = ratings.map(([model, kwe, kva]) => ({
  slug: `cummins-${model.toLowerCase()}`,
  values: {
    series: 'QSJ2.4G Genset',
    status: 'active',
    emissions_standard: 'U.S. EPA Stationary',
    certifications,
    standby_power_kwe_60hz: kwe,
    standby_power_kva_60hz: kva,
    description:
      `Cummins ${model} is a ${kwe} kWe / ${kva} kVA, 60 Hz standby `
      + 'generator set using the 2.4 L QSJ2.4G spark-ignition engine. '
      + 'Cummins lists the current natural-gas package for EPA stationary '
      + 'emergency and non-emergency applications; the official range '
      + 'brochure identifies EPA emissions certification.',
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
  standby_kwe: update.values.standby_power_kwe_60hz,
  certification_scope: 'emergency + non-emergency',
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
    label: 'Cummins 20-815 kW 60 Hz Standby Gas Generators',
    storage_path: storagePath,
    file_size_bytes: fs.statSync(localPath).size,
  }))
if (rows.length) {
  const { error } = await supabase.from('engine_pdfs').insert(rows)
  if (error) throw error
}

console.log(`Applied ${updates.length} Cummins QSJ2.4G updates.`)
