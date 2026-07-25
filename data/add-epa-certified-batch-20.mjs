// Close the 2019 constant-speed EPA review tier.
// Dry-run by default. Use --apply to update Supabase and attach the Hatz manual.

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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-certified-batch-20')

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const records = [
  {
    slug: 'hatz-2m41z',
    brand: 'Hatz',
    model: '2M41Z',
    series: '41 Series',
    cylinders: 2,
    configuration: 'L2 Naturally Aspirated',
    displacement_l: 1.716,
    power_kw: 20,
    emissions_standard: 'U.S. EPA Interim Tier 4 / U.S. EPA Final Tier 4',
    certifications: ['U.S. EPA Interim Tier 4', 'U.S. EPA Tier 4 Final'],
    cooling_method: 'Air-Cooled',
    origin: 'Germany',
    description:
      'Hatz 2M41Z 1.716 L inline-2 naturally aspirated air-cooled diesel engine. '
      + 'EPA annual certification records list constant-speed configurations '
      + 'from 17 to 20 kWm at 1800 RPM under Interim Tier 4 and Tier 4 Final. '
      + 'The official Hatz manual confirms the model, displacement and two-cylinder design.',
  },
  {
    slug: 'perkins-1204e-e44ta-c4-4',
    brand: 'Perkins',
    model: '1204E-E44TA(C4.4)',
    series: '1200 Series',
    cylinders: 4,
    configuration: 'L4 Common-Rail Turbocharged Aftercooled',
    displacement_l: 4.399,
    power_kw: 82,
    emissions_standard: 'U.S. EPA Interim Tier 4 / Euro Stage IIIB',
    certifications: ['U.S. EPA Interim Tier 4', 'Euro Stage IIIB'],
    cooling_method: 'Liquid-Cooled',
    origin: 'United Kingdom',
    description:
      'Perkins 1204E-E44TA(C4.4) 4.399 L inline-4 common-rail turbocharged '
      + 'and aftercooled diesel engine. EPA annual certification records list '
      + '71 to 82 kWm at 1800 RPM under Interim Tier 4. Perkins identifies '
      + '1204E-E44TA as a distinct 1200 Series commercial engine.',
  },
  {
    slug: 'perkins-1204e-e44tta-c4-4',
    brand: 'Perkins',
    model: '1204E-E44TTA(C4.4)',
    series: '1200 Series',
    cylinders: 4,
    configuration: 'L4 Common-Rail Twin-Turbocharged Aftercooled',
    displacement_l: 4.399,
    power_kw: 129,
    emissions_standard: 'U.S. EPA Interim Tier 4 / Euro Stage IIIB',
    certifications: ['U.S. EPA Interim Tier 4', 'Euro Stage IIIB'],
    cooling_method: 'Liquid-Cooled',
    origin: 'United Kingdom',
    description:
      'Perkins 1204E-E44TTA(C4.4) 4.399 L inline-4 common-rail twin-turbocharged '
      + 'and aftercooled diesel engine. EPA annual certification records list '
      + '122 to 129 kWm at 1800 RPM under Interim Tier 4. Perkins identifies '
      + '1204E-E44TTA as a distinct 1200 Series commercial engine.',
  },
].map((record) => ({
  status: 'active',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  rpm_rated: 1800,
  ...record,
}))

const document = {
  source:
    'https://sp.hatz.com/fileadmin/user_upload/hatz-diesel.com/'
    + 'betriebsanleitung/l_m/ebook_BA_2LM_EPAIV_43341515_2018.pdf',
  storagePath: 'hatz/manuals/2l41c-2m41-2m41z-epa-tier-4-manual.pdf',
  label: 'Hatz 2L41C / 2M41 / 2M41Z EPA Tier 4 Operator Manual',
  type: 'manual',
  slugs: ['hatz-2m41z'],
}

async function downloadPdf(source, destination) {
  const response = await fetch(source, {
    headers: { 'User-Agent': 'Mozilla/5.0 HaifengEngineDatabase/1.0' },
    redirect: 'follow',
    signal: AbortSignal.timeout(120000),
  })
  if (!response.ok) throw new Error(`${source}: HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${source}: response is not a PDF`)
  }
  fs.writeFileSync(destination, buffer)
}

const slugs = records.map((record) => record.slug)
const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug, model')
  .in('slug', slugs)
if (existingError) throw existingError

const existingSlugs = new Set(existing.map((engine) => engine.slug))
console.table(records.map((record) => ({
  action: existingSlugs.has(record.slug) ? 'update' : 'insert',
  brand: record.brand,
  model: record.model,
  certified_kwm: record.power_kw,
  emissions: record.emissions_standard,
})))

if (!apply) {
  console.log(
    `\nDry run: ${existing.length} records will be updated and `
    + `${records.length - existing.length} records will be inserted.`,
  )
  console.log('One official Hatz manual will be uploaded and linked.')
  process.exit(0)
}

const { error: upsertError } = await supabase
  .from('engines')
  .upsert(records, { onConflict: 'slug' })
if (upsertError) throw upsertError

const { data: saved, error: savedError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (savedError) throw savedError
if (saved.length !== records.length) {
  throw new Error(`Expected ${records.length} saved records; found ${saved.length}`)
}
const engineBySlug = new Map(saved.map((engine) => [engine.slug, engine]))

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

const engineIds = document.slugs.map((slug) => engineBySlug.get(slug).id)
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
    file_size_bytes: fs.statSync(localPath).size,
  }))
if (links.length) {
  const { error: linkError } = await supabase.from('engine_pdfs').insert(links)
  if (linkError) throw linkError
}

console.log(
  `Saved ${records.length} exact EPA records and ensured the official Hatz manual.`,
)
