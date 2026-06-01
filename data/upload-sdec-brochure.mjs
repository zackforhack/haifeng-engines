import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// SDEC (Shanghai Diesel) genset brochure for up-to-1000 kWe applications (user-provided:
// https://repco.in/upload/Shanghai%20Diesel%20Engine.pdf). Linked as a brochure to every
// SDEC engine rated <= 1000 kWe. The 15 larger (>1000 kWe) units are not covered here.
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const BUCKET = 'engine-pdfs'
const STORE = 'sdec/brochures/shanghai-diesel-upto-1000kwe.pdf'
const FILE = '/tmp/sdec.pdf'   // pre-downloaded (repco.in needs insecure TLS / unsandboxed fetch)

const buf = fs.readFileSync(FILE)
if (buf.slice(0, 4).toString() !== '%PDF') { console.error('not a PDF'); process.exit(1) }
const { error: up } = await supabase.storage.from(BUCKET).upload(STORE, buf, { contentType: 'application/pdf', upsert: true })
if (up) { console.error('upload failed: ' + up.message); process.exit(1) }

const { data: engs } = await supabase.from('engines').select('id, model, standby_power_kwe_50hz, standby_power_kwe_60hz, prime_power_kwe_50hz, prime_power_kwe_60hz, standby_power_kw_50hz, standby_power_kw_60hz, power_kw').eq('brand', 'SDEC')
const maxKwe = (e) => {
  const v = [e.standby_power_kwe_50hz, e.standby_power_kwe_60hz, e.prime_power_kwe_50hz, e.prime_power_kwe_60hz, e.standby_power_kw_50hz, e.standby_power_kw_60hz, e.power_kw].filter(x => x != null && x > 0)
  return v.length ? Math.max(...v) : null
}

let linked = 0, skipped = 0
for (const e of engs) {
  const k = maxKwe(e)
  if (k == null || k > 1000) { skipped++; continue }
  await supabase.from('engine_pdfs').delete().eq('engine_id', e.id).eq('storage_path', STORE)
  const { error } = await supabase.from('engine_pdfs').insert({
    engine_id: e.id, type: 'brochure', label: 'SDEC Shanghai Diesel Genset Engines (up to 1000 kWe)', storage_path: STORE, file_size_bytes: buf.length,
  })
  if (!error) linked++
}
console.log(`SDEC brochure (${Math.round(buf.length / 1024)}KB) linked to ${linked} engines (<=1000 kWe); ${skipped} skipped (>1000 kWe or no rating)`)
