// Download and upload MTU G-Drive spec sheet PDFs to Supabase
// Source: baifapower.com/static/upload/download/FADONGJI/

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
const STORAGE_PREFIX = 'mtu/spec-sheets'
const TMP_DIR = path.join(os.tmpdir(), 'mtu-specs')
fs.mkdirSync(TMP_DIR, { recursive: true })

// [model display name, storage filename, slug, baifapower source filename]
const ENTRIES = [
  ['MTU 12V2000 G25',  '12v2000-g25.pdf',  'mtu-12v2000-g25',  '12V2000G25.pdf'],
  ['MTU 12V2000 G26F', '12v2000-g26f.pdf', 'mtu-12v2000-g26f', '12V2000G26F.pdf'],
  ['MTU 12V2000 G45',  '12v2000-g45.pdf',  'mtu-12v2000-g45',  '12V2000G45.pdf'],
  ['MTU 12V2000 G65',  '12v2000-g65.pdf',  'mtu-12v2000-g65',  '12V2000G65.pdf'],
  ['MTU 12V2000 G85',  '12v2000-g85.pdf',  'mtu-12v2000-g85',  '12V2000G85.pdf'],
  ['MTU 16V2000 G25',  '16v2000-g25.pdf',  'mtu-16v2000-g25',  '16V2000G25.pdf'],
  ['MTU 16V2000 G45',  '16v2000-g45.pdf',  'mtu-16v2000-g45',  '16V2000G45.pdf'],
  ['MTU 16V2000 G65',  '16v2000-g65.pdf',  'mtu-16v2000-g65',  '16V2000G65.pdf'],
  ['MTU 16V2000 G85',  '16v2000-g85.pdf',  'mtu-16v2000-g85',  '16V2000G85.pdf'],
  ['MTU 18V2000 G26F', '18v2000-g26f.pdf', 'mtu-18v2000-g26f', '18V2000G26F.pdf'],
  ['MTU 18V2000 G65',  '18v2000-g65.pdf',  'mtu-18v2000-g65',  '18V2000G65.pdf'],
  ['MTU 18V2000 G76F', '18v2000-g76f.pdf', 'mtu-18v2000-g76f', '18V2000G76F.pdf'],
  ['MTU 18V2000 G85',  '18v2000-g85.pdf',  'mtu-18v2000-g85',  '18V2000G85.pdf'],
  ['MTU 12V4000 G14F', '12v4000-g14f.pdf', 'mtu-12v4000-g14f', '12V4000G14F.pdf'],
  ['MTU 12V4000 G14S', '12v4000-g14s.pdf', 'mtu-12v4000-g14s', '12V4000G14S.pdf'],
  ['MTU 12V4000 G23',  '12v4000-g23.pdf',  'mtu-12v4000-g23',  '12V4000G23.pdf'],
  ['MTU 12V4000 G24F', '12v4000-g24f.pdf', 'mtu-12v4000-g24f', '12V4000G24F.pdf'],
  ['MTU 12V4000 G24S', '12v4000-g24s.pdf', 'mtu-12v4000-g24s', '12V4000G24S.pdf'],
  ['MTU 12V4000 G43',  '12v4000-g43.pdf',  'mtu-12v4000-g43',  '12V4000G43.pdf'],
  ['MTU 12V4000 G63',  '12v4000-g63.pdf',  'mtu-12v4000-g63',  '12V4000G63.pdf'],
  ['MTU 12V4000 G74F', '12v4000-g74f.pdf', 'mtu-12v4000-g74f', '12V4000G74F.pdf'],
  ['MTU 12V4000 G83',  '12v4000-g83.pdf',  'mtu-12v4000-g83',  '12V4000G83.pdf'],
  ['MTU 12V4000 G84F', '12v4000-g84f.pdf', 'mtu-12v4000-g84f', '12V4000G84F.pdf'],
  ['MTU 12V4000 G84S', '12v4000-g84s.pdf', 'mtu-12v4000-g84s', '12V4000G84S.pdf'],
  ['MTU 16V4000 G14F', '16v4000-g14f.pdf', 'mtu-16v4000-g14f', '16V4000G14F.pdf'],
  ['MTU 16V4000 G14S', '16v4000-g14s.pdf', 'mtu-16v4000-g14s', '16V4000G14S.pdf'],
  ['MTU 16V4000 G23',  '16v4000-g23.pdf',  'mtu-16v4000-g23',  '16V4000G23.pdf'],
  ['MTU 16V4000 G24F', '16v4000-g24f.pdf', 'mtu-16v4000-g24f', '16V4000G24F.pdf'],
  ['MTU 16V4000 G24S', '16v4000-g24s.pdf', 'mtu-16v4000-g24s', '16V4000G24S.pdf'],
  ['MTU 16V4000 G43',  '16v4000-g43.pdf',  'mtu-16v4000-g43',  '16V4000G43.pdf'],
  ['MTU 16V4000 G63',  '16v4000-g63.pdf',  'mtu-16v4000-g63',  '16V4000G63.pdf'],
  ['MTU 16V4000 G74F', '16v4000-g74f.pdf', 'mtu-16v4000-g74f', '16V4000G74F.pdf'],
  ['MTU 16V4000 G74S', '16v4000-g74s.pdf', 'mtu-16v4000-g74s', '16V4000G74S.pdf'],
  ['MTU 16V4000 G83',  '16v4000-g83.pdf',  'mtu-16v4000-g83',  '16V4000G83.pdf'],
  ['MTU 16V4000 G83L', '16v4000-g83l.pdf', 'mtu-16v4000-g83l', '16V4000G83L.pdf'],
  ['MTU 16V4000 G84F', '16v4000-g84f.pdf', 'mtu-16v4000-g84f', '16V4000G84F.pdf'],
  ['MTU 16V4000 G84S', '16v4000-g84s.pdf', 'mtu-16v4000-g84s', '16V4000G84S.pdf'],
  ['MTU 16V4000 G94S', '16v4000-g94s.pdf', 'mtu-16v4000-g94s', '16V4000G94S.pdf'],
  ['MTU 20V4000 G14F', '20v4000-g14f.pdf', 'mtu-20v4000-g14f', '20V4000G14F.pdf'],
  ['MTU 20V4000 G14S', '20v4000-g14s.pdf', 'mtu-20v4000-g14s', '20V4000G14S.pdf'],
  ['MTU 20V4000 G23',  '20v4000-g23.pdf',  'mtu-20v4000-g23',  '20V4000G23.pdf'],
  ['MTU 20V4000 G23F', '20v4000-g23f.pdf', 'mtu-20v4000-g23f', '20V4000G23F.pdf'],
  ['MTU 20V4000 G24F', '20v4000-g24f.pdf', 'mtu-20v4000-g24f', '20V4000G24F.pdf'],
  ['MTU 20V4000 G24S', '20v4000-g24s.pdf', 'mtu-20v4000-g24s', '20V4000G24S.pdf'],
  ['MTU 20V4000 G34F', '20v4000-g34f.pdf', 'mtu-20v4000-g34f', '20V4000G34F.pdf'],
  ['MTU 20V4000 G43',  '20v4000-g43.pdf',  'mtu-20v4000-g43',  '20V4000G43.pdf'],
  ['MTU 20V4000 G44F', '20v4000-g44f.pdf', 'mtu-20v4000-g44f', '20V4000G44F.pdf'],
  ['MTU 20V4000 G44S', '20v4000-g44s.pdf', 'mtu-20v4000-g44s', '20V4000G44S.pdf'],
  ['MTU 20V4000 G63',  '20v4000-g63.pdf',  'mtu-20v4000-g63',  '20V4000G63.pdf'],
  ['MTU 20V4000 G63F', '20v4000-g63f.pdf', 'mtu-20v4000-g63f', '20V4000G63F.pdf'],
  ['MTU 20V4000 G63L', '20v4000-g63l.pdf', 'mtu-20v4000-g63l', '20V4000G63L.pdf'],
  ['MTU 20V4000 G63LF','20v4000-g63lf.pdf','mtu-20v4000-g63lf','20V4000G63LF.pdf'],
  ['MTU 20V4000 G64F', '20v4000-g64f.pdf', 'mtu-20v4000-g64f', '20V4000G64F.pdf'],
  ['MTU 20V4000 G64S', '20v4000-g64s.pdf', 'mtu-20v4000-g64s', '20V4000G64S.pdf'],
  ['MTU 20V4000 G74F', '20v4000-g74f.pdf', 'mtu-20v4000-g74f', '20V4000G74F.pdf'],
  ['MTU 20V4000 G74S', '20v4000-g74s.pdf', 'mtu-20v4000-g74s', '20V4000G74S.pdf'],
  ['MTU 20V4000 G83',  '20v4000-g83.pdf',  'mtu-20v4000-g83',  '20V4000G83.pdf'],
  ['MTU 20V4000 G83L', '20v4000-g83l.pdf', 'mtu-20v4000-g83l', '20V4000G83L.pdf'],
  ['MTU 20V4000 G84F', '20v4000-g84f.pdf', 'mtu-20v4000-g84f', '20V4000G84F.pdf'],
  ['MTU 20V4000 G94F', '20v4000-g94f.pdf', 'mtu-20v4000-g94f', '20V4000G94F.pdf'],
  ['MTU 20V4000 G94S', '20v4000-g94s.pdf', 'mtu-20v4000-g94s', '20V4000G94S.pdf'],
]

const allSlugs = ENTRIES.map(([,,slug]) => slug)
const { data: engines, error: engErr } = await supabase
  .from('engines').select('id, slug').in('slug', allSlugs)
if (engErr) { console.error('Failed to fetch engines:', engErr.message); process.exit(1) }
const slugToId = Object.fromEntries(engines.map(e => [e.slug, e.id]))
console.log(`Found ${engines.length} / ${allSlugs.length} engine records\n`)

let ok = 0, failed = 0

for (const [model, filename, slug, srcFilename] of ENTRIES) {
  const storagePath = `${STORAGE_PREFIX}/${filename}`
  const localPath   = path.join(TMP_DIR, srcFilename)
  const sourceUrl   = `https://www.baifapower.com/static/upload/download/FADONGJI/${srcFilename}`

  process.stdout.write(`${model} ... `)

  // Re-use already-downloaded file if present, otherwise fetch
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
  if (!uploaded) {
    console.log('Upload failed')
    failed++
    continue
  }

  const engineId = slugToId[slug]
  if (!engineId) { console.warn(`Not in DB: ${slug}`); failed++; continue }

  await supabase.from('engine_pdfs').delete()
    .eq('engine_id', engineId).eq('storage_path', storagePath)
  const { error: insertErr } = await supabase.from('engine_pdfs').insert({
    engine_id: engineId,
    type: 'datasheet',
    label: `${model} Technical Sales Document`,
    storage_path: storagePath,
    file_size_bytes: buf.length,
  })
  if (insertErr) console.warn(`DB insert failed for ${slug}: ${insertErr.message}`)
  else process.stdout.write(`→${slug} `)

  console.log()
  ok++
}

console.log(`\n=== DONE: ${ok} uploaded, ${failed} failed ===`)
