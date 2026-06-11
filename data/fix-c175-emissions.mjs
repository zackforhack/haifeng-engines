// ESE ("EPA Stationary Emergency") = "U.S. EPA Stationary". C175-20 carries ESE only in the catalog,
// so correct it from the Tier 4 Final value I'd set. C175-16 stays Tier 4 Final (catalog states
// "EPA Tier 4 Final, ESE" explicitly).
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const { data, error } = await supabase.from('engines')
  .update({ emissions_standard: 'U.S. EPA Stationary' })
  .eq('brand','Caterpillar').eq('model','C175-20').select('model, emissions_standard')
if (error) { console.error('✗', error.message); process.exit(1) }
console.log('updated:', data)
// also refresh description's emissions wording for C175-20
const { data: row } = await supabase.from('engines').select('id, description').eq('brand','Caterpillar').eq('model','C175-20').single()
const fixed = row.description.replace('EPA Tier 4 Final / EPA Stationary Emergency', 'EPA Stationary Emergency (ESE)')
if (fixed !== row.description) { await supabase.from('engines').update({ description: fixed }).eq('id', row.id); console.log('· description updated') }
