import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const { data } = await supabase.from('engines').select('id, model, slug, displacement_l, configuration, fuel_type, compression_ratio, weight_kg, created_at').eq('brand', 'PSI').order('model')
for (const e of data) console.log(`${e.id}\t${(e.model||'').padEnd(12)}\t${e.fuel_type}\t${e.configuration}\t${e.displacement_l}\tcr=${e.compression_ratio??'-'}\twt=${e.weight_kg??'-'}\t${e.slug}`)
