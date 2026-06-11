import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
let all=[], from=0
while(true){ const {data}=await supabase.from('engines').select('configuration, brand').range(from,from+999); all=all.concat(data); if(data.length<1000)break; from+=1000 }
// verbose = not matching clean ^[LVW]\d+$
const verbose = all.filter(e=> e.configuration && !/^[LVW]\d+$/i.test(e.configuration))
const counts={}; for(const e of verbose){ counts[e.configuration]=(counts[e.configuration]||0)+1 }
console.log(`verbose configuration values: ${verbose.length} rows, ${Object.keys(counts).length} distinct`)
for(const [k,v] of Object.entries(counts).sort((a,b)=>b[1]-a[1])) console.log(`  ${String(v).padStart(4)}  "${k}"`)
