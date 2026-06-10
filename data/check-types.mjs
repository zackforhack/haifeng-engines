import { createClient } from '@supabase/supabase-js'
const sb = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const { data, error } = await sb.from('engine_pdfs').select('type').limit(20)
console.log('Existing types:', [...new Set(data?.map(r=>r.type))])
if (error) console.log('error:', error.message)
