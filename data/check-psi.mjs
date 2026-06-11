import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const { data, error } = await supabase.from('engines').select('*').eq('brand', 'PSI').order('displacement_l')
if (error) { console.error('ERR:', error.message); process.exit(1) }
console.log(`PSI in DB: ${data.length} models`)
console.log('columns:', Object.keys(data[0]||{}).join(', '))
for (const e of data) console.log(`  ${(e.model||'').padEnd(24)} ${String(e.displacement_l).padEnd(5)}L ${(e.configuration||'?').padEnd(4)} ${(e.fuel_type||'').padEnd(14)} kwe50=${e.prime_power_kwe_50hz??'-'} kw=${e.power_kw??'-'}`)
