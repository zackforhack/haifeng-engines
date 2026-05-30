import { createClient } from '@supabase/supabase-js'
import { uploadPdf } from './pdf-upload-utils.mjs'
import fs from 'fs'
import path from 'path'
import os from 'os'

const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const SRC = 'https://www.baifapower.com/static/upload/download/FADONGJI'
const TMP = path.join(os.tmpdir(), 'cummins-specs'); fs.mkdirSync(TMP, { recursive: true })

const MODELS = ['KTA19-G8','M15-G3','M15-G4','M15-G5','M15-G6','M15-G7','QSB3.9-G2','QSB3.9-G3','QSB3.9-G31','QSB3.9-G33','QSB3.9-G35','QSB3.9-G37','QSB3.9-G39','QSB5.9-G2','QSB5.9-G3','QSB5.9-G30','QSB5.9-G31','QSB5.9-G33','QSB6.7-G3','QSB6.7-G31','QSB6.7-G32','QSB6.7-G4','QSB7-G5','QSK19-G31','QSK19-G32','QSK19-G33','QSK19-G34','QSK19-G35','QSL8.9-G2','QSL8.9-G3','QSL8.9-G30','QSL8.9-G33','QSL8.9-G34','QSL8.9-G4','QSL9-G3','QSL9-G5','QSL9-G7']

const { data: engines } = await supabase.from('engines').select('id, model, slug').eq('brand','Cummins').in('model', MODELS)
const modelToEngine = Object.fromEntries(engines.map(e => [e.model, e]))

let ok = 0, missing = 0, failed = 0
for (const model of MODELS) {
  process.stdout.write(`${model} ... `)
  const eng = modelToEngine[model]
  if (!eng) { console.log('not in DB'); failed++; continue }
  const localPath = path.join(TMP, `${model}.pdf`)
  // download from baifapower (follow redirects)
  try {
    const res = await fetch(`${SRC}/${encodeURIComponent(model)}.pdf`, { headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow', signal: AbortSignal.timeout(30000) })
    const ct = res.headers.get('content-type') || ''
    const buf = Buffer.from(await res.arrayBuffer())
    if (!res.ok || !ct.includes('pdf') || buf.slice(0,4).toString() !== '%PDF') { console.log('no spec sheet'); missing++; continue }
    fs.writeFileSync(localPath, buf)
    const storagePath = `cummins/spec-sheets/${model.toLowerCase().replace(/[^a-z0-9.]+/g,'-')}.pdf`
    const { ok: up } = await uploadPdf(supabase, BUCKET, localPath, storagePath)
    if (!up) { console.log('upload failed'); failed++; continue }
    await supabase.from('engine_pdfs').delete().eq('engine_id', eng.id).eq('storage_path', storagePath)
    const { error } = await supabase.from('engine_pdfs').insert({
      engine_id: eng.id, type: 'datasheet', label: `Cummins ${model} Spec Sheet`, storage_path: storagePath, file_size_bytes: buf.length,
    })
    if (error) { console.log('link failed: '+error.message); failed++; continue }
    console.log(`${Math.round(buf.length/1024)}KB ✓`)
    ok++
  } catch (e) { console.log('error: '+e.message); failed++ }
}
console.log(`\n✓ ${ok} linked · ${missing} no source · ${failed} failed`)
