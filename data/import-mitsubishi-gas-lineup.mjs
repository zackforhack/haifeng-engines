// Reconcile the Mitsubishi Heavy Industries gas-engine lineup with current
// official MHI/MHIET sources. Run without --apply to preview; use --apply to
// update Supabase and attach official documents.
//
// Sources:
//   https://www.mhi.com/business/products-services/industrial-machinery/engines-diesel-gas/engine-output-range-chart
//   https://www.mhi.com/jp/technology/review/sites/g/files/jwhtju2326/files/tr/pdf/e602/e602120.pdf
//   https://www.mhi.com/technology/review/sites/g/files/jwhtju2326/files/tr/pdf/e622/e622100.pdf
//   https://www.mhi.com/group/mhiesa/products/gas-generator-sets

import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'
import os from 'os'
import path from 'path'

const apply = process.argv.includes('--apply')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY,
)
const bucket = 'engine-pdfs'
const tempDir = path.join(os.tmpdir(), 'mitsubishi-mhi-gas')

const emptyRatings = {
  prime_power_kw_50hz: null,
  prime_power_kwe_50hz: null,
  prime_power_kva_50hz: null,
  standby_power_kw_50hz: null,
  standby_power_kwe_50hz: null,
  standby_power_kva_50hz: null,
  prime_power_kw_60hz: null,
  prime_power_kwe_60hz: null,
  prime_power_kva_60hz: null,
  standby_power_kw_60hz: null,
  standby_power_kwe_60hz: null,
  standby_power_kva_60hz: null,
}

const common = {
  brand: 'Mitsubishi',
  status: 'active',
  origin: 'Japan',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  emissions_standard: null,
}

function kva(kwe, powerFactor = 0.8) {
  return Math.round((kwe / powerFactor) * 10) / 10
}

function gasRecord({
  slug,
  model,
  series,
  cylinders,
  configuration,
  displacement,
  rpm,
  kwe,
  kwm = null,
  dimensions,
  description,
}) {
  return {
    ...common,
    ...emptyRatings,
    slug,
    model,
    series,
    cylinders,
    configuration,
    displacement_l: displacement,
    rpm_rated: rpm,
    rpm_max: rpm,
    power_kw: kwm ?? kwe,
    power_hp: kwm ? Math.round(kwm * 1.34102) : null,
    prime_power_kw_50hz: kwm,
    prime_power_kwe_50hz: kwe,
    // The site normalizes electrical comparison values at 0.8 power factor.
    // MHI's published continuous kW output remains unchanged.
    prime_power_kva_50hz: kva(kwe),
    ...dimensions,
    description,
  }
}

const records = [
  gasRecord({
    slug: 'mitsubishi-gs6r2',
    model: 'GS6R2-PTK',
    series: 'GSR',
    cylinders: 6,
    configuration: 'L6',
    displacement: 29.96,
    rpm: 1500,
    kwe: 500,
    kwm: 520.8,
    dimensions: { length_mm: 1989, width_mm: 1148, height_mm: 1718, weight_kg: 2650 },
    description: 'Mitsubishi GS6R2-PTK 29.96L inline-six Miller-cycle lean-burn gas engine for continuous power and CHP. The current MGS0500G package delivers 500 kWe / 625 kVA at 1,500 rpm and 50 Hz from 520.8 kWm engine output; MHI also offers a 450 kWe / 562.5 kVA configuration at 1,200 rpm and 60 Hz. Fuel suitability includes natural gas and, subject to project specification, city gas or biogas. Published NOx values depend on package, fuel and aftertreatment and are not an EPA or Euro engine-stage certification.',
  }),
  gasRecord({
    slug: 'mitsubishi-gs12r-ptk',
    model: 'GS12R-PTK',
    series: 'GSR',
    cylinders: 12,
    configuration: 'V12',
    displacement: 49.03,
    rpm: 1500,
    kwe: 700,
    dimensions: { length_mm: 2346, width_mm: 1820, height_mm: 2137, weight_kg: 5350 },
    description: 'Mitsubishi GS12R-PTK 49.03L V12 Miller-cycle lean-burn gas engine for continuous generator and cogeneration service. MHI publishes 700 kW electrical output at 1,500 rpm and 50 Hz, with a 610 kW configuration at 1,200 rpm and 60 Hz. It uses pre-chamber spark ignition and can be configured for city gas, natural gas or biogas subject to methane-number and project requirements.',
  }),
  gasRecord({
    slug: 'mitsubishi-gs16r',
    model: 'GS16R-PTK',
    series: 'GSR',
    cylinders: 16,
    configuration: 'V16',
    displacement: 65.37,
    rpm: 1500,
    kwe: 930,
    dimensions: { length_mm: 2876, width_mm: 1820, height_mm: 2137, weight_kg: 6770 },
    description: 'Mitsubishi GS16R-PTK 65.37L V16 Miller-cycle lean-burn gas engine for continuous power and CHP. MHI publishes 930 kW electrical output at 1,500 rpm and 50 Hz; the current Japanese SGP M850 system uses this engine for 850 kW at 1,200 rpm and 60 Hz. It uses pre-chamber spark ignition and supports project-specific city-gas, natural-gas or biogas configurations.',
  }),
  gasRecord({
    slug: 'mitsubishi-gs16r2',
    model: 'GS16R2-PTK',
    series: 'GSR2',
    cylinders: 16,
    configuration: 'V16',
    displacement: 79.9,
    rpm: 1500,
    kwe: 1500,
    kwm: 1562.5,
    dimensions: { length_mm: 3051, width_mm: 1980, height_mm: 2324, weight_kg: 7850 },
    description: 'Mitsubishi GS16R2-PTK 79.9L V16 Miller-cycle lean-burn gas engine for continuous generation and CHP. The MGS1500G package delivers 1,500 kWe / 1,875 kVA at 1,500 rpm and 50 Hz from 1,562.5 kWm engine output. MHI also publishes 1,000 kW at 1,000 rpm/50 Hz and 1,200 kW at 1,200 rpm/60 Hz configurations. NOx values vary with the selected package and denitrification system.',
  }),
  gasRecord({
    slug: 'mitsubishi-g16nb-ptk',
    model: 'G16NB-PTK',
    series: 'GNB',
    cylinders: 16,
    configuration: 'V16',
    displacement: 79.9,
    rpm: 1500,
    kwe: 2000,
    dimensions: { length_mm: 4255, width_mm: 1770, height_mm: 2451, weight_kg: 11500 },
    description: 'Mitsubishi G16NB-PTK 79.9L V16 high-speed lean-burn natural-gas engine for the SGP M2000 cogeneration system. It delivers 2,000 kW electrical output at 1,500 rpm and 50 Hz with 44.3% published generation efficiency. Two-stage turbocharging, steel pistons and cylinder-specific ignition control raise output while reducing package footprint versus two 1 MW units.',
  }),
]

const kuModels = [
  { cylinders: 12, displacement: 322.3, kwe50: 3800, kwe60: 3650, length: 9850, weight: 40000 },
  { cylinders: 14, displacement: 376, kwe50: 4450, kwe60: 4250, length: 10390, weight: 48000 },
  { cylinders: 16, displacement: 430, kwe50: 5100, kwe60: 4900, length: 10930, weight: 54000 },
  { cylinders: 18, displacement: 483.5, kwe50: 5750, kwe60: 5500, length: 11470, weight: 60000 },
]

for (const spec of kuModels) {
  for (const plus of [false, true]) {
    const model = `${spec.cylinders}KU30GSI${plus ? '-PLUS' : ''}`
    const efficiency = plus ? '49.5% power-generation efficiency' : '46.5% power-generation efficiency'
    records.push(gasRecord({
      slug: `mitsubishi-${model.toLowerCase()}`,
      model,
      series: plus ? 'KU30GSI-PLUS' : 'KU30GSI',
      cylinders: spec.cylinders,
      configuration: `L${spec.cylinders}`,
      displacement: spec.displacement,
      rpm: 750,
      kwe: spec.kwe50,
      dimensions: { length_mm: spec.length, width_mm: 3180, height_mm: 4980, weight_kg: spec.weight },
      description: `Mitsubishi ${model} ${spec.displacement}L inline-${spec.cylinders} medium-speed lean-burn natural-gas engine for continuous utility power and CHP. MHI publishes ${spec.kwe50.toLocaleString()} kW electrical output at 750 rpm/50 Hz and ${spec.kwe60.toLocaleString()} kW at 720 rpm/60 Hz. The ${plus ? 'KU30GSI-PLUS' : 'KU30GSI'} prioritizes ${efficiency}; MHI specifies NOx below 320 ppm at O2=0% under its stated ISO 3046 gas and site conditions.`,
    }))
  }
}

const documents = [
  {
    url: 'https://www.mhi.com/group/mhiesa/sites/g/files/jwhtju2196/files/2023-02/MitsubishiHeavy_DataSheetA4_V10-MGS0500G.pdf',
    storagePath: 'mitsubishi/gas/mgs0500g-gs6r2-ptk.pdf',
    type: 'datasheet',
    label: 'Mitsubishi MGS0500G / GS6R2-PTK Datasheet',
    slugs: ['mitsubishi-gs6r2'],
  },
  {
    url: 'https://www.mhi.com/group/mhiesa/sites/g/files/jwhtju2196/files/2023-02/MitsubishiHeavy_DataSheetA4_V12-MGS0450G.pdf',
    storagePath: 'mitsubishi/gas/mgs0450g-gs6r2-ptk.pdf',
    type: 'datasheet',
    label: 'Mitsubishi MGS0450G / GS6R2-PTK Datasheet',
    slugs: ['mitsubishi-gs6r2'],
  },
  {
    url: 'https://www.mhi.com/group/mhiesa/sites/g/files/jwhtju2196/files/2023-02/MitsubishiHeavy_DataSheetA4_V11-MGS1500G.pdf',
    storagePath: 'mitsubishi/gas/mgs1500g-gs16r2-ptk.pdf',
    type: 'datasheet',
    label: 'Mitsubishi MGS1500G / GS16R2-PTK Datasheet',
    slugs: ['mitsubishi-gs16r2'],
  },
  {
    url: 'https://www.mhi.com/group/mhiesa/sites/g/files/jwhtju2196/files/2023-02/MitsubishiHeavy_DataSheetA4_V12-MGS1200G.pdf',
    storagePath: 'mitsubishi/gas/mgs1200g-gs16r2-ptk.pdf',
    type: 'datasheet',
    label: 'Mitsubishi MGS1200G / GS16R2-PTK Datasheet',
    slugs: ['mitsubishi-gs16r2'],
  },
  {
    url: 'https://www.mhi.com/products/energy/generator/pdf/gasgenerating_catalogue.pdf',
    storagePath: 'mitsubishi/gas/mhi-gas-engine-lineup.pdf',
    type: 'brochure',
    label: 'Mitsubishi GSR and KU Gas Engine Lineup',
    slugs: records.filter((record) => record.series !== 'GNB').map((record) => record.slug),
  },
  {
    url: 'https://www.mhi.com/jp/technology/review/sites/g/files/jwhtju2326/files/tr/pdf/e602/e602120.pdf',
    storagePath: 'mitsubishi/gas/mhi-gas-cogeneration-review-2023.pdf',
    type: 'brochure',
    label: 'MHI Gas Engine Cogeneration Technical Review (2023)',
    slugs: records.map((record) => record.slug),
  },
  {
    url: 'https://www.mhi.com/technology/review/sites/g/files/jwhtju2326/files/tr/pdf/e622/e622100.pdf',
    storagePath: 'mitsubishi/gas/ku30gsi-technical-review-2025.pdf',
    type: 'brochure',
    label: 'MHI KU30GSI Gas Engine Technical Review (2025)',
    slugs: records.filter((record) => record.series.startsWith('KU30GSI')).map((record) => record.slug),
  },
]

async function download(url, destination) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
  })
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.subarray(0, 4).toString() !== '%PDF') throw new Error(`${url}: not a PDF`)
  fs.writeFileSync(destination, buffer)
  return buffer
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_SERVICE_KEY is required')
}

console.table(records.map((record) => ({
  slug: record.slug,
  model: record.model,
  series: record.series,
  output_kwe_50hz: record.prime_power_kwe_50hz,
  rpm: record.rpm_rated,
  displacement_l: record.displacement_l,
})))

if (!apply) {
  console.log(`\nDry run: ${records.length} Mitsubishi gas-engine model pages and ${documents.length} official documents.`)
  console.log('Re-run with --apply to update Supabase.')
  process.exit(0)
}

const { error: upsertError } = await supabase.from('engines').upsert(records, { onConflict: 'slug' })
if (upsertError) throw upsertError

const { data: engines, error: engineError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', records.map((record) => record.slug))
if (engineError) throw engineError
const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))

fs.mkdirSync(tempDir, { recursive: true })
for (const document of documents) {
  const localPath = path.join(tempDir, path.basename(document.storagePath))
  process.stdout.write(`${document.label} ... `)
  const buffer = await download(document.url, localPath)
  const upload = await uploadPdf(supabase, bucket, localPath, document.storagePath)
  if (!upload.ok) throw new Error(`Failed to upload ${document.label}`)

  const targetIds = document.slugs.map((slug) => engineBySlug.get(slug)?.id).filter(Boolean)
  const { data: existing, error: existingError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('storage_path', document.storagePath)
    .in('engine_id', targetIds)
  if (existingError) throw existingError
  const linked = new Set(existing.map((row) => row.engine_id))
  const rows = targetIds
    .filter((engineId) => !linked.has(engineId))
    .map((engineId) => ({
      engine_id: engineId,
      type: document.type,
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: buffer.length,
    }))
  if (rows.length) {
    const { error: linkError } = await supabase.from('engine_pdfs').insert(rows)
    if (linkError) throw linkError
  }
  console.log(`${Math.round(buffer.length / 1024)}KB, ${rows.length} new links`)
}

console.log(`Imported ${records.length} Mitsubishi gas-engine model pages.`)
