import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
// all engines
let engines=[], from=0
while(true){ const {data}=await supabase.from('engines').select('id, brand, model').range(from,from+999); engines=engines.concat(data); if(data.length<1000)break; from+=1000 }
// all engine_pdfs
let pdfs=[], f2=0
while(true){ const {data}=await supabase.from('engine_pdfs').select('engine_id, type').range(f2,f2+999); pdfs=pdfs.concat(data); if(data.length<1000)break; f2+=1000 }
const byEngine={}; for(const p of pdfs){ (byEngine[p.engine_id]??=[]).push(p.type) }
const has = e => (byEngine[e.id]||[])
const hasDatasheet = e => has(e).includes('datasheet')
const hasAny = e => has(e).length>0
const n=engines.length
const withAny = engines.filter(hasAny).length
const withDs = engines.filter(hasDatasheet).length
console.log(`TOTAL engines: ${n}`)
console.log(`  with ANY pdf (datasheet/brochure/manual): ${withAny} (${(withAny/n*100).toFixed(1)}%)`)
console.log(`  with a DATASHEET specifically:           ${withDs} (${(withDs/n*100).toFixed(1)}%)`)
console.log(`  with NO pdf at all:                      ${n-withAny}`)
// pdf type distribution
const tc={}; for(const p of pdfs){ tc[p.type]=(tc[p.type]||0)+1 }
console.log(`\nengine_pdfs rows by type:`, tc, `(total ${pdfs.length})`)
// per-brand: engines without ANY pdf
console.log(`\n=== brands with engines missing ANY pdf (count missing / total) ===`)
const brands={}; for(const e of engines){ (brands[e.brand]??={t:0,miss:0}); brands[e.brand].t++; if(!hasAny(e)) brands[e.brand].miss++ }
for(const [b,s] of Object.entries(brands).sort((a,b)=>b[1].miss-a[1].miss)){ if(s.miss>0) console.log(`  ${String(s.miss).padStart(4)}/${String(s.t).padStart(4)}  ${b}`) }
