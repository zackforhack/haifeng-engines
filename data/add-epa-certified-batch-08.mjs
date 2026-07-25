// Correct current Perkins 1106D/1204J/1206J 60 Hz ratings from official PDFs.
// Dry-run by default. Use --apply to update Supabase and ensure PDF links.

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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-certified-batch-08')

const common = {
  brand: 'Perkins',
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  origin: 'United Kingdom',
}

const variants = [
  {
    slug: 'perkins-1106d-e70tag2',
    model: '1106D-E70TAG2',
    series: '1100 Series',
    cylinders: 6,
    configuration: 'L6',
    displacement_l: 7.01,
    power_kw: 171,
    prime_power_kw_60hz: 145,
    prime_power_kwe_60hz: 130,
    prime_power_kva_60hz: 162,
    standby_power_kw_60hz: 161,
    standby_power_kwe_60hz: 143,
    standby_power_kva_60hz: 178,
    emissions_standard: 'Euro Stage IIIA / U.S. EPA Tier 3',
  },
  {
    slug: 'perkins-1106d-e70tag3',
    model: '1106D-E70TAG3',
    series: '1100 Series',
    cylinders: 6,
    configuration: 'L6',
    displacement_l: 7.01,
    power_kw: 184,
    prime_power_kw_60hz: 157,
    prime_power_kwe_60hz: 139,
    prime_power_kva_60hz: 174,
    standby_power_kw_60hz: 173,
    standby_power_kwe_60hz: 153,
    standby_power_kva_60hz: 191,
    emissions_standard: 'Euro Stage IIIA / U.S. EPA Tier 3',
  },
  {
    slug: 'perkins-1106d-e70tag4',
    model: '1106D-E70TAG4',
    series: '1100 Series',
    cylinders: 6,
    configuration: 'L6',
    displacement_l: 7.01,
    power_kw: 209,
    prime_power_kw_60hz: 180,
    prime_power_kwe_60hz: 160,
    prime_power_kva_60hz: 200,
    standby_power_kw_60hz: 199,
    standby_power_kwe_60hz: 175,
    standby_power_kva_60hz: 219,
    emissions_standard: 'Euro Stage IIIA / U.S. EPA Tier 3',
  },
  {
    slug: 'perkins-1106d-e70tag5',
    model: '1106D-E70TAG5',
    series: '1100 Series',
    cylinders: 6,
    configuration: 'L6',
    displacement_l: 7.01,
    power_kw: 235,
    prime_power_kw_60hz: 203,
    prime_power_kwe_60hz: 182,
    prime_power_kva_60hz: 227,
    standby_power_kw_60hz: 224,
    standby_power_kwe_60hz: 200,
    standby_power_kva_60hz: 250,
    emissions_standard: 'Euro Stage IIIA / U.S. EPA Tier 3',
  },
  {
    slug: 'perkins-1204j-e44ttag2',
    model: '1204J-E44TTAG2',
    series: '1200 Series',
    cylinders: 4,
    configuration: 'L4',
    displacement_l: 4.4,
    power_kw: 129,
    prime_power_kw_60hz: 110,
    prime_power_kwe_60hz: 91,
    prime_power_kva_60hz: 114,
    standby_power_kw_60hz: 122,
    standby_power_kwe_60hz: 100,
    standby_power_kva_60hz: 125,
    emissions_standard: 'Euro Stage V / U.S. EPA Final Tier 4',
  },
  {
    slug: 'perkins-1206j-e70ttag3',
    model: '1206J-E70TTAG3',
    series: '1200 Series',
    cylinders: 6,
    configuration: 'L6',
    displacement_l: 7.01,
    power_kw: 184,
    prime_power_kw_60hz: 158,
    prime_power_kwe_60hz: 135,
    prime_power_kva_60hz: 169,
    standby_power_kw_60hz: 175,
    standby_power_kwe_60hz: 149,
    standby_power_kva_60hz: 186,
    emissions_standard: 'Euro Stage V / U.S. EPA Final Tier 4',
  },
  {
    slug: 'perkins-1206j-e70ttag4',
    model: '1206J-E70TTAG4',
    series: '1200 Series',
    cylinders: 6,
    configuration: 'L6',
    displacement_l: 7.01,
    power_kw: 239,
    prime_power_kw_60hz: 208,
    prime_power_kwe_60hz: 180,
    prime_power_kva_60hz: 225,
    standby_power_kw_60hz: 229,
    standby_power_kwe_60hz: 200,
    standby_power_kva_60hz: 250,
    emissions_standard: 'Euro Stage V / U.S. EPA Final Tier 4',
  },
]

const records = variants.map((record) => ({
  ...common,
  ...record,
  certifications: record.emissions_standard.split(' / '),
  description:
    `Perkins ${record.model} ${record.displacement_l} L ${record.configuration} `
    + `ElectropaK diesel engine for generator sets. At 60 Hz and 1800 RPM, `
    + `Perkins publishes ${record.prime_power_kw_60hz} kWm net / `
    + `${record.prime_power_kwe_60hz} kWe prime and `
    + `${record.standby_power_kw_60hz} kWm net / `
    + `${record.standby_power_kwe_60hz} kWe standby. `
    + `${record.emissions_standard}.`,
}))

const documents = [
  {
    source:
      'https://s7d2.scene7.com/is/content/Caterpillar/'
      + 'CM20210126-a40e3-cffa5',
    storagePath: 'perkins/spec-sheets/1106D-E70TAG-electric-power.pdf',
    label: 'Perkins 1106D-E70TAG Electric Power Engines',
    slugs: [
      'perkins-1106d-e70tag2',
      'perkins-1106d-e70tag3',
      'perkins-1106d-e70tag4',
      'perkins-1106d-e70tag5',
    ],
  },
  {
    source:
      'https://s7d2.scene7.com/is/content/Caterpillar/'
      + 'CM20201201-5a9e6-70e85',
    storagePath: 'perkins/spec-sheets/1204J-E44TTAG2-electric-power.pdf',
    label: 'Perkins 1204J-E44TTAG2 Electric Power Engines',
    slugs: ['perkins-1204j-e44ttag2'],
  },
  {
    source:
      'https://s7d2.scene7.com/is/content/Caterpillar/'
      + 'CM20201201-02bf5-2b016',
    storagePath: 'perkins/spec-sheets/1206J-E70TTAG-electric-power.pdf',
    label: 'Perkins 1206J-E70TTAG Electric Power Engines',
    slugs: ['perkins-1206j-e70ttag3', 'perkins-1206j-e70ttag4'],
  },
]

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
  .select('id, slug')
  .in('slug', slugs)
if (existingError) throw existingError
if (existing.length !== records.length) {
  throw new Error(`Expected ${records.length} existing Perkins pages; found ${existing.length}`)
}

console.table(records.map((record) => ({
  slug: record.slug,
  model: record.model,
  prime_kwe_60hz: record.prime_power_kwe_60hz,
  standby_kwe_60hz: record.standby_power_kwe_60hz,
  gross_max_kw: record.power_kw,
})))

if (!apply) {
  console.log(`\nDry run: ${records.length} Perkins records will be corrected.`)
  process.exit(0)
}

const { error: upsertError } = await supabase
  .from('engines')
  .upsert(records, { onConflict: 'slug' })
if (upsertError) throw upsertError

const engineBySlug = new Map(existing.map((engine) => [engine.slug, engine]))
fs.mkdirSync(tempDir, { recursive: true })
for (const document of documents) {
  const localPath = path.join(tempDir, path.basename(document.storagePath))
  await downloadPdf(document.source, localPath)
  const uploaded = await uploadPdf(
    supabase,
    bucket,
    localPath,
    document.storagePath,
  )
  if (!uploaded.ok) throw new Error(`Could not upload ${document.storagePath}`)

  const engineIds = document.slugs.map((slug) => engineBySlug.get(slug).id)
  const { data: linked, error: linkedError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('storage_path', document.storagePath)
    .in('engine_id', engineIds)
  if (linkedError) throw linkedError

  const linkedIds = new Set(linked.map((row) => row.engine_id))
  const rows = engineIds
    .filter((engineId) => !linkedIds.has(engineId))
    .map((engineId) => ({
      engine_id: engineId,
      type: 'datasheet',
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: fs.statSync(localPath).size,
    }))
  if (rows.length) {
    const { error: linkError } = await supabase.from('engine_pdfs').insert(rows)
    if (linkError) throw linkError
  }
}

console.log(`Corrected ${records.length} Perkins pages and ensured official PDF links.`)
