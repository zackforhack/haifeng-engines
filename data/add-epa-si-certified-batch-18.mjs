// Correct Waukesha VGF package/engine identities and mechanical ratings from
// INNIO's official power-rating guide. Also resolve two audit metadata errors.
// Dry-run by default; pass --apply to write and link the official PDF.

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
const source =
  'https://innio.com/images/medias/files/1147/'
  + 'iwk-019010_innio-waukesha-power-rating-2023.pdf'
const storagePath = 'waukesha/guides/innio-waukesha-power-ratings-2023.pdf'
const label = 'INNIO Waukesha Power Ratings 2023'
const localPath = path.join(os.tmpdir(), path.basename(storagePath))

const updates = [
  {
    slug: 'waukesha-vgf-f18gsi',
    values: {
      model: 'VGF18GL/GLD (F18GL/GLD)',
      configuration: 'L6 Turbocharged Intercooled Lean Burn',
      compression_ratio: '11:1',
      power_kw: 330,
      prime_power_kw_60hz: 330,
      prime_power_kwe_60hz: 310,
      standby_power_kw_60hz: null,
      standby_power_kwe_60hz: 315,
      description:
        'Waukesha VGF18GL/GLD is the remote-radiator generator package '
        + 'using the 18 L F18GL/GLD inline-six natural-gas engine. INNIO '
        + 'publishes 330 kWb continuous engine output at 1800 RPM, with '
        + '310 kWe continuous and 315 kWe standby package ratings at 60 Hz.',
    },
  },
  {
    slug: 'waukesha-vgf-h24gsi',
    values: {
      model: 'VGF24GL/GLD (H24GL/GLD)',
      configuration: 'L8 Turbocharged Intercooled Lean Burn',
      compression_ratio: '11:1',
      power_kw: 440,
      prime_power_kw_60hz: 440,
      prime_power_kwe_60hz: 415,
      standby_power_kw_60hz: null,
      standby_power_kwe_60hz: 425,
      description:
        'Waukesha VGF24GL/GLD is the remote-radiator generator package '
        + 'using the 24 L H24GL/GLD inline-eight natural-gas engine. INNIO '
        + 'publishes 440 kWb continuous engine output at 1800 RPM, with '
        + '415 kWe continuous and 425 kWe standby package ratings at 60 Hz.',
    },
  },
  {
    slug: 'waukesha-vgf-l36gsi',
    values: {
      model: 'VGF36GSI/GSID (L36GSI/GSID)',
      configuration: 'V12 Turbocharged Intercooled',
      compression_ratio: '8.6:1',
      power_kw: 600,
      prime_power_kw_60hz: 600,
      prime_power_kwe_60hz: 560,
      standby_power_kw_60hz: null,
      standby_power_kwe_60hz: 620,
      description:
        'Waukesha VGF36GSI/GSID is the remote-radiator generator package '
        + 'using the 36 L L36GSI/GSID V12 natural-gas engine. INNIO '
        + 'publishes 600 kWb continuous engine output at 1800 RPM, with '
        + '560 kWe continuous and 620 kWe standby package ratings at 60 Hz.',
    },
  },
  {
    slug: 'waukesha-vgf-p48gsi',
    values: {
      model: 'VGF48GSI/GSID (P48GSI/GSID)',
      configuration: 'V16 Turbocharged Intercooled',
      compression_ratio: '8.6:1',
      power_kw: 800,
      prime_power_kw_60hz: 800,
      prime_power_kwe_60hz: 750,
      standby_power_kw_60hz: null,
      standby_power_kwe_60hz: 825,
      description:
        'Waukesha VGF48GSI/GSID is the remote-radiator generator package '
        + 'using the 48 L P48GSI/GSID V16 natural-gas engine. INNIO '
        + 'publishes 800 kWb continuous engine output at 1800 RPM, with '
        + '750 kWe continuous and 825 kWe standby package ratings at 60 Hz.',
    },
  },
  {
    slug: 'psi-gas-4-3l',
    values: {
      configuration: 'V6 Naturally Aspirated',
      description:
        'PSI 4.3L is a 4.29 L V6 naturally aspirated spark-ignition '
        + 'natural-gas generator engine. Natural-gas ratings: 50 Hz prime '
        + '35 kWe / 43 kWm; 50 Hz standby 40 kWe / 48 kWm; 60 Hz prime '
        + '40 kWe / 52 kWm; 60 Hz standby 50 kWe / 58 kWm. Ratings exclude '
        + 'propane/LPG data and were verified from the official PSI catalog.',
    },
  },
  {
    slug: 'mtu-10v0068-gs100',
    values: {
      description:
        'MTU 10V0068 GS100 is a legacy 100 kWe standby gas generator '
        + 'platform powered by the MTU 6.8LT V10. The turbocharged 6.8 L '
        + 'spark-ignited engine is rated 132 kWm at 1800 RPM on natural '
        + 'gas and uses a three-way catalyst. It must not be used as a '
        + 'substitute for the naturally aspirated EPA family DMDDB06.8GBX.',
    },
  },
]

const waukeshaSlugs = updates
  .map((update) => update.slug)
  .filter((slug) => slug.startsWith('waukesha-'))
const slugs = updates.map((update) => update.slug)
const { data: existing, error: existingError } = await supabase
  .from('engines')
  .select('id, slug')
  .in('slug', slugs)
if (existingError) throw existingError
if (existing.length !== slugs.length) {
  const found = new Set(existing.map((engine) => engine.slug))
  throw new Error(`Missing records: ${slugs.filter((slug) => !found.has(slug)).join(', ')}`)
}

console.table(updates.map((update) => ({
  slug: update.slug,
  model: update.values.model || '(metadata correction)',
  kwm: update.values.power_kw ?? '(unchanged)',
})))

if (!apply) {
  console.log(`Dry run: ${updates.length} updates and one official PDF link set.`)
  process.exit(0)
}

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
fs.writeFileSync(localPath, buffer)

for (const update of updates) {
  const { error } = await supabase
    .from('engines')
    .update(update.values)
    .eq('slug', update.slug)
  if (error) throw error
}

const uploaded = await uploadPdf(
  supabase,
  'engine-pdfs',
  localPath,
  storagePath,
)
if (!uploaded.ok) throw new Error(`Could not upload ${storagePath}`)

const engineBySlug = new Map(existing.map((engine) => [engine.slug, engine]))
const engineIds = waukeshaSlugs.map((slug) => engineBySlug.get(slug).id)
const { data: linked, error: linkedError } = await supabase
  .from('engine_pdfs')
  .select('engine_id')
  .eq('storage_path', storagePath)
  .in('engine_id', engineIds)
if (linkedError) throw linkedError

const linkedIds = new Set(linked.map((row) => row.engine_id))
const rows = engineIds
  .filter((engineId) => !linkedIds.has(engineId))
  .map((engineId) => ({
    engine_id: engineId,
    type: 'datasheet',
    label,
    storage_path: storagePath,
    file_size_bytes: fs.statSync(localPath).size,
  }))
if (rows.length) {
  const { error } = await supabase.from('engine_pdfs').insert(rows)
  if (error) throw error
}

console.log(
  `Applied ${updates.length} corrections and linked the official INNIO `
  + `guide to ${waukeshaSlugs.length} Waukesha records.`,
)
