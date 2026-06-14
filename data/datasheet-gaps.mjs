import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
let engines=[], from=0
while(true){ const {data}=await supabase.from('engines').select('id, brand, model, slug').range(from,from+999); engines=engines.concat(data); if(data.length<1000)break; from+=1000 }
let pdfs=[], f2=0
while(true){ const {data}=await supabase.from('engine_pdfs').select('engine_id, type').range(f2,f2+999); pdfs=pdfs.concat(data); if(data.length<1000)break; f2+=1000 }
const dsEngines = new Set(pdfs.filter(p=>p.type==='datasheet').map(p=>p.engine_id))
const WESTERN = ['Caterpillar','Cummins','Perkins','MTU','Kubota','Deutz','FPT','Liebherr','PSI','Mitsubishi','Hino','Hatz','John Deere','Volvo Penta','Scania','Yanmar','Isuzu','Doosan','Hyundai','Kohler','JCB','Kirloskar']
for (const b of WESTERN) {
  const miss = engines.filter(e=>e.brand===b && !dsEngines.has(e.id))
  if (miss.length) console.log(`\n### ${b} — ${miss.length} models lack a datasheet:\n  ${miss.map(e=>e.model).join(', ')}`)
}
