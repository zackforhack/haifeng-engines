import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Docs for the remaining Western-brand gaps (JCB, MTU, Baudouin, Volvo Penta, Hyundai),
// from official manufacturer sites and authorized-distributor mirrors. Text/vector PDFs are
// uploaded as-is (no raster compression) to preserve legibility.
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const TMP = path.join(os.tmpdir(), 'wb2'); fs.mkdirSync(TMP, { recursive: true })
const MTU = 'https://www.mtu-solutions.com/content/dam/mtu'

const TARGETS = [
  // JCB — same 448 DieselMax base engine across all ratings; official OEM base-engine datasheet
  { brand: 'JCB', models: ['448 TA4F-75', '448 TA4F-110', '448 SV-129', '448 TA3-75', '448 TA3-100'],
    url: 'https://brinkmann-niemeijer.nl/images/downloads/Datasheets/JCB/OEM/StageV_448_129kW_Base_V3.1.pdf',
    type: 'datasheet', label: 'JCB 448 DieselMax Base Engine Datasheet', store: 'jcb/spec-sheets/448-dieselmax-base.pdf' },

  // MTU 1600 Gendrive
  { brand: 'MTU', models: ['12V1600G10', '12V1600G20'],
    url: `${MTU}/products/power-generation/powergeneration-product-list-latest/3239101_MTU_Gendrive_spec_12V1600Gx0_Gx1_3D_3E_3F_A2A.pdf/_jcr_content/renditions/original./3239101_MTU_Gendrive_spec_12V1600Gx0_Gx1_3D_3E_3F_A2A.pdf`,
    type: 'datasheet', label: 'MTU 12V1600 Gx0 Gendrive Spec Sheet', store: 'mtu/spec-sheets/12v1600-gx0.pdf' },
  { brand: 'MTU', models: ['8V1600G20', '10V1600G10', '10V1600G20'],
    url: `${MTU}/download/applications/power-generation/gen-drice-engine-series-1600/16120981_Flyer_Gendrive1600GX1_2024_01_30.pdf/_jcr_content/renditions/original.media_file.download_attachment.file/16120981_Flyer_Gendrive1600GX1_2024_01_30.pdf`,
    type: 'brochure', label: 'MTU Series 1600 Gendrive Engines', store: 'mtu/brochures/series-1600-gendrive.pdf' },

  // Baudouin — official baudouin.com spec sheets
  { brand: 'Baudouin', models: ['12M55'], url: 'https://baudouin.com/wp-content/uploads/2024/12/12M55-Spec-Sheet-MB-2025.pdf',
    type: 'datasheet', label: 'Baudouin 12M55 Spec Sheet', store: 'baudouin/spec-sheets/12M55.pdf' },
  { brand: 'Baudouin', models: ['16M55'], url: 'https://baudouin.com/wp-content/uploads/2023/10/10403_16M55_Spec_Sheet_revH.pdf',
    type: 'datasheet', label: 'Baudouin 16M55 Spec Sheet', store: 'baudouin/spec-sheets/16M55.pdf' },
  { brand: 'Baudouin', models: ['4M11G120'], url: 'https://baudouin.com/wp-content/uploads/2024/03/Baudouin-4M11-SpecSheet.pdf',
    type: 'datasheet', label: 'Baudouin 4M11 Spec Sheet', store: 'baudouin/spec-sheets/4M11.pdf' },
  { brand: 'Baudouin', models: ['20M55'], url: 'https://baudouin.com/wp-content/uploads/2022/02/2022-PowerKit-Diesel-Gas-Brochure_080222.pdf',
    type: 'brochure', label: 'Baudouin PowerKit Diesel & Gas Range', store: 'baudouin/brochures/powerkit-range.pdf' },

  // Volvo Penta — official Volvo Penta TWD16 doc (covers both models)
  { brand: 'Volvo Penta', models: ['TWD1672GE', 'TWD1673GE'],
    url: 'https://www.dbmoteurs.fr/sites/default/files/47702033_FR-DBMOTEURS-DB-MOTEURS-VOLVO-PENTA.pdf',
    type: 'manual', label: 'Volvo Penta TWD1672GE/TWD1673GE Instruction Manual', store: 'volvo/twd1672ge-twd1673ge-manual.pdf' },

  // Hyundai (HD Hyundai Infracore / Doosan) DP180 — per-model datasheets
  { brand: 'Hyundai', models: ['DP180LA'], url: 'https://fdkenergy.com/wp-content/uploads/2015/09/D560-H2-Doosan-DP180LA.pdf',
    type: 'datasheet', label: 'Hyundai DP180LA Generator Engine Spec Sheet', store: 'hyundai/dp180la-spec.pdf' },
  { brand: 'Hyundai', models: ['DP180LB'], url: 'https://germangenerator.com/wp-content/uploads/2014/09/Motordatenblatt-Doosan-DP180LB.pdf',
    type: 'datasheet', label: 'Hyundai DP180LB Generator Engine Spec Sheet', store: 'hyundai/dp180lb-spec.pdf' },
]

async function dl(url) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(60000) })
    if (!r.ok) return null
    const b = Buffer.from(await r.arrayBuffer())
    return b.slice(0, 4).toString() === '%PDF' ? b : null
  } catch { return null }
}

let linked = 0, fail = 0
for (const t of TARGETS) {
  process.stdout.write(`${t.brand} ${t.models.join('/')} ... `)
  const buf = await dl(t.url)
  if (!buf) { console.log('download failed'); fail += t.models.length; continue }
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(t.store, buf, { contentType: 'application/pdf', upsert: true })
  if (upErr) { console.log('upload failed: ' + upErr.message); fail += t.models.length; continue }
  const { data: rows } = await supabase.from('engines').select('id, model').eq('brand', t.brand).in('model', t.models)
  let n = 0
  for (const r of rows ?? []) {
    await supabase.from('engine_pdfs').delete().eq('engine_id', r.id).eq('storage_path', t.store)
    const { error } = await supabase.from('engine_pdfs').insert({ engine_id: r.id, type: t.type, label: t.label, storage_path: t.store, file_size_bytes: buf.length })
    if (!error) { n++; linked++ }
  }
  console.log(`${Math.round(buf.length / 1024)}KB ✓ ${n} link(s)`)
}
console.log(`\n✓ ${linked} engine links · ${fail} failed`)
