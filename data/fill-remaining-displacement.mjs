// Backfill the last displacement gaps where a defensible value exists.
//   Yuchai YC4G/YC6G: 112 × 132 mm (1.3 L/cyl) — authoritative from Yuchai spec pages.
//   PUSH600MT: MWM TCG2016 V12, 132 × 160 mm = 26.3 L (same platform as the other PUSH M-series).
//   Liyu LY1200/1600/2000: 170 mm bore confirmed; stroke inferred 210 mm (4.77 L/cyl) — the power
//     ratings (1200/1600/2000 kWe at V12/V16/V20) match the 170×210 MTU-4000-class platform. [derived]
// Idempotent: only fills rows where displacement_l IS NULL.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)

async function setByModel(brand, model, displ) {
  const { data, error } = await supabase.from('engines').update({ displacement_l: displ })
    .eq('brand', brand).eq('model', model).is('displacement_l', null).select('id')
  if (error) { console.error(`✗ ${brand} ${model}: ${error.message}`); return }
  console.log(`✓ ${brand} ${model} -> ${displ} L (${data?.length ?? 0})`)
}
async function setByCyl(brand, cyl, displ, note) {
  const { data, error } = await supabase.from('engines').update({ displacement_l: displ })
    .eq('brand', brand).eq('cylinders', cyl).is('displacement_l', null).select('id')
  if (error) { console.error(`✗ ${brand} ${cyl}cyl: ${error.message}`); return }
  console.log(`✓ ${brand} ${cyl}cyl -> ${displ} L (${data?.length ?? 0}) [${note}]`)
}

await setByModel('Yuchai', 'YC4G135N-D30', 5.2)   // 112×132 ×4
await setByModel('Yuchai', 'YC6G205N-D30', 7.8)   // 112×132 ×6
await setByModel('PUSH', 'PUSH600MT', 26.3)        // TCG2016 V12 132×160
await setByCyl('Liyu Power', 12, 57.2, 'derived 170×210')
await setByCyl('Liyu Power', 16, 76.3, 'derived 170×210')
await setByCyl('Liyu Power', 20, 95.3, 'derived 170×210')
