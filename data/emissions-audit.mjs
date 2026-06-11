import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
let all=[], from=0
while(true){ const {data}=await supabase.from('engines').select('emissions_standard, brand').range(from,from+999); all=all.concat(data); if(data.length<1000)break; from+=1000 }
const counts={}; for(const e of all){ const k=e.emissions_standard??'(null)'; counts[k]=(counts[k]||0)+1 }
console.log(`distinct emissions values: ${Object.keys(counts).length}\n`)
for(const [k,v] of Object.entries(counts).sort((a,b)=>b[1]-a[1])) console.log(`${String(v).padStart(5)}  ${k}`)
// show EPA-related groupings + which brands use them
console.log('\n=== EPA-mentioning values + brands ===')
const epa = Object.keys(counts).filter(k=>/epa/i.test(k))
for(const k of epa.sort()){
  const brands=[...new Set(all.filter(e=>e.emissions_standard===k).map(e=>e.brand))]
  console.log(`  "${k}" (${counts[k]}) — ${brands.join(', ')}`)
}
