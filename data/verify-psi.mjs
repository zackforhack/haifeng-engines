import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const slugs = ['psi-gas-22l','psi-gas-53l','psi-gas-14l','psi-psi-88l-d-3300kwe']
const { data } = await supabase.from('engines').select('*').in('slug', slugs)
for (const e of data) {
  console.log(`\n=== ${e.model} (${e.slug}) ===`)
  console.log(`displ=${e.displacement_l}L cr=${e.compression_ratio} wt=${e.weight_kg}kg`)
  console.log(`STBY 50: ${e.standby_power_kwe_50hz}kWe/${e.standby_power_kw_50hz}kWm  60: ${e.standby_power_kwe_60hz}/${e.standby_power_kw_60hz}`)
  console.log(`PRIME 50: ${e.prime_power_kwe_50hz}kWe/${e.prime_power_kw_50hz}kWm  60: ${e.prime_power_kwe_60hz}/${e.prime_power_kw_60hz}`)
  console.log(`desc: ${e.description}`)
}
// coverage stats
const { data: all } = await supabase.from('engines').select('compression_ratio, weight_kg').eq('brand','PSI')
const cr = all.filter(e=>e.compression_ratio!=null).length, wt = all.filter(e=>e.weight_kg!=null).length
console.log(`\nPSI coverage: compression ${cr}/${all.length}, weight ${wt}/${all.length}`)
