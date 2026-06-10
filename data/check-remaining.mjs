import { createClient } from '@supabase/supabase-js'
const sb = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)
const all = []
let from = 0
while (true) {
  const { data } = await sb.from('engines').select('brand,model,slug,cylinders,configuration,origin,rpm_rated,emissions_standard').range(from, from + 999)
  all.push(...data); if (data.length < 1000) break; from += 1000
}

// Scania with non-standard config
const scaniaBad = all.filter(e => e.brand === 'Scania' && e.configuration && !e.configuration.match(/^[LV]\d+$/))
console.log('=== Scania non-standard configs ===')
for (const e of scaniaBad) console.log(`  ${e.model}: "${e.configuration}" (cylinders=${e.cylinders})`)

// Cummins origin NULLs - what models are they?
const cumminsNull = all.filter(e => e.brand === 'Cummins' && e.origin == null)
console.log(`\n=== Cummins origin NULL (${cumminsNull.length}) ===`)
for (const e of cumminsNull.slice(0, 10)) console.log(`  ${e.model}`)
if (cumminsNull.length > 10) console.log(`  ... and ${cumminsNull.length - 10} more`)

// Yanmar rpm_rated still NULL
const yanmarNull = all.filter(e => e.brand === 'Yanmar' && e.rpm_rated == null)
console.log(`\n=== Yanmar rpm_rated still NULL (${yanmarNull.length}) ===`)
for (const e of yanmarNull) console.log(`  ${e.model} (${e.slug})`)
