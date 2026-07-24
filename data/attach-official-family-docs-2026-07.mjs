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
  {
    localFile: 'data/source-pdfs/2026 Volvo Engine Selector.pdf',
    storagePath: 'volvo/guides/power-generation-engine-selector.pdf',
    label: 'Volvo Penta Power Generation Engine Selector',
    type: 'datasheet',
    slugs: [
      'volvo-penta-tad580ve',
      'volvo-penta-tad581ve',
      'volvo-penta-tad582ve',
      'volvo-penta-tad880ve',
      'volvo-penta-tad881ve',
      'volvo-penta-tad882ve',
      'volvo-penta-tad883ve',
      'volvo-penta-tad1181ve',
      'volvo-penta-tad1381ve',
      'volvo-penta-tad1382ve',
      'volvo-penta-tad1383ve',
      'volvo-penta-tad1384ve',
      'volvo-penta-tad1385ve',
    ],
  },
  {
    source: 'https://pubs.volvopenta.com/publications/47711550',
    storagePath: 'volvo/industrial/twd1683ve-publication-47711550.pdf',
    label: 'Volvo Penta TWD1683VE Product Datasheet',
    type: 'datasheet',
    slugs: ['volvo-penta-twd1683ve'],
  },
  {
    source:
      'https://www.cummins.com/sites/default/files/2018-08/201805%20-%20Cummins%20PowerHour%20-Lean%20Burn%20Natural%20Gas%20Generator%20Sets%20in%20Standby-Peak%20Shaving.pdf',
    storagePath: 'cummins/brochures/lean-burn-natural-gas-powerhour.pdf',
    label: 'Cummins Lean-Burn Natural Gas Generator Technical Presentation',
    type: 'brochure',
    slugs: ['cummins-qsv91g'],
  },
  {
    source:
      'https://fayfaantech.com/Uploads/pro/Natural-Gas--Biogas-Engines.34.1.pdf',
    storagePath: 'cummins/brochures/chongqing-cummins-gas-engine-2024.pdf',
    label:
      'Chongqing Cummins Gas Engine 2024 Product Brochure (supplier-hosted copy)',
    type: 'brochure',
    slugs: [
      'cummins-k19n-g1',
      'cummins-k19n-g3',
      'cummins-k19n-g4',
      'cummins-k38n-g5',
      'cummins-k38n-g6',
      'cummins-k38n-g7',
      'cummins-k38n-g8',
      'cummins-k50n-g9',
      'cummins-k50n-g10',
    ],
  },
  {
    source:
      'https://baudouin.com/wp-content/uploads/2025/04/Baudouin-RatingCard-Diesel-50Hz-191125-WEB.pdf',
    referer: 'https://baudouin.com/engine_product/6m31/',
    storagePath:
      'baudouin/rating-cards/baudouin-diesel-50hz-november-2025.pdf',
    label: 'Baudouin Diesel PowerKit 50 Hz Rating Card (November 2025)',
    type: 'datasheet',
    slugs: [
      'baudouin-4m08g2d3-5',
      'baudouin-4m08g4d3-5',
      'baudouin-4m08g6d3-5',
      'baudouin-4m08g8d3-5',
      'baudouin-4m08g10d3-5',
      'baudouin-4m12g1d3-5',
      'baudouin-4m12g2d3-5',
      'baudouin-4m12g4d3-5',
      'baudouin-4m12g2d5-s',
      'baudouin-6m12g2d3-5',
      'baudouin-6m12g4d3-5',
      'baudouin-6m12g6d3-5',
      'baudouin-6m12g8d3-5',
      'baudouin-6m13g2d5-s',
      'baudouin-6m13g4d5-s',
      'baudouin-6m13g6d5-s',
      'baudouin-6m13g8d5-s',
      'baudouin-6m31g660-5',
      'baudouin-6m31g725-5',
      'baudouin-6m31g750-5',
      'baudouin-6m31g825-5',
      'baudouin-6m31g900-5',
      'baudouin-6m31g1000-5',
    ],
  },
  {
    source:
      'https://baudouin.com/wp-content/uploads/2025/04/Baudouin-RatingCard-Diesel-60Hz-191125-WEB.pdf',
    referer: 'https://baudouin.com/engine_product/6m31/',
    storagePath:
      'baudouin/rating-cards/baudouin-diesel-60hz-november-2025.pdf',
    label: 'Baudouin Diesel PowerKit 60 Hz Rating Card (November 2025)',
    type: 'datasheet',
    slugs: [
      'baudouin-6m31g528-6',
      'baudouin-6m31g580-6',
      'baudouin-6m31g600-6',
      'baudouin-6m31g700-6',
      'baudouin-6m31g800-6',
    ],
  },
  {
    source:
      'https://baudouin.com/wp-content/uploads/2022/05/10012_MB_NG_4M11_Spec_Sheet_revH_converted.pdf',
    referer: 'https://baudouin.com/engine_product/4m11-2/',
    storagePath: 'baudouin/datasheets/4m11-natural-gas-spec-sheet.pdf',
    label: 'Baudouin 4M11 Natural Gas PowerKit Specification Sheet',
    type: 'datasheet',
    slugs: ['baudouin-4m11g4n0-5'],
  },
  {
    localFile:
      '/Users/ziqianhuang/Downloads/PSI_PowerSystems_ProductBrochure_Y24 FINAL.pdf',
    storagePath: 'psi/brochures/power-systems-product-brochure-y24.pdf',
    label: 'PSI Power Systems Product Brochure Y24',
    type: 'brochure',
    slugs: [
      'psi-psi-26l-d-700kwe',
      'psi-psi-26l-d-840kwe',
      'psi-psi-66l-d-2300kwe',
      'psi-psi-66l-d-2500kwe',
    ],
  },
  {
    source:
      'https://www.mtu-solutions.com/content/dam/mtu/products/power-generation/powergeneration-product-list-latest/3237291_PG_spec_8V12V16V20V4000GS_3A_NG_NOx500_60Hz.pdf/_jcr_content/renditions/original./3237291_PG_spec_8V12V16V20V4000GS_3A_NG_NOx500_60Hz.pdf',
    storagePath:
      'mtu/datasheets/series-4000-natural-gas-60hz-nox500.pdf',
    label:
      'MTU Series 4000 Natural Gas 60 Hz Generator Set Specification Sheet',
    type: 'datasheet',
    slugs: [
      'mtu-8v4000-gs',
      'mtu-12v4000-gs',
      'mtu-16v4000-gs',
      'mtu-20v4000-gs',
    ],
  },
  {
    source: 'https://www.sdeciepower.com/upload/3694/download/1/pdf/8.pdf',
    storagePath: 'sdec/manuals/e-series-operation-and-maintenance.pdf',
    label: 'SDEC E Series Engine Operation and Maintenance Manual',
    type: 'manual',
    slugs: [
      'sdec-sc12e420d2',
      'sdec-sc12e460d2',
      'sdec-sc12e480d2',
    ],
  },
  {
    source: 'https://www.sdeciepower.com/upload/3694/download/1/pdf/9.pdf',
    storagePath: 'sdec/manuals/h-series-operation-and-maintenance.pdf',
    label: 'SDEC H Series Engine Operation and Maintenance Manual',
    type: 'manual',
    slugs: ['sdec-sc4h95d2', 'sdec-sc4h115d2'],
  },
  {
    source:
      'https://www.sdeciepower.com/upload/3694/download/1/pdf/new_download-01.pdf',
    storagePath:
      'sdec/manuals/g-series-improved-operation-and-maintenance.pdf',
    label:
      'SDEC G Series Improved Engine Operation and Maintenance Manual',
    type: 'manual',
    slugs: ['sdec-sc13g420d2', 'sdec-sc15g500d2'],
  },
  {
    source:
      'https://emc.cat.com/pubdirect.ashx?media_string_id=LEHW0258-',
    storagePath: 'caterpillar/datasheets/g3606-adem-a4-gas-engine.pdf',
    label: 'Cat G3606 ADEM A4 Gas Engine Technical Datasheet',
    type: 'datasheet',
    slugs: ['caterpillar-g3606'],
  },
  {
    source:
      'https://emc.cat.com/pubdirect.ashx?media_string_id=LEHW0260-',
    storagePath: 'caterpillar/datasheets/g3612-adem-a4-gas-engine.pdf',
    label: 'Cat G3612 ADEM A4 Gas Engine Technical Datasheet',
    type: 'datasheet',
    slugs: ['caterpillar-g3612'],
  },
  {
    source:
      'https://emc.cat.com/pubdirect.ashx?media_string_id=LEBQ6484-',
    storagePath:
      'caterpillar/datasheets/g3400-generator-set-engine-performance.pdf',
    label: 'Cat G3400 Generator Set Engine Performance Guide',
    type: 'datasheet',
    slugs: ['caterpillar-g3408'],
  },
  {
    source:
      'https://emc.cat.com/pubdirect.ashx?media_string_id=MSS-EPG-18491839-020.pdf',
    storagePath:
      'caterpillar/datasheets/3606-medium-speed-generator-set-50hz.pdf',
    label: 'Cat 3606 Medium-Speed Generator Set Datasheet (50 Hz)',
    type: 'datasheet',
    slugs: ['caterpillar-3606'],
  },
  {
    source:
      'https://emc.cat.com/pubdirect.ashx?media_string_id=MSS-EPG-1000028936-094.pdf',
    storagePath:
      'caterpillar/datasheets/3608-medium-speed-generator-set.pdf',
    label: 'Cat 3608 Medium-Speed Generator Set Datasheet',
    type: 'datasheet',
    slugs: ['caterpillar-3608'],
  },
  {
    source:
      'https://emc.cat.com/pubdirect.ashx?media_string_id=MSS-EPG-18492095-018.pdf',
    storagePath:
      'caterpillar/datasheets/3616-medium-speed-generator-set.pdf',
    label: 'Cat 3616 Medium-Speed Generator Set Datasheet',
    type: 'datasheet',
    slugs: ['caterpillar-3616'],
  },
  {
    source:
      'https://emc.cat.com/pubdirect.ashx?media_string_id=MSS-IND-18391766-034.pdf',
    storagePath: 'caterpillar/datasheets/c1-1-industrial-diesel-engine.pdf',
    label: 'Cat C1.1 Industrial Diesel Engine Datasheet',
    type: 'datasheet',
    slugs: ['caterpillar-c1-1'],
  },
  {
    source:
      'https://emc.cat.com/pubdirect.ashx?media_string_id=MSS-IND-18391802-007.pdf',
    storagePath: 'caterpillar/datasheets/c1-5-industrial-diesel-engine.pdf',
    label: 'Cat C1.5 Industrial Diesel Engine Datasheet',
    type: 'datasheet',
    slugs: ['caterpillar-c1-5'],
  },
  {
    source:
      'https://master.parts.hatz.com/out/media/ersatzteillisten/EL_L41_43450025.pdf',
    storagePath: 'hatz/manuals/l41c-original-spare-parts-list.pdf',
    label: 'Hatz 2-4 L41C Original Spare Parts List',
    type: 'manual',
    slugs: ['hatz-2l41c', 'hatz-3l41c', 'hatz-4l41c'],
  },
  {
    source:
      'https://master.parts.hatz.com/out/media/ersatzteillisten/EL_M41_43460022.pdf',
    storagePath: 'hatz/manuals/m41-original-spare-parts-list.pdf',
    label: 'Hatz 2-4 M41 Original Spare Parts List',
    type: 'manual',
    slugs: ['hatz-2m41', 'hatz-3m41', 'hatz-4m41'],
  },
]

async function loadPdf(document) {
  if (document.localFile) {
    const buffer = fs.readFileSync(path.resolve(document.localFile))
    if (buffer.subarray(0, 4).toString() !== '%PDF') {
      throw new Error(`${document.localFile}: file is not a PDF`)
    }
    return buffer
  }

  const response = await fetch(document.source, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      ...(document.referer ? { Referer: document.referer } : {}),
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
  })
  if (!response.ok) {
    throw new Error(`${document.source}: HTTP ${response.status}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    throw new Error(`${document.source}: response is not a PDF`)
  }
  return buffer
}

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

async function selectWithRetry(label, operation, attempts = 5) {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const result = await operation()
    if (!result.error) return result.data
    lastError = result.error
    if (attempt < attempts) {
      const delay = 500 * 2 ** (attempt - 1)
      console.warn(
        `${label}: ${result.error.message}; retrying in ${delay}ms ` +
          `(${attempt}/${attempts})`,
      )
      await sleep(delay)
    }
  }
  throw lastError
}

for (const document of documents) {
  const engines = await selectWithRetry(`${document.label} engine lookup`, () =>
    supabase.from('engines').select('id, slug').in('slug', document.slugs),
  )

  const foundSlugs = new Set(engines.map((engine) => engine.slug))
  const missingSlugs = document.slugs.filter((slug) => !foundSlugs.has(slug))
  if (missingSlugs.length) {
    throw new Error(`Missing engine records: ${missingSlugs.join(', ')}`)
  }

  const existing = await selectWithRetry(
    `${document.label} document lookup`,
    () =>
      supabase
        .from('engine_pdfs')
        .select('engine_id')
        .eq('storage_path', document.storagePath)
        .in(
          'engine_id',
          engines.map((engine) => engine.id),
        ),
  )

  const linked = new Set(existing.map((row) => row.engine_id))
  const unlinked = engines.filter((engine) => !linked.has(engine.id))
  console.log(
    `${document.label}: ${unlinked.length}/${engines.length} link(s) pending`,
  )
  if (!APPLY || unlinked.length === 0) continue

  const buffer = await loadPdf(document)
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
