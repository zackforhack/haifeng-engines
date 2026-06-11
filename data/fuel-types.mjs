import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
let all=[], from=0
while(true){ const {data}=await supabase.from('engines').select('fuel_type').range(from,from+999); all=all.concat(data); if(data.length<1000)break; from+=1000 }
const counts={}; for(const e of all){ const k=e.fuel_type??'(null)'; counts[k]=(counts[k]||0)+1 }
for(const [k,v] of Object.entries(counts).sort((a,b)=>b[1]-a[1])) console.log(`${String(v).padStart(5)}  ${k}`)
