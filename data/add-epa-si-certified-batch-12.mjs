// Add five Cummins-packaged legacy/current gaseous platforms with official
// Cummins product and EPA emissions documents. Dry-run by default.

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
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-si-certified-batch-12')
const common = {
  brand: 'Cummins',
  origin: 'United States',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
  emissions_standard: 'U.S. EPA Stationary',
  certifications: [
    'U.S. EPA Stationary',
    'U.S. EPA NSPS Subpart JJJJ',
  ],
}

const records = [
  {
    ...common,
    slug: 'cummins-ggmc-gm-3-0l',
    model: 'GGMC GM 3.0L',
    series: 'Legacy Spark-Ignited',
    status: 'discontinued',
    cylinders: 4,
    configuration: 'L4 Naturally Aspirated',
    displacement_l: 2.97,
    compression_ratio: '10.5:1',
    power_kw: 34,
    power_hp: 45.6,
    prime_power_kwe_60hz: 26,
    prime_power_kva_60hz: 32.5,
    standby_power_kwe_60hz: 29,
    standby_power_kva_60hz: 36,
    description:
      'Cummins GGMC uses the GM 3.0 L inline-four naturally '
      + 'aspirated spark-ignited engine. Official Cummins data rates '
      + 'the natural-gas set at 29 kWe standby and 26 kWe prime at '
      + '1800 RPM. EPA family BCEXB03.0GDA records the matching '
      + '3.0 L, four-cylinder stationary certification platform.',
  },
  {
    ...common,
    slug: 'cummins-ggpc-gm-5-0l',
    model: 'GGPC GM 5.0L',
    series: 'Legacy Spark-Ignited',
    status: 'discontinued',
    cylinders: 8,
    configuration: 'V8 Naturally Aspirated',
    displacement_l: 5,
    compression_ratio: '9.4:1',
    power_kw: 53.7,
    power_hp: 72,
    prime_power_kwe_60hz: 35,
    prime_power_kva_60hz: 43.75,
    standby_power_kwe_60hz: 45,
    standby_power_kva_60hz: 56.25,
    description:
      'Cummins GGPC uses the GM 5.0 L naturally aspirated V8 '
      + 'spark-ignited engine. Official Cummins data rates the '
      + 'natural-gas set at 45 kWe standby and 35 kWe prime at '
      + '1800 RPM. EPA family BCEXB05.0GDA records the matching '
      + 'five-liter V8 stationary platform.',
  },
  {
    ...common,
    slug: 'cummins-gghf-ford-v10-6-8l',
    model: 'GGHF Ford V10 6.8L',
    series: 'Spark-Ignited Commercial',
    status: 'active',
    cylinders: 10,
    configuration: 'V10 Naturally Aspirated',
    displacement_l: 6.8,
    power_kw: 91.6,
    standby_power_kwe_60hz: 70,
    standby_power_kva_60hz: 87.5,
    description:
      'Cummins GGHF is a commercial-industrial gaseous generator '
      + 'platform using the naturally aspirated Ford 6.8 L V10. '
      + 'Cummins rates the natural-gas set at 70 kWe standby at '
      + '60 Hz and identifies EPA compliance. EPA family '
      + 'BCEXB06.8GDC records the corresponding 6.8 L V10 '
      + 'stationary configuration at the 1800 RPM test speed.',
  },
  {
    ...common,
    slug: 'cummins-gghg-wsg-1068',
    model: 'GGHG WSG-1068',
    series: 'Spark-Ignited Commercial',
    status: 'active',
    cylinders: 10,
    configuration: 'V10 Turbocharged',
    displacement_l: 6.8,
    compression_ratio: '9:1',
    power_kw: 98.1,
    power_hp: 131.6,
    standby_power_kwe_60hz: 85,
    standby_power_kva_60hz: 106.25,
    description:
      'Cummins GGHG uses the turbocharged WSG-1068 6.8 L V10 '
      + 'spark-ignited engine. Cummins EPA compliance statement '
      + 'epa-1147 identifies engine family BCEXB06.8GDB and a '
      + '131.6 hp nameplate rating. The natural-gas generator set '
      + 'is rated 85 kWe standby at 60 Hz.',
  },
  {
    ...common,
    slug: 'cummins-ggla-gm-v8t-8-1l',
    model: 'GGLA GM V8T 8.1L',
    series: 'Legacy Spark-Ignited',
    status: 'discontinued',
    cylinders: 8,
    configuration: 'V8 Turbocharged',
    displacement_l: 8.1,
    power_kw: 157,
    standby_power_kwe_60hz: 125,
    standby_power_kva_60hz: 156.25,
    description:
      'Cummins GGLA uses the turbocharged GM 8.1 L V8 '
      + 'spark-ignited engine. Cummins product literature rates '
      + 'the natural-gas generator set at 125 kWe standby at '
      + '60 Hz. EPA family BCEXB08.1GDA records the matching '
      + '8.1 L V8 stationary configuration at 1800 RPM.',
  },
]

const documents = [
  {
    source:
      'https://incal.cummins.com/www/literature/brochures/'
      + 'F-1186-OnSitePowerFullLine-en.pdf',
    storagePath: 'cummins/guides/f-1186-onsite-power-full-line.pdf',
    label: 'Cummins On-Site Power Full-Line Product Guide',
    slugs: records.map((record) => record.slug),
  },
  {
    source:
      'https://incal.cummins.com/www/common/templatehtml/'
      + 'technicaldocument/EmissionDataSheets/na/eds-1069.pdf',
    storagePath: 'cummins/emissions/eds-1069-ggmc-gm-3-0l.pdf',
    label: 'Cummins GGMC GM 3.0L Emissions Data Sheet',
    slugs: ['cummins-ggmc-gm-3-0l'],
  },
  {
    source:
      'https://incal.cummins.com/www/common/templatehtml/'
      + 'technicaldocument/EmissionDataSheets/na/eds-1108.pdf',
    storagePath: 'cummins/emissions/eds-1108-ggpc-gm-5-0l.pdf',
    label: 'Cummins GGPC GM 5.0L Emissions Data Sheet',
    slugs: ['cummins-ggpc-gm-5-0l'],
  },
  {
    source:
      'https://incal.cummins.com/www/common_backup_28Feb2024_SCTASK1912297/'
      + 'templatehtml/technicaldocument/EmissionDataSheets/na/epa-1147.pdf',
    storagePath: 'cummins/emissions/epa-1147-gghg-wsg-1068.pdf',
    label: 'Cummins GGHG WSG-1068 EPA Compliance Statement',
    slugs: ['cummins-gghg-wsg-1068'],
  },
  {
    source:
      'https://incal.cummins.com/www/literature/brochures/'
      + 'F-2089-EmissionsRegsSparkIg-en.pdf',
    storagePath: 'cummins/guides/f-2089-stationary-si-emissions.pdf',
    label: 'Cummins Stationary Spark-Ignited EPA Product Guide',
    slugs: [
      'cummins-gghf-ford-v10-6-8l',
      'cummins-gghg-wsg-1068',
      'cummins-ggla-gm-v8t-8-1l',
    ],
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
  model: record.model,
  displacement_l: record.displacement_l,
  cylinders: record.cylinders,
  power_kw: record.power_kw,
})))

if (!apply) {
  console.log(
    `Dry run: ${existing.length} updates, `
    + `${records.length - existing.length} inserts.`,
  )
  process.exit(0)
}

if (!skipDocuments) {
  fs.mkdirSync(tempDir, { recursive: true })
  for (const document of documents) {
    document.localPath = path.join(tempDir, path.basename(document.storagePath))
    await downloadPdf(document.source, document.localPath)
    console.log(`Validated ${document.label}`)
  }
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

if (!skipDocuments) {
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
        type: 'datasheet',
        label: document.label,
        storage_path: document.storagePath,
        file_size_bytes: fs.statSync(document.localPath).size,
      }))
    if (links.length) {
      const { error: linkError } = await supabase.from('engine_pdfs').insert(links)
      if (linkError) throw linkError
    }
  }
}

console.log(
  `Saved ${records.length} Cummins EPA SI records`
  + (skipDocuments
    ? '; document upload skipped because the official host blocks automation.'
    : ` and ensured ${documents.length} official document sets.`),
)
