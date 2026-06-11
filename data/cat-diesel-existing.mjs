import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const { data } = await supabase.from('engines').select('model, series, displacement_l, configuration, fuel_type, ignition_type, prime_power_kwe_50hz, prime_power_kwe_60hz, standby_power_kwe_50hz, emissions_standard').eq('brand','Caterpillar').order('model')
const d = data.filter(e=>e.ignition_type!=='Spark Ignition' && /diesel/i.test(e.fuel_type||''))
console.log(`Caterpillar diesel: ${d.length}`)
for(const e of d) console.log(`  ${(e.model||'').padEnd(12)} ${(e.series||'').padEnd(6)} ${(e.configuration||'').padEnd(4)} ${String(e.displacement_l||'').padEnd(6)}L p50=${e.prime_power_kwe_50hz??'-'} p60=${e.prime_power_kwe_60hz??'-'} s50=${e.standby_power_kwe_50hz??'-'} [${e.emissions_standard||'-'}]`)
