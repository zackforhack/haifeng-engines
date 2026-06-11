import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
let all=[], from=0
while(true){ const {data}=await supabase.from('engines').select('brand, model, configuration, cylinders').range(from,from+999); all=all.concat(data); if(data.length<1000)break; from+=1000 }
// aspiration-only: verbose AND no layout token (In-line / V## / W## / Single-cylinder)
const noLayout = all.filter(e=> e.configuration && !/^[LVW]\d+$/i.test(e.configuration)
  && !/^(in-?line|v\s*\d|w\s*\d|single)/i.test(e.configuration))
console.log(`aspiration-only configs: ${noLayout.length} rows`)
const byCyl={}; for(const e of noLayout){ (byCyl[e.cylinders] ??= new Set()).add(e.brand) }
for(const [c,bs] of Object.entries(byCyl).sort((a,b)=>+a[0]-+b[0])) console.log(`  ${c} cyl: ${noLayout.filter(e=>String(e.cylinders)===c).length} rows  (brands: ${[...bs].join(', ')})`)
// flag any with cylinders 7,8 that might be inline-not-V risk
console.log('\n8-cyl aspiration-only (V vs inline check):', noLayout.filter(e=>e.cylinders===8).map(e=>`${e.brand} ${e.model}`).join(', ') || 'none')
