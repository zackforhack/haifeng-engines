// Resolve the first EPA spark-ignited 1800 RPM coverage batch.
// Dry-run by default. Use --apply to update Supabase and attach official PDFs.

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { uploadPdf } from './pdf-upload-utils.mjs'

const apply = process.argv.includes('--apply')
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !serviceKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
}

const supabase = createClient(supabaseUrl, serviceKey)
const bucket = 'engine-pdfs'
const tempDir = path.join(os.tmpdir(), 'haifeng-epa-si-certified-batch-01')

const gasCommon = {
  status: 'active',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1800,
}

const records = [
  {
    ...gasCommon,
    slug: 'generac-sg150-9l',
    brand: 'Generac',
    model: 'SG150 (9.0L)',
    series: 'SG Series',
    origin: 'United States',
    cylinders: 8,
    configuration: 'V8 Turbocharged Aftercooled',
    displacement_l: 8.9,
    power_kw: 171,
    standby_power_kwe_60hz: 150,
    standby_power_kva_60hz: 187.5,
    emissions_standard: 'U.S. EPA Stationary',
    certifications: ['U.S. EPA Stationary Emergency', 'U.S. EPA Stationary Non-Emergency'],
    description:
      'Generac SG150 9.0 L V8 turbocharged and aftercooled spark-ignited '
      + 'generator engine. The official Generac sheet publishes 229 hp '
      + '(171 kWm), 150 kWe standby at 1800 RPM on natural gas, and EPA '
      + 'stationary emergency and non-emergency certification.',
  },
  {
    ...gasCommon,
    slug: 'generac-sg250',
    brand: 'Generac',
    model: 'SG250',
    series: 'SG Series',
    origin: 'United States',
    cylinders: 6,
    configuration: 'L6 Turbocharged Aftercooled',
    displacement_l: 14.2,
    power_kw: 280,
    prime_power_kw_60hz: 251,
    standby_power_kw_60hz: 280,
    prime_power_kwe_60hz: 225,
    standby_power_kwe_60hz: 250,
    prime_power_kva_60hz: 281,
    standby_power_kva_60hz: 313,
    emissions_standard: 'U.S. EPA Stationary',
    certifications: ['U.S. EPA Stationary Emergency', 'U.S. EPA Stationary Non-Emergency'],
    description:
      'Generac SG250 14.2 L inline-6 turbocharged and aftercooled '
      + 'spark-ignited natural-gas generator engine. Generac publishes '
      + '375 hp standby and 337 hp prime at 1800 RPM, producing 250 kWe '
      + 'standby and 225 kWe prime.',
  },
  {
    ...gasCommon,
    slug: 'generac-sg275',
    brand: 'Generac',
    model: 'SG275',
    series: 'SG Series',
    origin: 'United States',
    cylinders: 6,
    configuration: 'L6 Turbocharged Aftercooled',
    displacement_l: 14.2,
    power_kw: 305,
    prime_power_kw_60hz: 275,
    standby_power_kw_60hz: 305,
    prime_power_kwe_60hz: 248,
    standby_power_kwe_60hz: 275,
    prime_power_kva_60hz: 309.4,
    standby_power_kva_60hz: 343.8,
    emissions_standard: 'U.S. EPA Stationary',
    certifications: ['U.S. EPA Stationary Emergency', 'U.S. EPA Stationary Non-Emergency'],
    description:
      'Generac SG275 14.2 L inline-6 turbocharged and aftercooled '
      + 'spark-ignited natural-gas generator engine. Generac publishes '
      + '409 hp standby and 369 hp prime at 1800 RPM, producing 275 kWe '
      + 'standby and 248 kWe prime.',
  },
  {
    ...gasCommon,
    slug: 'generac-sg300',
    brand: 'Generac',
    model: 'SG300',
    series: 'SG Series',
    origin: 'United States',
    cylinders: 6,
    configuration: 'L6 Turbocharged Aftercooled',
    displacement_l: 14.2,
    power_kw: 334,
    prime_power_kw_60hz: 301,
    standby_power_kw_60hz: 334,
    prime_power_kwe_60hz: 270,
    standby_power_kwe_60hz: 300,
    prime_power_kva_60hz: 337.5,
    standby_power_kva_60hz: 375,
    emissions_standard: 'U.S. EPA Stationary',
    certifications: ['U.S. EPA Stationary Emergency', 'U.S. EPA Stationary Non-Emergency'],
    description:
      'Generac SG300 14.2 L inline-6 turbocharged and aftercooled '
      + 'spark-ignited natural-gas generator engine. Generac publishes '
      + '448 hp standby and 403 hp prime at 1800 RPM, producing 300 kWe '
      + 'standby and 270 kWe prime.',
  },
  {
    ...gasCommon,
    slug: 'generac-sg1000',
    brand: 'Generac',
    model: 'SG1000',
    series: 'SG Series',
    origin: 'United States',
    cylinders: 12,
    configuration: 'V12 Turbocharged Aftercooled',
    displacement_l: 49.03,
    power_kw: 1094,
    standby_power_kw_60hz: 1094,
    standby_power_kwe_60hz: 1000,
    standby_power_kva_60hz: 1250,
    emissions_standard: 'U.S. EPA Stationary',
    certifications: ['U.S. EPA Stationary Emergency', 'U.S. EPA Stationary Non-Emergency'],
    description:
      'Generac SG1000 49.03 L V12 turbocharged and aftercooled '
      + 'spark-ignited natural-gas generator engine. Generac publishes '
      + '1,467 hp at 1800 RPM and 1,000 kWe standby output, with EPA '
      + 'stationary emergency and non-emergency certification.',
  },
  {
    ...gasCommon,
    slug: 'caterpillar-g3306b',
    brand: 'Caterpillar',
    model: 'G3306B',
    series: 'G3300 Series',
    origin: 'United States',
    cylinders: 6,
    configuration: 'L6 Naturally Aspirated or Turbocharged Aftercooled',
    displacement_l: 10.5,
    power_kw: 157,
    emissions_standard: 'U.S. EPA Stationary',
    certifications: ['U.S. EPA NSPS Site Compliant Capable'],
    description:
      'Caterpillar G3306B 10.5 L inline-6 natural-gas engine rated from '
      + '108 to 157 bkW at 1800 RPM. Caterpillar identifies rich-burn '
      + 'configurations as EPA NSPS site-compliant capable with the '
      + 'required air-fuel-ratio control and aftertreatment.',
  },
  {
    slug: 'caterpillar-g3512h',
    brand: 'Caterpillar',
    model: 'G3512H',
    cylinders: 12,
    configuration: 'V12 Turbocharged Aftercooled',
    displacement_l: 59,
  },
  {
    slug: 'caterpillar-g3516h',
    brand: 'Caterpillar',
    model: 'G3516H',
    cylinders: 16,
    configuration: 'V16 Turbocharged Aftercooled',
    displacement_l: 78,
  },
  {
    slug: 'caterpillar-g3520h',
    brand: 'Caterpillar',
    model: 'G3520H',
    cylinders: 20,
    configuration: 'V20 Turbocharged Aftercooled',
    displacement_l: 97.5,
  },
  {
    ...gasCommon,
    slug: 'cummins-qsl9g',
    brand: 'Cummins',
    model: 'QSL9G',
    series: 'QSL9G Series',
    origin: 'United States',
    cylinders: 6,
    configuration: 'L6 Turbocharged Aftercooled',
    displacement_l: 8.9,
    power_kw: 131,
    emissions_standard: 'U.S. EPA Stationary',
    certifications: ['U.S. EPA NSPS 2011 Compliant Capable'],
    description:
      'Cummins QSL9G 8.9 L inline-6 turbocharged and aftercooled '
      + 'natural-gas engine rated 175 hp (131 kWm) at 1800 RPM. Cummins '
      + 'identifies the engine as 2011 NSPS compliant capable with the '
      + 'factory supplied air-fuel-ratio control and catalyst.',
  },
  {
    ...gasCommon,
    slug: 'cummins-gta855e',
    brand: 'Cummins',
    model: 'GTA855E',
    series: 'GTA855 Gas Series',
    origin: 'United States',
    cylinders: 6,
    configuration: 'L6 Turbocharged Aftercooled',
    displacement_l: 14,
    power_kw: 286,
    prime_power_kw_60hz: 286,
    prime_power_kwe_60hz: 250,
    prime_power_kva_60hz: 313,
    emissions_standard: 'U.S. EPA Stationary',
    certifications: ['U.S. EPA NSPS', 'MOH'],
    description:
      'Cummins GTA855E 14.0 L inline-6 turbocharged and aftercooled '
      + 'stoichiometric natural-gas generator-drive engine. Cummins '
      + 'publishes 286 kWm prime and an estimated 250 kWe generator output '
      + 'with EPA NSPS and MOH certification.',
  },
  {
    ...gasCommon,
    slug: 'cummins-gta28',
    brand: 'Cummins',
    model: 'GTA28',
    series: 'GTA Gas Series',
    origin: 'United States',
    cylinders: 12,
    configuration: 'V12 Turbocharged',
    displacement_l: 28,
    power_kw: 574,
    standby_power_kw_60hz: 574,
    standby_power_kwe_60hz: 500,
    standby_power_kva_60hz: 625,
    emissions_standard: 'U.S. EPA Stationary',
    certifications: ['U.S. EPA SI NSPS Compliant Capable'],
    description:
      'Cummins GTA28 28.0 L V12 spark-ignited natural-gas generator-drive '
      + 'engine for 60 Hz standby applications. The official C500N6B '
      + 'specification publishes 500 kWe standby at 1800 RPM and identifies '
      + 'the package as EPA SI NSPS compliant capable.',
  },
  {
    slug: 'cummins-qsk60g',
    brand: 'Cummins',
    model: 'QSK60G',
    series: 'QSK60G Series',
    cylinders: 16,
    configuration: 'V16 Lean-Burn Turbocharged Aftercooled',
    displacement_l: 60.2,
    prime_power_kw_60hz: 1540,
    emissions_standard: 'U.S. EPA Stationary',
    certifications: ['U.S. EPA NSPS'],
    description:
      'Cummins QSK60G 60.2 L V16 lean-burn natural-gas generator engine. '
      + 'The official series brochure covers 50 and 60 Hz ratings from '
      + '995 to 1,540 kWe, while Cummins lists North American standby and '
      + 'demand-response packages as EPA NSPS factory certified.',
  },
]

const documents = [
  {
    source: 'https://www.generac.com/globalassets/products/business/stationary-generators/gaseous-industrial-generators/spec-sheets/sg150_9_0-150kw-industrial-gaseous-generator-specsheet.pdf',
    storagePath: 'generac/spec-sheets/sg150-9l.pdf',
    label: 'Generac SG150 9.0L Specification Sheet',
    slugs: ['generac-sg150-9l'],
  },
  {
    source: 'https://www.generac.com/globalassets/products/business/stationary-generators/gaseous-industrial-generators/spec-sheets/sg250-250kw-industrial-gaseous-generator-specsheet.pdf',
    storagePath: 'generac/spec-sheets/sg250-14.2l.pdf',
    label: 'Generac SG250 14.2L Specification Sheet',
    slugs: ['generac-sg250'],
  },
  {
    source: 'https://www.generac.com/globalassets/products/business/stationary-generators/gaseous-industrial-generators/spec-sheets/sg275-275kw-industrial-gaseous-generator-specsheet.pdf',
    storagePath: 'generac/spec-sheets/sg275-14.2l.pdf',
    label: 'Generac SG275 14.2L Specification Sheet',
    slugs: ['generac-sg275'],
  },
  {
    source: 'https://www.generac.com/globalassets/products/business/stationary-generators/gaseous-industrial-generators/spec-sheets/sg300-300kw-industrial-gaseous-generator-specsheet.pdf',
    storagePath: 'generac/spec-sheets/sg300-14.2l.pdf',
    label: 'Generac SG300 14.2L Specification Sheet',
    slugs: ['generac-sg300'],
  },
  {
    source: 'https://legacy.genconnect.generac.com/Media/vwDoc.axd?d=29eb8834-166f-4228-8059-d90dc01390b0',
    storagePath: 'generac/spec-sheets/sg1000-49l.pdf',
    label: 'Generac SG1000 49.0L Specification Sheet',
    slugs: ['generac-sg1000'],
  },
  {
    source: 'https://emc.cat.com/pubdirect.ashx?media_string_id=MSS-PET-18441744-039.pdf',
    storagePath: 'caterpillar/spec-sheets/g3306b-gas-engine.pdf',
    label: 'Caterpillar G3306B Gas Engine Specification',
    slugs: ['caterpillar-g3306b'],
  },
  {
    source: 'https://emc.cat.com/pubdirect.ashx?media_string_id=LEBE0027-',
    storagePath: 'caterpillar/brochures/g3500-gas-generator-series.pdf',
    label: 'Caterpillar G3500 Gas Generator Series Guide',
    slugs: ['caterpillar-g3512h', 'caterpillar-g3516h', 'caterpillar-g3520h'],
  },
  {
    source: 'https://mart.cummins.com/imagelibrary/data/assetfiles/0073436.pdf',
    storagePath: 'cummins/spec-sheets/gta855e-gas-gdrive.pdf',
    label: 'Cummins GTA855E Gas G-Drive Brochure',
    slugs: ['cummins-gta855e'],
  },
  {
    source: 'https://www.cummins.com/sites/default/files/2018-09/C500N6B_A042J403.pdf',
    storagePath: 'cummins/spec-sheets/gta28-c500n6b.pdf',
    label: 'Cummins GTA28 C500N6B Specification Sheet',
    slugs: ['cummins-gta28'],
  },
  {
    source: 'https://www.cummins.com/sites/default/files/2024-08/QSK60G-gas-gen-sets-5600576_0820.pdf',
    storagePath: 'cummins/brochures/qsk60g-gas-generator-series.pdf',
    label: 'Cummins QSK60G Gas Generator Series Brochure',
    slugs: ['cummins-qsk60g'],
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
  .select('id, slug, model')
  .in('slug', slugs)
if (existingError) throw existingError

const existingSlugs = new Set(existing.map((engine) => engine.slug))
console.table(records.map((record) => ({
  action: existingSlugs.has(record.slug) ? 'update' : 'insert',
  brand: record.brand,
  model: record.model,
  displacement_l: record.displacement_l,
  cylinders: record.cylinders,
})))

if (!apply) {
  console.log(
    `\nDry run: ${existing.length} records will be updated and `
    + `${records.length - existing.length} records will be inserted.`,
  )
  process.exit(0)
}

fs.mkdirSync(tempDir, { recursive: true })
for (const document of documents) {
  const localPath = path.join(tempDir, path.basename(document.storagePath))
  await downloadPdf(document.source, localPath)
  document.localPath = localPath
  console.log(`Validated ${document.label}`)
}

for (const record of records) {
  if (existingSlugs.has(record.slug)) {
    const { error } = await supabase
      .from('engines')
      .update(record)
      .eq('slug', record.slug)
    if (error) throw error
  } else {
    const { error } = await supabase.from('engines').insert(record)
    if (error) throw error
  }
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
    bucket,
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

console.log(
  `Saved ${records.length} spark-ignited records and ensured `
  + `${documents.length} official document sets.`,
)
