// Fill the 14 missing PSI cylinder/configuration values. PSI's "NN L-D" power-systems diesels
// come from two bore families, confirmed by bore×stroke on psiengines.com:
//   150 × 185 mm = 3.27 L/cyl  -> 20L-D(6) 26L-D(8) 40L-D(12) 53L-D(16) 65L-D(20)
//   180 × 215 mm = 5.47 L/cyl  -> 66L-D(12) 88L-D(16)
// 6-cyl = inline-6; 8+ cyl = V (no inline-8+ industrial diesels at this size).
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)

// Keyed on displacement_l (exact, and the model field carries a "PSI " prefix); 65.4 vs 65.65
// distinguishes the V20 small-bore from the V12 large-bore that share ~65 L.
// [displacement_l, cylinders, configuration]
const SPECS = [
  [19.6, 6, 'L6'], [26.1, 8, 'V8'], [39.2, 12, 'V12'], [52.3, 16, 'V16'],
  [65.4, 20, 'V20'], [65.65, 12, 'V12'], [87.5, 16, 'V16'],
]

let n = 0
for (const [displ, cyl, config] of SPECS) {
  const { data, error } = await supabase.from('engines')
    .update({ cylinders: cyl, configuration: config })
    .eq('brand', 'PSI').eq('displacement_l', displ).is('cylinders', null).select('id')
  if (error) { console.error(`✗ ${displ}L: ${error.message}`); continue }
  if (data?.length) { n += data.length; console.log(`✓ PSI ${displ}L`.padEnd(12) + ` -> ${cyl} cyl ${config} (${data.length} rows)`) }
}
console.log(`\n✓ set cylinders/configuration on ${n} PSI rows`)
