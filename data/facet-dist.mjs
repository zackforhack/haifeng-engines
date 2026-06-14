import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
let all=[], from=0
while(true){ const {data}=await supabase.from('engines').select('configuration, rpm_rated, emissions_standard').range(from,from+999); all=all.concat(data); if(data.length<1000)break; from+=1000 }
const tally=(k)=>{ const m={}; for(const e of all){ const v=e[k]; if(v!=null&&v!=='') m[v]=(m[v]||0)+1 } return Object.entries(m).sort((a,b)=>b[1]-a[1]) }
console.log('=== configuration (count) ===')
for(const [k,v] of tally('configuration')) if(v>=5) console.log(`  ${String(v).padStart(4)}  ${k}`)
console.log('=== rpm_rated (count) ===')
for(const [k,v] of tally('rpm_rated')) console.log(`  ${String(v).padStart(4)}  ${k}`)
// emissions: component-split counts (how the filter matches)
console.log('=== emissions components (filter-match count) ===')
const comp={}; for(const e of all){ const s=e.emissions_standard; if(!s)continue; for(const p of s.split(' / ')) comp[p]=(comp[p]||0)+1 }
for(const [k,v] of Object.entries(comp).sort((a,b)=>b[1]-a[1])) if(v>=15) console.log(`  ${String(v).padStart(4)}  ${k}`)
