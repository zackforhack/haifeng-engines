import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'

const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const TR = '/Users/ziqianhuang/.claude/projects/-Users-ziqianhuang-haifeng-engines/bcbfd684-b138-4a7a-9647-c6eb4260970e/tool-results'

// Manufacturer spec-sheet PDFs downloaded & content-verified this session.
// [slug, storagePath, label, localFile]
const ENTRIES = [
  ['caterpillar-c4-4',  'caterpillar/spec-sheets/c4-4.pdf',  'Cat C4.4 Diesel Generator Set Spec Sheet (LEHE0874)',  `${TR}/webfetch-1780064850314-gf3tlx.pdf`],
  ['caterpillar-c7-1',  'caterpillar/spec-sheets/c7-1.pdf',  'Cat C7.1 Diesel Generator Set Spec Sheet (LEHE0709)',  `${TR}/webfetch-1780106480183-nx8m2s.pdf`],
  ['caterpillar-c9',    'caterpillar/spec-sheets/c9.pdf',    'Cat C9 Diesel Generator Set Spec Sheet (LEHE1612)',    `${TR}/webfetch-1780106480233-8cqfg8.pdf`],
  ['caterpillar-c13',   'caterpillar/spec-sheets/c13.pdf',   'Cat C13 Diesel Generator Set Spec Sheet (LEHE1571)',   `${TR}/webfetch-1780064913060-i8q6ik.pdf`],
  ['caterpillar-c15',   'caterpillar/spec-sheets/c15.pdf',   'Cat C15 Diesel Generator Set Spec Sheet (LEHE1637)',   `${TR}/webfetch-1780064625173-aq22gj.pdf`],
  ['caterpillar-c18',   'caterpillar/spec-sheets/c18.pdf',   'Cat C18 Diesel Generator Set Spec Sheet (LEHE1844)',   `${TR}/webfetch-1780064628880-ncusbd.pdf`],
  ['caterpillar-c27',   'caterpillar/spec-sheets/c27.pdf',   'Cat C27 Diesel Generator Set Spec Sheet',              `${TR}/webfetch-1780106557224-dfvjus.pdf`],
  ['caterpillar-3512c', 'caterpillar/spec-sheets/3512c.pdf', 'Cat 3512C Diesel Generator Set Spec Sheet',            `${TR}/webfetch-1780106578611-hgw37a.pdf`],
  ['caterpillar-3516c', 'caterpillar/spec-sheets/3516c.pdf', 'Cat 3516C Diesel Generator Set Spec Sheet',            `${TR}/webfetch-1780106658777-z6928z.pdf`],
  ['perkins-404d-22tag','perkins/spec-sheets/404d-22tag.pdf','Perkins 404D-22TAG Spec Sheet (TPD1711E)',             `${TR}/webfetch-1780109813600-pdtis8.pdf`],
]

const slugs = ENTRIES.map(e => e[0])
const { data: engines } = await supabase.from('engines').select('id, slug').in('slug', slugs)
const slugToId = Object.fromEntries(engines.map(e => [e.slug, e.id]))

let ok = 0, failed = 0
for (const [slug, storagePath, label, localFile] of ENTRIES) {
  process.stdout.write(`${slug} ... `)
  if (!fs.existsSync(localFile)) { console.log('local file missing'); failed++; continue }
  const buf = fs.readFileSync(localFile)
  if (buf.slice(0, 4).toString() !== '%PDF') { console.log('not a PDF'); failed++; continue }
  const engineId = slugToId[slug]
  if (!engineId) { console.log('engine not in DB'); failed++; continue }

  const { ok: uploaded } = await uploadPdf(supabase, BUCKET, localFile, storagePath)
  if (!uploaded) { console.log('upload failed'); failed++; continue }

  await supabase.from('engine_pdfs').delete().eq('engine_id', engineId).eq('storage_path', storagePath)
  const { error } = await supabase.from('engine_pdfs').insert({
    engine_id: engineId, type: 'datasheet', label, storage_path: storagePath, file_size_bytes: buf.length,
  })
  if (error) { console.log('link failed: ' + error.message); failed++; continue }
  console.log(`${Math.round(buf.length/1024)}KB ✓ linked`)
  ok++
}
console.log(`\n✓ ${ok} linked, ${failed} failed`)
