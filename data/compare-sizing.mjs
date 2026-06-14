import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
let all=[], from=0
while(true){ const {data}=await supabase.from('engines').select('slug,brand,fuel_type,status,standby_power_kwe_50hz,prime_power_kwe_50hz,standby_power_kwe_60hz,prime_power_kwe_60hz').range(from,from+999); all=all.concat(data); if(data.length<1000)break; from+=1000 }
const kwe = e => e.standby_power_kwe_50hz ?? e.prime_power_kwe_50hz ?? e.standby_power_kwe_60hz ?? e.prime_power_kwe_60hz ?? null
const GAS=/natural gas|biogas|biomethane|coal gas|cng|lng|lpg|propane/i
const cat = e => /diesel/i.test(e.fuel_type||'') ? 'diesel' : GAS.test(e.fuel_type||'') ? 'gas' : 'other'
const pool = all.filter(e => e.status==='active' && kwe(e)!=null && cat(e)!=='other')
console.log(`active+powered engines: ${pool.length} of ${all.length}`)
for (const N of [2,3]) {
  const pairs = new Set()
  for (const e of pool) {
    const k = kwe(e)
    const comp = pool.filter(o => o.slug!==e.slug && o.brand!==e.brand && cat(o)===cat(e) && kwe(o)>=k*0.7 && kwe(o)<=k*1.4)
      .sort((a,b)=> Math.abs(Math.log(kwe(a)/k)) - Math.abs(Math.log(kwe(b)/k))).slice(0,N)
    for (const o of comp){ const [a,b]=[e.slug,o.slug].sort(); pairs.add(`${a}-vs-${b}`) }
  }
  console.log(`top-${N} competitors -> ${pairs.size} unique canonical pairs`)
}
