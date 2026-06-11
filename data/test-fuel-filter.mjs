// Sanity-check the matchesFuel regex + fuel counts against the live data.
const GAS_FUEL = /natural gas|biogas|biomethane|coal gas|cng|lng|lpg|propane/i
const matchesFuel = (ft, fuel) => fuel === 'gas' ? GAS_FUEL.test(ft??'') : /diesel/i.test(ft??'')
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
let all=[], from=0
while(true){ const {data}=await supabase.from('engines').select('fuel_type').range(from,from+999); all=all.concat(data); if(data.length<1000)break; from+=1000 }
const gas = all.filter(e=>matchesFuel(e.fuel_type,'gas')).length
const diesel = all.filter(e=>matchesFuel(e.fuel_type,'diesel')).length
const neither = all.filter(e=>!matchesFuel(e.fuel_type,'gas')&&!matchesFuel(e.fuel_type,'diesel'))
console.log(`Total ${all.length}: gas bucket=${gas}, diesel bucket=${diesel}, neither=${neither.length}`)
const nc={}; for(const e of neither){ const k=e.fuel_type??'(null)'; nc[k]=(nc[k]||0)+1 }
console.log('neither (granular-only):', nc)
// confirm coal gas now in gas bucket
console.log('Coal Gas -> gas?', matchesFuel('Coal Gas','gas'), '| Methanol -> gas?', matchesFuel('Methanol','gas'))
