import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
// G3520C / G3516+ are US-built G3500-series engines, not German CG-series.
const { data, error } = await supabase.from('engines').update({ origin: 'United States' })
  .eq('brand','Caterpillar').eq('series','G3500').eq('origin','Germany').select('model')
if (error) { console.error(error.message); process.exit(1) }
console.log('fixed origin -> United States:', data.map(e=>e.model).join(', '))
// verify CG series stays Germany, full gas summary
const { data: gas } = await supabase.from('engines').select('model, series, fuel_type, configuration, displacement_l, prime_power_kwe_50hz, origin, emissions_standard')
  .eq('brand','Caterpillar').eq('ignition_type','Spark Ignition').order('series').order('model')
console.log(`\nCaterpillar gas total: ${gas.length}`)
for (const e of gas) console.log(`  ${(e.model||'').padEnd(11)} ${(e.series||'').padEnd(6)} ${(e.fuel_type||'').padEnd(12)} ${(e.configuration||'').padEnd(4)} ${String(e.displacement_l).padEnd(6)}L ${String(e.prime_power_kwe_50hz??'-').padStart(4)}kWe ${(e.origin||'').padEnd(14)} [${e.emissions_standard}]`)
