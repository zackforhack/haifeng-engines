// Add current Generac 2.4 L forced-induction generator models and correct
// 2G agenitor aspiration metadata from EPA annual certification data.
// Dry-run by default; pass --apply to write and link the Generac PDF.

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const apply = process.argv.includes('--apply')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY
if (!url || !key) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const supabase = createClient(url, key)
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-si-certified-batch-19')
const document = {
  source:
    'https://www.generac.com/globalassets/products/residential/'
    + 'standby-generators/spec-sheets/'
    + '22kw-27kw-32kw-38kw-protector-qs-standby-generator-specsheet.pdf',
  storagePath:
    'generac/residential/2-4l-protector-qs-generator-spec-sheet.pdf',
  label: 'Generac 2.4L Protector QS Generator Specification',
}

const common = {
  brand: 'Generac',
  series: 'Protector QS',
  status: 'active',
  origin: 'United States',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  emissions_standard: 'U.S. EPA Stationary',
  certifications: [
    'U.S. EPA Stationary',
    'U.S. EPA Stationary Emergency',
  ],
  cylinders: 4,
  displacement_l: 2.4,
  rpm_rated: 1800,
  rpm_max: 1800,
}

const inserts = [
  {
    ...common,
    slug: 'generac-rg03224',
    model: 'RG03224',
    configuration: 'Inline-4 Turbocharged',
    standby_power_kwe_60hz: 32,
    standby_power_kva_60hz: 40,
    description:
      'Generac RG03224 is a 32 kWe, 60 Hz emergency-standby generator '
      + 'using a 2.4 L inline-four turbocharged gaseous engine at 1800 '
      + 'RPM. Generac publishes natural-gas and propane ratings; this '
      + 'database uses the natural-gas rating. EPA annual certification '
      + 'data lists matching 2.4 L turbocharged stationary lineages.',
  },
  {
    ...common,
    slug: 'generac-rg03824',
    model: 'RG03824',
    configuration: 'Inline-4 Turbocharged Aftercooled',
    standby_power_kwe_60hz: 38,
    standby_power_kva_60hz: 47.5,
    description:
      'Generac RG03824 is a 38 kWe, 60 Hz emergency-standby generator '
      + 'using a 2.4 L inline-four turbocharged and aftercooled gaseous '
      + 'engine at 1800 RPM. Generac publishes natural-gas and propane '
      + 'ratings; this database uses the natural-gas rating. EPA annual '
      + 'certification data lists matching 2.4 L forced-induction lineages.',
  },
]

const updates = [
  {
    slug: '2g-agenitor-406',
    values: {
      configuration: 'L6 Turbocharged',
      description:
        '2G agenitor 406 is an 11.9 L inline-six turbocharged natural-gas '
        + 'engine platform for CHP applications. EPA annual certification '
        + 'data identifies the 262 kWm, 1800 RPM stationary lineage '
        + 'N2GEB11.9A06 and its carryover families.',
    },
  },
  {
    slug: '2g-agenitor-408',
    values: {
      configuration: 'V8 Turbocharged',
      description:
        '2G agenitor 408 is a 16.7 L V8 turbocharged natural-gas engine '
        + 'platform for CHP applications. EPA annual certification data '
        + 'identifies the 376 kWm, 1800 RPM stationary lineage '
        + 'N2GEB16.7A08 and its carryover families.',
    },
  },
  {
    slug: '2g-agenitor-412',
    values: {
      configuration: 'V12 Turbocharged',
      description:
        '2G agenitor 412 is a 25.0 L V12 turbocharged natural-gas engine '
        + 'platform for CHP applications. EPA annual certification data '
        + 'identifies the 574 kWm, 1800 RPM stationary lineage '
        + 'N2GEB25.0A12 and its carryover families.',
    },
  },
]

const allSlugs = [...inserts.map((record) => record.slug), ...updates.map((update) => update.slug)]
const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', allSlugs)
if (existingError) throw existingError
const existingSlugs = new Set(existing.map((engine) => engine.slug))
const missingUpdates = updates.filter((update) => !existingSlugs.has(update.slug))
if (missingUpdates.length) {
  throw new Error(`Missing update targets: ${missingUpdates.map((item) => item.slug).join(', ')}`)
}

console.table([
  ...inserts.map((record) => ({
    action: existingSlugs.has(record.slug) ? 'update' : 'insert',
    slug: record.slug,
    configuration: record.configuration,
    standby_kwe_60hz: record.standby_power_kwe_60hz,
  })),
  ...updates.map((update) => ({
    action: 'update',
    slug: update.slug,
    configuration: update.values.configuration,
    standby_kwe_60hz: '(unchanged)',
  })),
])

if (!apply) {
  console.log(
    `Dry run: ${inserts.length} Generac upserts, ${updates.length} 2G updates, `
    + 'and one official Generac PDF.',
  )
  process.exit(0)
}

fs.mkdirSync(tempDir, { recursive: true })
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

for (const record of inserts) {
  const query = existingSlugs.has(record.slug)
    ? supabase.from('engines').update(record).eq('slug', record.slug)
    : supabase.from('engines').insert(record)
  const { error } = await query
  if (error) throw error
}
for (const update of updates) {
  const { error } = await supabase
    .from('engines')
    .update(update.values)
    .eq('slug', update.slug)
  if (error) throw error
}

const generacSlugs = inserts.map((record) => record.slug)
const { data: saved, error: savedError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', generacSlugs)
if (savedError) throw savedError
if (saved.length !== generacSlugs.length) {
  throw new Error(`Expected ${generacSlugs.length} Generac records; found ${saved.length}`)
}

const uploaded = await uploadPdf(
  supabase,
  'engine-pdfs',
  document.localPath,
  document.storagePath,
)
if (!uploaded.ok) throw new Error(`Could not upload ${document.storagePath}`)

const engineIds = saved.map((engine) => engine.id)
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
    file_size_bytes: fs.statSync(document.localPath).size,
  }))
if (rows.length) {
  const { error } = await supabase.from('engine_pdfs').insert(rows)
  if (error) throw error
}

console.log(
  `Applied ${inserts.length} Generac records and ${updates.length} 2G `
  + 'corrections; linked one official Generac PDF.',
)
