import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const { data } = await supabase.from('engines').select('model, configuration, cylinders').eq('brand','Caterpillar').order('configuration')
const m={}; for(const e of data){ const k=e.configuration??'(null)'; (m[k]??=[]).push(`${e.model}(${e.cylinders})`) }
for(const [k,v] of Object.entries(m)) console.log(`"${k}"  ->  ${v.join(', ')}`)
