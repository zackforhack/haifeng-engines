import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'
import path from 'path'
import os from 'os'

for (const envFile of ['.env.local', '.env']) {
  try {
    for (const rawLine of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#') || !line.includes('=')) continue
      const separator = line.indexOf('=')
      const key = line.slice(0, separator).trim()
      const value = line
        .slice(separator + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '')
      if (key && process.env[key] == null) process.env[key] = value
    }
  } catch {
    // Local environment files are optional in CI.
  }
}

// John Deere generator-drive spec sheets live at /specsheets/{MODEL}_{REV}.pdf with an
// irregular revision suffix (e.g. 6090HFG84_A15, 4045HFG85_E). We HEAD-probe a bounded
// suffix space per model (letters A-H + optional number 0-30, priority-ordered, stop on
// first hit). This pass only adds model-specific sheets; it does not relabel or add a
// selection-guide fallback.
const APPLY = process.argv.includes('--apply')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://ntrysdovwnbegxtjsqkz.supabase.co',
  APPLY
    ? process.env.SUPABASE_SERVICE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)
const BUCKET = 'engine-pdfs'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const SPEC = 'https://www.deere.com/assets/pdfs/common/industries/engines-and-drivetrain/specsheets'
const TMP = path.join(os.tmpdir(), 'jd-gd'); fs.mkdirSync(TMP, { recursive: true })

if (APPLY && !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_SERVICE_KEY is required with --apply')
}
if (!APPLY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required for a dry run')
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
function suffixes() {
  const s = LETTERS.map(l => `_${l}`)                       // bare letters first
  for (let n = 1; n <= 30; n++) for (const l of LETTERS) s.push(`_${l}${n}`)
  return s
}
async function head(url) {
  try { const r = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(8000) }); return r.status === 200 }
  catch { return false }
}
async function findSpec(model) {
  const cands = suffixes().map(suf => `${SPEC}/${model}${suf}.pdf`)
  const CONC = 10
  for (let i = 0; i < cands.length; i += CONC) {
    const batch = cands.slice(i, i + CONC)
    const res = await Promise.all(batch.map(async u => ({ u, ok: await head(u) })))
    const hit = res.find(r => r.ok)
    if (hit) return hit.u
  }
  return null
}
async function getPdf(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(40000) })
  if (!r.ok) return null
  const b = Buffer.from(await r.arrayBuffer())
  return b.slice(0, 4).toString() === '%PDF' ? b : null
}

// John Deere engines without a datasheet, grouped by model (variants share a doc).
const PAGE = 1000; let pdfs = []; let from = 0
while (true) { const { data, error } = await supabase.from('engine_pdfs').select('engine_id, type').range(from, from + PAGE - 1); if (error) throw error; pdfs.push(...(data ?? [])); if (!data || data.length < PAGE) break; from += PAGE }
const withDatasheet = new Set(pdfs.filter(p => p.type === 'datasheet').map(p => p.engine_id))
const { data: jd } = await supabase.from('engines').select('id, model').eq('brand', 'John Deere')
const byModel = {}
for (const e of jd) { if (withDatasheet.has(e.id)) continue; (byModel[e.model] ??= []).push(e.id) }
const models = Object.keys(byModel)
console.log(`${APPLY ? 'APPLY' : 'DRY RUN'}: ${models.length} John Deere models missing datasheets (${Object.values(byModel).flat().length} rows)\n`)

async function link(ids, storagePath, type, label, bytes) {
  if (!APPLY) return ids.length
  let n = 0
  for (const id of ids) {
    await supabase.from('engine_pdfs').delete().eq('engine_id', id).eq('storage_path', storagePath)
    const { error } = await supabase.from('engine_pdfs').insert({ engine_id: id, type, label, storage_path: storagePath, file_size_bytes: bytes })
    if (!error) n++
  }
  return n
}

let spec = 0, missing = 0, links = 0
for (const model of models) {
  process.stdout.write(`${model} ... `)
  const url = await findSpec(model)
  if (url) {
    const buf = await getPdf(url)
    if (buf) {
      const storagePath = `john-deere/spec-sheets/${model.toLowerCase()}.pdf`
      let uploadOk = true
      if (APPLY) {
        const f = path.join(TMP, `${model}.pdf`); fs.writeFileSync(f, buf)
        const upload = await uploadPdf(supabase, BUCKET, f, storagePath)
        uploadOk = upload.ok
      }
      if (uploadOk) {
        const n = await link(byModel[model], storagePath, 'datasheet', `John Deere ${model} Spec Sheet`, buf.length)
        console.log(`official spec ${url.split('/').pop()} (${Math.round(buf.length / 1024)}KB) -> ${APPLY ? `${n} link(s)` : `${n} proposed link(s)`}`); spec++; links += n; continue
      }
    }
  }
  console.log('no official model-specific sheet found')
  missing++
}
console.log(`\n${APPLY ? '✓' : 'Dry run complete:'} ${spec} official spec sheets · ${links} engine links · ${missing} models still missing`)
