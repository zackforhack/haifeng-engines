// Reconcile the current Jenbacher natural-gas engine lineup with official
// Jenbacher product sheets. Run without --apply to preview; use --apply to
// update Supabase and attach the official family documents.
//
// Sources:
//   https://www.jenbacher.com/en/gas-engines/
//   https://www.jenbacher.com/wp-content/uploads/2025/05/ijb_ets_en_a4_nu_t2_bangladesch_update_2025_rz_screen_ijb-125002-en.pdf
//   https://www.jenbacher.com/wp-content/uploads/2025/05/ijb_ets_en_a4_nu_t3_bangladesch_update_2025_rz_screen_ijb-125003-en.pdf
//   https://innio.com/images/medias/files/164/ijb_ets_t4_a4_en_2025_screen_ijb-125004-en.pdf
//   https://innio.com/images/medias/files/167/ijb_ets_t6_a4_en_2025_screen_ijb-125006-en.pdf
//   https://www.jenbacher.com/en/gas-engines/type-9/j920-flextra/

import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'
import os from 'os'
import path from 'path'

const apply = process.argv.includes('--apply')
const serviceKey = process.env.SUPABASE_SERVICE_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ?? 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const bucket = 'engine-pdfs'
const tempDir = path.join(os.tmpdir(), 'jenbacher-official-2025')

if (apply && !serviceKey) {
  throw new Error('SUPABASE_SERVICE_KEY is required with --apply')
}

const round1 = (number) => Math.round(number * 10) / 10

const common = {
  brand: 'Jenbacher',
  status: 'active',
  origin: 'Austria',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  emissions_standard: 'Unregulated',
}

function record({
  slug,
  model,
  series,
  cylinders,
  configuration,
  displacement,
  rpm = 1500,
  kwe50,
  kwe60,
  efficiency,
  note = '',
}) {
  const frequencyNote = series === 'Type 6'
    ? 'The 60 Hz package uses a gearbox while the engine remains at 1,500 rpm. '
    : ''
  return {
    ...common,
    slug,
    model,
    series,
    cylinders,
    configuration,
    displacement_l: displacement,
    rpm_rated: rpm,
    rpm_max: rpm,
    power_kw: Math.max(kwe50, kwe60),
    prime_power_kw_50hz: null,
    prime_power_kwe_50hz: kwe50,
    prime_power_kva_50hz: round1(kwe50 / 0.8),
    standby_power_kw_50hz: null,
    standby_power_kwe_50hz: null,
    standby_power_kva_50hz: null,
    prime_power_kw_60hz: null,
    prime_power_kwe_60hz: kwe60,
    prime_power_kva_60hz: round1(kwe60 / 0.8),
    standby_power_kw_60hz: null,
    standby_power_kwe_60hz: null,
    standby_power_kva_60hz: null,
    description: `Jenbacher ${model} ${series} lean-burn natural-gas engine for generator and CHP service. `
      + `Jenbacher publishes up to ${kwe50.toLocaleString('en-US')} kWe at 50 Hz and `
      + `${kwe60.toLocaleString('en-US')} kWe at 60 Hz at generator terminals, with electrical `
      + `efficiency up to ${efficiency}%. ${frequencyNote}${note}`
      + 'Output and emissions depend on gas quality, NOx configuration, voltage and site conditions; '
      + 'the published NOx variants are not an EPA Tier or EU Stage engine certification.',
  }
}

const records = [
  record({
    slug: 'jenbacher-j208',
    model: 'J208',
    series: 'Type 2',
    cylinders: 8,
    configuration: 'L8',
    displacement: 16.6,
    kwe50: 361,
    kwe60: 360,
    efficiency: 41.8,
  }),
  record({
    slug: 'jenbacher-j312',
    model: 'J312',
    series: 'Type 3',
    cylinders: 12,
    configuration: 'V12',
    displacement: 29.2,
    kwe50: 635,
    kwe60: 635,
    efficiency: 43.0,
  }),
  record({
    slug: 'jenbacher-j316',
    model: 'J316',
    series: 'Type 3',
    cylinders: 16,
    configuration: 'V16',
    displacement: 38.9,
    kwe50: 850,
    kwe60: 849,
    efficiency: 43.0,
  }),
  record({
    slug: 'jenbacher-j320',
    model: 'J320',
    series: 'Type 3',
    cylinders: 20,
    configuration: 'V20',
    displacement: 48.7,
    kwe50: 1066,
    kwe60: 1062,
    efficiency: 43.2,
  }),
  record({
    slug: 'jenbacher-j412',
    model: 'J412',
    series: 'Type 4',
    cylinders: 12,
    configuration: 'V12',
    displacement: 36.7,
    kwe50: 902,
    kwe60: 853,
    efficiency: 44.1,
  }),
  record({
    slug: 'jenbacher-j416',
    model: 'J416',
    series: 'Type 4',
    cylinders: 16,
    configuration: 'V16',
    displacement: 48.9,
    kwe50: 1201,
    kwe60: 1142,
    efficiency: 44.1,
  }),
  record({
    slug: 'jenbacher-j420',
    model: 'J420',
    series: 'Type 4',
    cylinders: 20,
    configuration: 'V20',
    displacement: 61.1,
    kwe50: 1562,
    kwe60: 1427,
    efficiency: 44.1,
  }),
  record({
    slug: 'jenbacher-j612',
    model: 'J612',
    series: 'Type 6',
    cylinders: 12,
    configuration: 'V12',
    displacement: 74.9,
    kwe50: 2000,
    kwe60: 1986,
    efficiency: 45.6,
  }),
  record({
    slug: 'jenbacher-j616',
    model: 'J616',
    series: 'Type 6',
    cylinders: 16,
    configuration: 'V16',
    displacement: 99.8,
    kwe50: 2677,
    kwe60: 2662,
    efficiency: 46.5,
  }),
  record({
    slug: 'jenbacher-j620',
    model: 'J620',
    series: 'Type 6',
    cylinders: 20,
    configuration: 'V20',
    displacement: 124.8,
    kwe50: 3349,
    kwe60: 3328,
    efficiency: 45.9,
  }),
  record({
    slug: 'jenbacher-j624',
    model: 'J624',
    series: 'Type 6',
    cylinders: 24,
    configuration: 'V24',
    displacement: 149.7,
    kwe50: 4496,
    kwe60: 4467,
    efficiency: 47.1,
  }),
  record({
    slug: 'jenbacher-j920-flextra',
    model: 'J920 FleXtra',
    series: 'Type 9',
    cylinders: 20,
    configuration: 'V20',
    displacement: null,
    rpm: 1000,
    kwe50: 10606,
    kwe60: 9542,
    efficiency: 48.7,
    note: 'The modular power plant uses a 20-cylinder engine and split turbocharger-generator arrangement. ',
  }),
]

const documents = [
  {
    url: 'https://www.jenbacher.com/wp-content/uploads/2025/05/ijb_ets_en_a4_nu_t2_bangladesch_update_2025_rz_screen_ijb-125002-en.pdf',
    storagePath: 'jenbacher/official/jenbacher-type-2-2025.pdf',
    label: 'Jenbacher Type 2 Technical Data 2025',
    slugs: ['jenbacher-j208'],
  },
  {
    url: 'https://www.jenbacher.com/wp-content/uploads/2025/05/ijb_ets_en_a4_nu_t3_bangladesch_update_2025_rz_screen_ijb-125003-en.pdf',
    storagePath: 'jenbacher/official/jenbacher-type-3-2025.pdf',
    label: 'Jenbacher Type 3 Technical Data 2025',
    slugs: ['jenbacher-j312', 'jenbacher-j316', 'jenbacher-j320'],
  },
  {
    url: 'https://innio.com/images/medias/files/164/ijb_ets_t4_a4_en_2025_screen_ijb-125004-en.pdf',
    storagePath: 'jenbacher/official/jenbacher-type-4-2025.pdf',
    label: 'Jenbacher Type 4 Technical Data 2025',
    slugs: ['jenbacher-j412', 'jenbacher-j416', 'jenbacher-j420'],
  },
  {
    url: 'https://innio.com/images/medias/files/167/ijb_ets_t6_a4_en_2025_screen_ijb-125006-en.pdf',
    storagePath: 'jenbacher/official/jenbacher-type-6-2025.pdf',
    label: 'Jenbacher Type 6 Technical Data 2025',
    slugs: ['jenbacher-j612', 'jenbacher-j616', 'jenbacher-j620', 'jenbacher-j624'],
  },
  {
    url: 'https://innio.com/images/medias/files/170/innio_j920_flextra_broschuere_update_2020_en_screen_ijb-120012-en.pdf',
    storagePath: 'jenbacher/official/jenbacher-j920-flextra.pdf',
    label: 'Jenbacher J920 FleXtra Technical Brochure',
    slugs: ['jenbacher-j920-flextra'],
  },
]

console.table(records.map((engine) => ({
  model: engine.model,
  series: engine.series,
  kwe_50hz: engine.prime_power_kwe_50hz,
  kwe_60hz: engine.prime_power_kwe_60hz,
  rpm: engine.rpm_rated,
})))

if (!apply) {
  console.log(`\nDry run: ${records.length} Jenbacher models and ${documents.length} official documents.`)
  console.log('Re-run with --apply to update Supabase.')
  process.exit(0)
}

const supabase = createClient(supabaseUrl, serviceKey)
const { error: upsertError } = await supabase
  .from('engines')
  .upsert(records, { onConflict: 'slug' })
if (upsertError) throw upsertError

const { data: engines, error: engineError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', records.map((engine) => engine.slug))
if (engineError) throw engineError
const engineBySlug = new Map(engines.map((engine) => [engine.slug, engine]))

fs.mkdirSync(tempDir, { recursive: true })
for (const document of documents) {
  const localPath = path.join(tempDir, path.basename(document.storagePath))
  process.stdout.write(`${document.label} ... `)
  const response = await fetch(document.url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
  })
  if (!response.ok) throw new Error(`${document.url}: HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${document.url}: response is not a PDF`)
  }
  fs.writeFileSync(localPath, buffer)

  const upload = await uploadPdf(supabase, bucket, localPath, document.storagePath)
  if (!upload.ok) throw new Error(`Failed to upload ${document.label}`)

  const engineIds = document.slugs
    .map((slug) => engineBySlug.get(slug)?.id)
    .filter(Boolean)
  const { data: existing, error: existingError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('storage_path', document.storagePath)
    .in('engine_id', engineIds)
  if (existingError) throw existingError
  const linkedIds = new Set(existing.map((row) => row.engine_id))
  const links = engineIds
    .filter((engineId) => !linkedIds.has(engineId))
    .map((engineId) => ({
      engine_id: engineId,
      type: 'datasheet',
      label: document.label,
      storage_path: document.storagePath,
      file_size_bytes: buffer.length,
    }))
  if (links.length) {
    const { error: linkError } = await supabase.from('engine_pdfs').insert(links)
    if (linkError) throw linkError
  }
  console.log(`${Math.round(buffer.length / 1024)}KB, ${links.length} new links`)
}

console.log(`Updated ${records.length} Jenbacher model pages with 50 Hz and 60 Hz ratings.`)
