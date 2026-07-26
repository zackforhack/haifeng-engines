// Resolve four legacy EPA SI lineages: 2G agenitor 312, ENER-G EGE-12V,
// and Rudox-packaged Mitsubishi GS12R/GS16R 60 Hz systems.
// Dry-run by default.

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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-si-certified-batch-14')
const common = {
  status: 'discontinued',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  emissions_standard: 'U.S. EPA Stationary',
  certifications: [
    'U.S. EPA Stationary',
    'U.S. EPA NSPS Subpart JJJJ',
  ],
}

const records = [
  {
    ...common,
    slug: '2g-agenitor-312',
    brand: '2G',
    model: 'agenitor 312',
    series: 'agenitor',
    origin: 'Germany',
    year_introduced: 2016,
    year_discontinued: 2020,
    cylinders: 12,
    configuration: 'V12 Turbocharged Intercooled',
    displacement_l: 21.93,
    rpm_rated: 1800,
    power_kw: 469,
    power_hp: 629,
    prime_power_kwe_60hz: 450,
    prime_power_kva_60hz: 562.5,
    description:
      '2G agenitor 312 is a legacy 21.93 L V12 turbocharged '
      + 'natural-gas CHP platform built around a 2G-MAN engine. '
      + 'Published project and technical material identifies the '
      + 'agenitor 312 as a 450 kWe, 1800 RPM system. EPA lineage '
      + 'G2GEB21.9STA records matching 21.9 L V12 stationary '
      + 'configurations at 416 and 469 kWm from 2016 through 2020.',
  },
  {
    ...common,
    slug: 'ener-g-ege-12v',
    brand: 'ENER-G',
    model: 'EGE-12V',
    series: 'Legacy Natural Gas',
    origin: 'United Kingdom / United States',
    year_introduced: 2015,
    year_discontinued: 2020,
    cylinders: 12,
    configuration: 'V12 Naturally Aspirated',
    displacement_l: 21.9,
    rpm_rated: 1800,
    power_kw: 275,
    power_hp: 369,
    description:
      'ENER-G EGE-12V is a legacy naturally aspirated V12 '
      + 'natural-gas engine used across ENER-G 165 to 230 CHP '
      + 'packages. The 2015 ENER-G range guide publishes up to '
      + '239 kWm brake output for this engine type. EPA lineage '
      + 'FRDXB21.9VNA identifies the matching 21.9 L V12 '
      + 'stationary 1800 RPM certification platform and a '
      + '275 kW maximum certification node.',
  },
  {
    slug: 'mitsubishi-gs12r-ptk',
    rpm_max: 1800,
    standby_power_kwe_60hz: 750,
    standby_power_kva_60hz: 937.5,
    emissions_standard: 'U.S. EPA Stationary',
    certifications: [
      'U.S. EPA Stationary',
      'U.S. EPA NSPS Subpart JJJJ',
      'UL 2200 Available',
    ],
    description:
      'Mitsubishi GS12R-PTK is a 49.03 L V12 Miller-cycle '
      + 'lean-burn gas engine for generator and cogeneration '
      + 'service. MHI publishes a 700 kWe, 1500 RPM base '
      + 'configuration. Rudox packaged the same engine as the '
      + 'ERM750GS, rated 750 kWe standby at 60 Hz and 1800 RPM. '
      + 'EPA lineage FRDXB49.1MGS records the matching 49.1 L '
      + 'V12 stationary configuration.',
  },
  {
    slug: 'mitsubishi-gs16r',
    rpm_max: 1800,
    standby_power_kwe_60hz: 1000,
    standby_power_kva_60hz: 1250,
    emissions_standard: 'U.S. EPA Stationary',
    certifications: [
      'U.S. EPA Stationary',
      'U.S. EPA NSPS Subpart JJJJ',
      'UL 2200 Available',
    ],
    description:
      'Mitsubishi GS16R-PTK is a 65.37 L V16 Miller-cycle '
      + 'lean-burn gas engine for generator and cogeneration '
      + 'service. MHI publishes a 930 kWe, 1500 RPM base '
      + 'configuration. Rudox packaged the engine as the '
      + 'ERM1000GS, rated 1000 kWe standby at 60 Hz and 1800 RPM. '
      + 'EPA lineage FRDXB65.5MGS records the matching 65.5 L '
      + 'V16 stationary configuration; the workbook\'s 49.1 L '
      + 'displacement entry is a source-field error.',
  },
]

const documents = [
  {
    source:
      'https://www.2g-energy.com/hubfs/2GEnergy_March2022/PDFs/'
      + 'windmill_holsteins_projectprofile_.pdf?hsLang=en',
    storagePath: '2g/case-studies/agenitor-312-windmill-holsteins.pdf',
    label: '2G agenitor 312 Windmill Holsteins Project Profile',
    type: 'brochure',
    slugs: ['2g-agenitor-312'],
  },
  {
    source:
      'https://www.temptech.ie/wp-content/uploads/2016/07/'
      + 'ENER-G-Natural-Gas-Range.pdf',
    storagePath: 'ener-g/guides/ener-g-natural-gas-range-2015.pdf',
    label: 'ENER-G Natural Gas Range Guide 2015',
    type: 'brochure',
    slugs: ['ener-g-ege-12v'],
  },
  {
    source:
      'https://www.centricabusinesssolutions.com/us/sites/g/files/'
      + 'qehiga201/files/documents/ERM750GS%20GEN%20SET%20NAT%20GAS'
      + '%20datasheet_0.pdf',
    storagePath: 'mitsubishi/rudox/erm750gs-gs12r-ptk.pdf',
    label: 'Rudox ERM750GS Mitsubishi GS12R-PTK Datasheet',
    type: 'datasheet',
    slugs: ['mitsubishi-gs12r-ptk'],
  },
  {
    source:
      'https://www.centricabusinesssolutions.com/us/sites/g/files/'
      + 'qehiga201/files/documents/ERM1000GS%20GEN%20SET%20NAT%20GAS'
      + '%20datasheet_1.pdf',
    storagePath: 'mitsubishi/rudox/erm1000gs-gs16r-ptk.pdf',
    label: 'Rudox ERM1000GS Mitsubishi GS16R-PTK Datasheet',
    type: 'datasheet',
    slugs: ['mitsubishi-gs16r'],
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
  slug: record.slug,
  model: record.model || '(existing model)',
  power_kw: record.power_kw || '(preserve)',
  standby_kwe_60hz: record.standby_power_kwe_60hz || null,
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
const engineBySlug = new Map(saved.map((engine) => [engine.slug, engine]))

for (const document of documents) {
  const uploaded = await uploadPdf(
    supabase,
    'engine-pdfs',
    document.localPath,
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
      file_size_bytes: fs.statSync(document.localPath).size,
    }))
  if (links.length) {
    const { error: linkError } = await supabase.from('engine_pdfs').insert(links)
    if (linkError) throw linkError
  }
}

console.log(
  `Saved ${records.length} EPA SI records and ensured `
  + `${documents.length} supporting document sets.`,
)
