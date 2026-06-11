import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const { data } = await supabase.from('engines').select('model, displacement_l, configuration, fuel_type, ignition_type, power_kw, prime_power_kwe_50hz, emissions_standard, slug').eq('brand','Caterpillar').order('model')
const gas = data.filter(e=>e.ignition_type==='Spark Ignition' || /gas|G3|CG/i.test(e.fuel_type||'') || /^G3|^CG/.test(e.model))
console.log(`Caterpillar total ${data.length}; gas-ish ${gas.length}:`)
for(const e of gas) console.log(`  ${(e.model||'').padEnd(12)} ${(e.fuel_type||'').padEnd(13)} ${(e.configuration||'').padEnd(4)} ${String(e.displacement_l||'').padEnd(5)}L kwe50=${e.prime_power_kwe_50hz??'-'} kw=${e.power_kw??'-'} [${e.emissions_standard||'-'}]`)
