import { createClient } from '@supabase/supabase-js'
const s = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const PAGE=1000
async function all(){let out=[],f=0;while(true){const{data}=await s.from('engines').select('id, brand, emissions_standard').range(f,f+PAGE-1);out.push(...(data??[]));if(!data||data.length<PAGE)break;f+=PAGE}return out}
const rows = await all()
const blank = rows.filter(r => r.emissions_standard == null || String(r.emissions_standard).trim() === '')
console.log(`engines: ${rows.length}, missing emissions: ${blank.length}`)
const byBrand={}; for(const r of blank){byBrand[r.brand]=(byBrand[r.brand]||0)+1}
console.log('by brand:', Object.entries(byBrand).sort((a,b)=>b[1]-a[1]).map(([b,n])=>`${b}:${n}`).join(', '))

if (process.argv.includes('--apply')) {
  let n=0
  for (const r of blank) {
    const { error } = await s.from('engines').update({ emissions_standard: 'Unregulated' }).eq('id', r.id)
    if (!error) n++; else console.error(r.id, error.message)
  }
  console.log(`\n✓ tagged ${n}/${blank.length} as Unregulated`)
}
