// Replicate filterEngines({}) pagination + getAllAlternators to see if the build undercounts.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
async function pageAll(table, sel='*') {
  const PAGE=1000; let all=[], from=0
  while(true){
    const { data, error } = await supabase.from(table).select(sel).order('brand').order('model').range(from, from+PAGE-1)
    if(error){ console.log(`  ${table} page from=${from} ERROR: ${error.message}`); break }
    all.push(...(data??[])); 
    console.log(`  ${table} page from=${from}: got ${data?.length??0}`)
    if(!data || data.length<PAGE) break
    from+=PAGE
  }
  return all
}
console.log('engines:'); const e = await pageAll('engines','*, pdfs:engine_pdfs(*)'); console.log('TOTAL engines:', e.length)
console.log('alternators:'); const a = await pageAll('alternators'); console.log('TOTAL alternators:', a.length)
