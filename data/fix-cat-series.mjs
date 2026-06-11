import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
for (const [from, to] of [['G3400','3400'], ['G3500','3500']]) {
  const { data } = await supabase.from('engines').update({ series: to }).eq('brand','Caterpillar').eq('series', from).select('model')
  console.log(`${from} -> ${to}:`, data.map(e=>e.model).join(', '))
}
