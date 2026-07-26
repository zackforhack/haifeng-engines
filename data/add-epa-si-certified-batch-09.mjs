// Add the Isuzu 4HV1 natural-gas engine and official Isuzu literature.
// Dry-run by default. Use --apply to update Supabase.

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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-si-certified-batch-09')

const records = [
  {
    slug: 'isuzu-4hv1-natural-gas',
    brand: 'Isuzu',
    model: '4HV1 Natural Gas',
    series: 'Alternative Fuel Power Unit',
    status: 'active',
    origin: 'Japan / United States',
    fuel_type: 'Natural Gas',
    ignition_type: 'Spark Ignition',
    cooling_method: 'Liquid-Cooled',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 4.6,
    rpm_rated: 1800,
    power_kw: 58.5,
    power_hp: 78.4,
    emissions_standard: 'U.S. EPA Stationary',
    certifications: [
      'U.S. EPA Tier 2 Stationary',
      'U.S. EPA Phase 3 Class II Emergency Stationary',
      'U.S. EPA Part 1048',
    ],
    description:
      'Isuzu 4HV1 is a 4.6 L inline-four, naturally aspirated '
      + 'spark-ignited industrial engine for natural gas and propane '
      + 'applications including generator sets. Isuzu rates the '
      + 'natural-gas version at 78.4 hp (58.5 kWm) at 1800 RPM. '
      + 'EPA family KINDB04.64HV and its carryovers record a matching '
      + '59.5 kWm natural-gas configuration under certifier Tennessee '
      + 'Propulsion Products for model years 2019 through 2021.',
  },
]

const documents = [
  {
    source:
      'https://ptmedia.isuzuengines.com/downloads/Lit%20Sheets/'
      + 'Isuzu-REDTech-4HV1-Lit-Sheet.pdf',
    storagePath: 'isuzu/spec-sheets/isuzu-4hv1-alternative-fuel.pdf',
    label: 'Isuzu 4HV1 Alternative Fuel Specification Sheet',
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

const slugs = records.map((record) => record.slug)
const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (existingError) throw existingError
const existingSlugs = new Set(existing.map((engine) => engine.slug))

console.table(records.map((record) => ({
  action: existingSlugs.has(record.slug) ? 'update' : 'insert',
  brand: record.brand,
  model: record.model,
  displacement_l: record.displacement_l,
  power_kw: record.power_kw,
})))

if (!apply) {
  console.log(
    `Dry run: ${existing.length} updates, `
    + `${records.length - existing.length} inserts.`,
  )
  process.exit(0)
}

fs.mkdirSync(tempDir, { recursive: true })
for (const document of documents) {
  document.localPath = path.join(tempDir, path.basename(document.storagePath))
  await downloadPdf(document.source, document.localPath)
  console.log(`Validated ${document.label}`)
}

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
  throw new Error(`Expected ${records.length} saved records; found ${saved.length}`)
}

const engine = saved[0]
for (const document of documents) {
  const uploaded = await uploadPdf(
    supabase,
    'engine-pdfs',
    document.localPath,
    document.storagePath,
  )
  if (!uploaded.ok) throw new Error(`Could not upload ${document.storagePath}`)
  const { data: linked, error: linkedError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('storage_path', document.storagePath)
    .eq('engine_id', engine.id)
  if (linkedError) throw linkedError
  if (!linked.length) {
    const { error: linkError } = await supabase.from('engine_pdfs').insert({
      engine_id: engine.id,
      type: 'datasheet',
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: fs.statSync(document.localPath).size,
    })
    if (linkError) throw linkError
  }
}

console.log('Saved the Isuzu 4HV1 record and official specification sheet.')
