import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'
import os from 'os'
import path from 'path'

const APPLY = process.argv.includes('--apply')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
)
const bucket = 'engine-pdfs'
const tempDir = path.join(os.tmpdir(), 'haifeng-official-family-docs')
fs.mkdirSync(tempDir, { recursive: true })

const listerPetterGuideModels = [
  'SA423G1', 'SA427G1', 'SA430G1', 'SA432G1', 'SA432G2', 'SA435G1',
  'SA441G1', 'SA441G2',
  'LP311EVG1', 'LP322EVG1', 'LP322EVG2', 'LP430EVG2',
  'LP311EG1', 'LP429EG1', 'LP432EG2', 'LP435EG2',
  'LP443EG3', 'LP443EG4', 'LP443EG5', 'LP443EG6',
  'LP665EG1', 'LP665EG2', 'LP665EG3', 'LP665EG4',
  'LP689EG1', 'LP689EG2', 'LP689EG3', 'LP689EG4',
  'LP612EG1', 'LP612EG2', 'LP612EG3',
  'LP613EG1', 'LP613EG2', 'LP613EG3', 'LP613EG4',
  'LP625EG1', 'LP625EG2', 'LP625EG3', 'LP625EG4', 'LP625EG5',
  'LP625EG6', 'LP625EG7', 'LP625EG8', 'LP625EG9', 'LP625EG10',
  'LP625EG11', 'LP625EG12',
  'LP625SG1', 'LP625SG2', 'LP625SG3', 'LP625SG4',
  'LP443G1', 'LP443G2', 'LP443G3', 'LP443G4', 'LP443G5', 'LP443G6',
  'LP665G1', 'LP665G2', 'LP665G3',
  'LP689G1', 'LP689G2', 'LP689G3',
  'LP612G1', 'LP612G2', 'LP612G3',
  'LP613G1', 'LP613G2',
]

const documents = [
  {
    source:
      'https://www.volvopenta.com/-/media/volvopenta/local/us/industrial/resources-downloads/meetingtier4finaldemands477086912018.pdf',
    storagePath: 'volvo/industrial/meeting-tier-4-final-demands.pdf',
    label: 'Volvo Penta Stage IV / Tier 4 Final Engine Range Datasheet',
    type: 'datasheet',
    slugs: [
      'volvo-penta-tad570ve',
      'volvo-penta-tad571ve',
      'volvo-penta-tad572ve',
      'volvo-penta-tad870ve',
      'volvo-penta-tad871ve',
      'volvo-penta-tad872ve',
      'volvo-penta-tad873ve',
      'volvo-penta-tad1170ve',
      'volvo-penta-tad1171ve',
      'volvo-penta-tad1172ve',
      'volvo-penta-tad1371ve',
      'volvo-penta-tad1372ve',
      'volvo-penta-tad1373ve',
      'volvo-penta-tad1374ve',
      'volvo-penta-tad1375ve',
      'volvo-penta-tad1670ve',
      'volvo-penta-tad1671ve',
      'volvo-penta-tad1672ve',
    ],
  },
  {
    source:
      'https://www.cummins.com/sites/default/files/2024-08/QSK60G-gas-gen-sets-5600576_0820.pdf',
    storagePath: 'cummins/brochures/qsk60g-gas-generator-series.pdf',
    label: 'Cummins QSK60G Gas Generator Series Brochure',
    type: 'brochure',
    slugs: ['cummins-qsk60g'],
  },
  {
    source:
      'https://listerpetter.com/wp-content/uploads/2025/10/G-Drive-Engine-Range-Guide-V2509.pdf',
    storagePath: 'lister-petter/guides/g-drive-engine-range-guide-v2509.pdf',
    label: 'Lister Petter G-Drive Engine Range Guide (September 2025)',
    type: 'brochure',
    slugs: listerPetterGuideModels.map(
      (model) => `lister-petter-${model.toLowerCase()}`,
    ),
  },
]

async function downloadPdf(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
  })
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${url}: response is not a PDF`)
  }
  return buffer
}

for (const document of documents) {
  const { data: engines, error: engineError } = await supabase
    .from('engines')
    .select('id, slug')
    .in('slug', document.slugs)
  if (engineError) throw engineError

  const foundSlugs = new Set(engines.map((engine) => engine.slug))
  const missingSlugs = document.slugs.filter((slug) => !foundSlugs.has(slug))
  if (missingSlugs.length) {
    throw new Error(`Missing engine records: ${missingSlugs.join(', ')}`)
  }

  const { data: existing, error: existingError } = await supabase
    .from('engine_pdfs')
    .select('engine_id')
    .eq('storage_path', document.storagePath)
    .in(
      'engine_id',
      engines.map((engine) => engine.id),
    )
  if (existingError) throw existingError

  const linked = new Set(existing.map((row) => row.engine_id))
  const unlinked = engines.filter((engine) => !linked.has(engine.id))
  console.log(
    `${document.label}: ${unlinked.length}/${engines.length} link(s) pending`,
  )
  if (!APPLY || unlinked.length === 0) continue

  const buffer = await downloadPdf(document.source)
  const localPath = path.join(tempDir, path.basename(document.storagePath))
  fs.writeFileSync(localPath, buffer)
  const { ok } = await uploadPdf(
    supabase,
    bucket,
    localPath,
    document.storagePath,
  )
  if (!ok) throw new Error(`Upload failed: ${document.storagePath}`)

  const rows = unlinked.map((engine) => ({
    engine_id: engine.id,
    type: document.type,
    label: document.label,
    storage_path: document.storagePath,
    file_size_bytes: buffer.length,
  }))
  const { error: insertError } = await supabase.from('engine_pdfs').insert(rows)
  if (insertError) throw insertError
  console.log(`  Inserted ${rows.length} link(s), ${buffer.length} bytes`)
}

if (!APPLY) console.log('Dry run only. Re-run with --apply to upload and link.')
