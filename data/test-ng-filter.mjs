const matchesFuelType = (ft, sel) => sel === 'Natural Gas' ? /^natural gas/i.test(ft??'') : (ft??'')===sel
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
let all=[], from=0
while(true){ const {data}=await supabase.from('engines').select('fuel_type').range(from,from+999); all=all.concat(data); if(data.length<1000)break; from+=1000 }
const ng = all.filter(e=>matchesFuelType(e.fuel_type,'Natural Gas'))
const counts={}; for(const e of ng){ counts[e.fuel_type]=(counts[e.fuel_type]||0)+1 }
console.log(`"Natural Gas" filter now matches ${ng.length} engines:`, counts)
console.log('Coal Gas excluded from NG?', !matchesFuelType('Coal Gas','Natural Gas'))
// dropdown collapse
const uniq=a=>[...new Set(a.filter(Boolean))].sort()
const collapsed=[...new Set(uniq(all.map(e=>e.fuel_type)).map(f=>/^natural gas/i.test(f)?'Natural Gas':f))]
console.log('dropdown fuelTypes:', collapsed)
