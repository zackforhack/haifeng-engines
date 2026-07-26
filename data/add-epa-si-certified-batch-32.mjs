// Reconcile the current Cummins GTA855E EPA scope and attach model-specific
// C250N6 and C300N6 specification sheets.
// Dry-run by default; pass --apply to update and upload both official PDFs.

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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-si-certified-batch-32')
const certifications = [
  'U.S. EPA Stationary',
  'U.S. EPA Stationary Emergency',
  'U.S. EPA Stationary Non-Emergency',
  'U.S. EPA NSPS',
]

const updates = [
  {
    slug: 'cummins-c250n6',
    values: {
      series: 'GTA855E Genset',
      configuration: 'Inline-6 Turbocharged Aftercooled',
      emissions_standard: 'U.S. EPA Stationary',
      certifications,
      standby_power_kwe_60hz: 250,
      standby_power_kva_60hz: 312,
      description:
        'Cummins C250N6 is a 250 kWe / 312 kVA, 60 Hz natural-gas '
        + 'standby generator using the 14 L GTA855E inline-six engine. '
        + 'Cummins publishes EPA stationary emergency certification in '
        + 'the model specification and also lists the current GTA855E '
        + 'platform for stationary non-emergency applications.',
    },
  },
  {
    slug: 'cummins-c300n6',
    values: {
      series: 'GTA855E Genset',
      configuration: 'Inline-6 Turbocharged Aftercooled',
      emissions_standard: 'U.S. EPA Stationary',
      certifications,
      standby_power_kwe_60hz: 300,
      standby_power_kva_60hz: 375,
      description:
        'Cummins C300N6 is a 300 kWe / 375 kVA, 60 Hz natural-gas '
        + 'standby generator using the 14 L GTA855E inline-six engine. '
        + 'Its official specification identifies EPA stationary '
        + 'emergency certification, while Cummins also lists the current '
        + 'GTA855E platform for stationary non-emergency applications.',
    },
  },
]

const documents = [
  {
    slug: 'cummins-c250n6',
    source: 'https://mart.cummins.com/imagelibrary/data/assetfiles/0056715.pdf',
    storagePath: 'cummins/spec-sheets/c250n6-gta855e.pdf',
    label: 'Cummins C250N6 GTA855E Specification',
  },
  {
    slug: 'cummins-c300n6',
    source: 'https://www.cummins.com/sites/default/files/2019-04/A042J578_4.pdf',
    storagePath: 'cummins/spec-sheets/c300n6-gta855e.pdf',
    label: 'Cummins C300N6 GTA855E Specification',
  },
]

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
  documents: 1,
})))
if (!apply) {
  console.log(`Dry run: ${updates.length} updates and ${documents.length} official PDFs.`)
  process.exit(0)
}

fs.mkdirSync(tempDir, { recursive: true })
for (const document of documents) {
  document.localPath = path.join(tempDir, path.basename(document.storagePath))
  const response = await fetch(document.source, {
    headers: { 'User-Agent': 'Mozilla/5.0 HaifengEngineDatabase/1.0' },
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
  })
  if (!response.ok) throw new Error(`${document.source}: HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${document.source}: response is not a PDF`)
  }
  fs.writeFileSync(document.localPath, buffer)
}

for (const update of updates) {
  const { error } = await supabase
    .from('engines')
    .update(update.values)
    .eq('slug', update.slug)
  if (error) throw error
}

const engineBySlug = new Map(existing.map((engine) => [engine.slug, engine]))
for (const document of documents) {
  const uploaded = await uploadPdf(
    supabase,
    'engine-pdfs',
    document.localPath,
    document.storagePath,
  )
  if (!uploaded.ok) throw new Error(`Could not upload ${document.storagePath}`)

  const engine = engineBySlug.get(document.slug)
  const { data: linked, error: linkedError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('engine_id', engine.id)
    .eq('storage_path', document.storagePath)
  if (linkedError) throw linkedError
  if (!linked.length) {
    const { error } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: 'datasheet',
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: fs.statSync(document.localPath).size,
    })
    if (error) throw error
  }
}

console.log('Applied Cummins C250N6/C300N6 EPA and datasheet updates.')
