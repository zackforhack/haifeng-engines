// Add the DEUTZ TCG 914 L6 identified by the official DEUTZ gas-engine
// brochure and EPA stationary lineage BDZXB06.5LT6. Dry-run by default.

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const apply = process.argv.includes('--apply')
const skipDocuments = process.argv.includes('--skip-documents')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY
if (!url || !key) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const supabase = createClient(url, key)
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-si-certified-batch-15')
const record = {
  slug: 'deutz-tcg-914-l6',
  brand: 'Deutz',
  model: 'TCG 914 L6',
  series: 'TCG 914',
  status: 'discontinued',
  year_introduced: 2015,
  year_discontinued: 2022,
  origin: 'Germany',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Air-Cooled',
  cylinders: 6,
  configuration: 'L6 Turbocharged Intercooled',
  displacement_l: 6.5,
  rpm_rated: 1800,
  rpm_max: 1900,
  power_kw: 64.4,
  power_hp: 86.4,
  emissions_standard: 'U.S. EPA Stationary',
  certifications: [
    'U.S. EPA Stationary',
    'U.S. EPA NSPS Subpart JJJJ',
  ],
  description:
    'DEUTZ TCG 914 L6 is a 6.5 L inline-six turbocharged and '
    + 'charge-air-cooled natural-gas engine for stationary use. '
    + 'The official DEUTZ brochure identifies the model and an '
    + 'EPA-certified 67 kW maximum rating, with 85 kW available '
    + 'outside the certified calibration. EPA lineage '
    + 'BDZXB06.5LT6 records the matching 6.5 L six-cylinder '
    + 'turbocharged platform tested at 1800 RPM and 64.4 kW from '
    + 'model years 2015 through 2022.',
}

const document = {
  source:
    'https://www.deutzusa.com/fileadmin/contents/usa/TCG_914_brochure.pdf',
  storagePath: 'deutz/gas/deutz-tcg-914-gas-engine-brochure.pdf',
  label: 'DEUTZ TCG 914 Heavy Duty Gas Engine Brochure',
  type: 'datasheet',
}

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

const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug')
  .eq('slug', record.slug)
if (existingError) throw existingError

console.table([{
  action: existing.length ? 'update' : 'insert',
  model: record.model,
  displacement_l: record.displacement_l,
  cylinders: record.cylinders,
  power_kw: record.power_kw,
}])

if (!apply) {
  console.log(`Dry run: ${existing.length ? '1 update' : '1 insert'}.`)
  process.exit(0)
}

if (!skipDocuments) {
  fs.mkdirSync(tempDir, { recursive: true })
  document.localPath = path.join(tempDir, path.basename(document.storagePath))
  await downloadPdf(document.source, document.localPath)
  console.log(`Validated ${document.label}`)
}

const query = existing.length
  ? supabase.from('engines').update(record).eq('slug', record.slug)
  : supabase.from('engines').insert(record)
const { error } = await query
if (error) throw error

const { data: saved, error: savedError } = await supabase
  .from('engines')
  .select('id')
  .eq('slug', record.slug)
  .single()
if (savedError) throw savedError

if (!skipDocuments) {
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
    .eq('engine_id', saved.id)
  if (linkedError) throw linkedError
  if (!linked.length) {
    const { error: linkError } = await supabase.from('engine_pdfs').insert({
      engine_id: saved.id,
      type: document.type,
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: fs.statSync(document.localPath).size,
    })
    if (linkError) throw linkError
  }
}

console.log(
  'Saved DEUTZ TCG 914 L6'
  + (skipDocuments
    ? '; document upload skipped because the official host blocks automation.'
    : ' and official DEUTZ brochure.'),
)
