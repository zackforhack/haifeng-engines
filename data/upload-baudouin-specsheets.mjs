// Upload Baudouin spec sheet PDFs from baifapower.com/static/upload/download/FADONGJI/
// 50Hz models link directly to their own record.
// 60Hz models link to the 50Hz-primary record that holds their 60Hz power data.

import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'
import path from 'path'
import os from 'os'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const STORAGE_PREFIX = 'baudouin/spec-sheets'
const TMP_DIR = path.join(os.tmpdir(), 'baudouin-specs')
fs.mkdirSync(TMP_DIR, { recursive: true })

// [display label, baifapower filename (no .pdf), db slug to link to]
const ENTRIES = [
  // ── 50Hz primary records ──
  ['4M10G70/5',    '4M10G70-5',    'baudouin-4m10g70-5'],
  ['4M10G88/5',    '4M10G88-5',    'baudouin-4m10g88-5'],
  ['4M10G110/5',   '4M10G110-5',   'baudouin-4m10g110-5'],
  ['4M10G125/5',   '4M10G125-5',   'baudouin-4m10g125-5'],
  ['6M11G150/5',   '6M11G150-5',   'baudouin-6m11g150-5'],
  ['6M11G165/5',   '6M11G165-5',   'baudouin-6m11g165-5'],
  ['6M21G400/5',   '6M21G400-5',   'baudouin-6m21g400-5'],
  ['6M21G440/5',   '6M21G440-5',   'baudouin-6m21g440-5'],
  ['6M21G500/5',   '6M21G500-5',   'baudouin-6m21g500-5'],
  ['6M21G550/5',   '6M21G550-5',   'baudouin-6m21g550-5'],
  ['6M33G660/5',   '6M33G660-5',   'baudouin-6m33g660-5'],
  ['6M33G715/5',   '6M33G715-5',   'baudouin-6m33g715-5'],
  ['6M33G750/5',   '6M33G750-5',   'baudouin-6m33g750-5'],
  ['6M33G825/5',   '6M33G825-5',   'baudouin-6m33g825-5'],
  ['8M33G900/5',   '8M33G900-5',   'baudouin-8m33g900-5'],
  ['8M33G1000/5^', '8M33G1000-5',  'baudouin-8m33g1000-5'],
  ['8M33G1100/5',  '8M33G1100-5',  'baudouin-8m33g1100-5'],
  ['12M33G1250/5', '12M33G1250-5', 'baudouin-12m33g1250-5'],
  ['12M33G1400/5', '12M33G1400-5', 'baudouin-12m33g1400-5'],
  ['12M33G1500/5', '12M33G1500-5', 'baudouin-12m33g1500-5'],
  ['12M33G1650/5', '12M33G1650-5', 'baudouin-12m33g1650-5'],
  ['16M33G1700/5', '16M33G1700-5', 'baudouin-16m33g1700-5'],
  ['16M33G1900/5', '16M33G1900-5', 'baudouin-16m33g1900-5'],
  ['16M33G2000/5', '16M33G2000-5', 'baudouin-16m33g2000-5'],
  ['16M33G2250/5^','16M33G2250-5', 'baudouin-16m33g2250-5'],
  // ── 60Hz spec sheets — linked to the 50Hz-primary DB record ──
  ['4M10G83/6',    '4M10G83-6',    'baudouin-4m10g88-5'],
  ['4M10G105/6',   '4M10G105-6',   'baudouin-4m10g110-5'],
  ['6M11G135/6',   '6M11G135-6',   'baudouin-6m11g150-5'],
  ['6M11G160/6',   '6M11G160-6',   'baudouin-6m11g165-5'],
  ['6M11G176/6',   '6M11G176-6',   'baudouin-6m11g188-5'],
  ['6M21G330/6',   '6M21G330-6',   'baudouin-6m21g400-5'],
  ['6M21G390/6',   '6M21G390-6',   'baudouin-6m21g440-5'],
  ['6M21G400/6',   '6M21G400-6',   'baudouin-6m21g500-5'],
  ['6M21G460/6',   '6M21G460-6',   'baudouin-6m21g550-5'],
  ['6M33G575/6',   '6M33G575-6',   'baudouin-6m33g660-5'],
  ['6M33G600/6',   '6M33G600-6',   'baudouin-6m33g715-5'],
  ['6M33G633/6',   '6M33G633-6',   'baudouin-6m33g750-5'],
  ['6M33G660/6',   '6M33G660-6',   'baudouin-6m33g825-5'],
  ['8M33G800/6',   '8M33G800-6',   'baudouin-8m33g1000-5'],
  ['8M33G900/6',   '8M33G900-6',   'baudouin-8m33g1100-5'],
  ['12M33G1100/6', '12M33G1100-6', 'baudouin-12m33g1250-5'],
  ['12M33G1200/6', '12M33G1200-6', 'baudouin-12m33g1400-5'],
  ['12M33G1300/6', '12M33G1300-6', 'baudouin-12m33g1500-5'],
  ['16M33G1500/6', '16M33G1500-6', 'baudouin-16m33g1700-5'],
  ['16M33G1650/6', '16M33G1650-6', 'baudouin-16m33g1900-5'],
  ['16M33G1750/6', '16M33G1750-6', 'baudouin-16m33g2000-5'],
]

// Fetch engine id map for all target slugs
const allSlugs = [...new Set(ENTRIES.map(([,,slug]) => slug))]
const { data: engines, error: engErr } = await supabase
  .from('engines').select('id, slug').in('slug', allSlugs)
if (engErr) { console.error('Failed to fetch engines:', engErr.message); process.exit(1) }
const slugToId = Object.fromEntries(engines.map(e => [e.slug, e.id]))
console.log(`Found ${engines.length} / ${allSlugs.length} engine records\n`)

let ok = 0, failed = 0

for (const [label, filename, slug] of ENTRIES) {
  const storagePath = `${STORAGE_PREFIX}/${filename}.pdf`
  const localPath   = path.join(TMP_DIR, `${filename}.pdf`)
  const sourceUrl   = `https://www.baifapower.com/static/upload/download/FADONGJI/${filename}.pdf`

  process.stdout.write(`${label} ... `)

  let buf
  if (fs.existsSync(localPath)) {
    buf = fs.readFileSync(localPath)
    process.stdout.write(`(cached) `)
  } else {
    try {
      const res = await fetch(sourceUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(30000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      buf = Buffer.from(await res.arrayBuffer())
      if (buf.slice(0, 4).toString() !== '%PDF') throw new Error(`Not a PDF`)
      fs.writeFileSync(localPath, buf)
    } catch (e) {
      console.log(`Download failed: ${e.message}`)
      failed++
      continue
    }
  }

  process.stdout.write(`${Math.round(buf.length / 1024)}KB `)

  const { ok: uploaded } = await uploadPdf(supabase, BUCKET, localPath, storagePath)
  if (!uploaded) { console.log('Upload failed'); failed++; continue }

  const engineId = slugToId[slug]
  if (!engineId) { console.warn(`Not in DB: ${slug}`); failed++; continue }

  await supabase.from('engine_pdfs').delete()
    .eq('engine_id', engineId).eq('storage_path', storagePath)
  const { error: insertErr } = await supabase.from('engine_pdfs').insert({
    engine_id: engineId,
    type: 'datasheet',
    label: `${label} Specification Sheet`,
    storage_path: storagePath,
    file_size_bytes: buf.length,
  })
  if (insertErr) console.warn(`DB insert failed for ${slug}: ${insertErr.message}`)
  else process.stdout.write(`→ ${slug} `)

  console.log()
  ok++
}

console.log(`\n=== DONE: ${ok} uploaded, ${failed} failed ===`)
