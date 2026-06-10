// Backfill displacement for the 50 Baudouin gas (M-series) rows that lacked it.
// Per-cylinder displacement from Baudouin's own published bore × stroke (authoritative):
//   6M12 108×136 = 7.47 L  (→ 4M12 4.98)        6M31 149×177 = 18.5 L
//   12M55/16M55 180×215 = 5.47 L/cyl (65.65 / 87.5)
// For the three small families with no public datasheet (4M07, 4M08, 6M13), displacement is
// DERIVED from the Baudouin model-number ÷ 10 = L/cylinder convention, which is validated to
// ~1–4% across six confirmed families (M12 1.245, M16 1.62, M21 2.09, M31 3.083, M33 3.27,
// M55 5.47). Idempotent: only fills rows where displacement_l IS NULL.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)

// [cylinders, family-token, displacement_l, source]
const FILLS = [
  [12, 'M55', 65.65, 'datasheet 180×215'], [16, 'M55', 87.5, 'datasheet 180×215'],
  [4, 'M12', 4.98, 'datasheet 108×136'],   [6, 'M12', 7.47, 'datasheet 108×136'],
  [6, 'M31', 18.5, 'datasheet 149×177'],
  [4, 'M07', 2.8, 'derived M/10'], [4, 'M08', 3.2, 'derived M/10'], [6, 'M13', 7.8, 'derived M/10'],
]

let n = 0
for (const [cyl, fam, displ, src] of FILLS) {
  const { data, error } = await supabase.from('engines').update({ displacement_l: displ })
    .eq('brand', 'Baudouin').is('displacement_l', null).eq('cylinders', cyl).ilike('model', `%${fam}%`).select('id')
  if (error) { console.error(`✗ ${cyl}${fam}: ${error.message}`); continue }
  if (data?.length) { n += data.length; console.log(`✓ ${cyl}${fam} -> ${displ} L (${data.length}) [${src}]`) }
}
console.log(`✓ filled displacement on ${n} Baudouin rows`)
