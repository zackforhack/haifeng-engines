// Add two Mitsubishi (Shanghai MHI / SME) engines from exhibition spec placards:
//  - S16R-PTA3-C : V16 diesel. The 60 Hz placard. A 50 Hz row already exists (as
//    "S16R-PTA3-C（新）" with a wrong displacement) — clean it up and add 60 Hz data
//    so it becomes one correct dual-frequency model.
//  - GS16R2-PTK-C : V16 lean-burn gas engine, 50 Hz. New.
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)

// ── 1) S16R-PTA3-C : fix the existing 50 Hz row + add the 60 Hz placard data ──
const s16rUpdate = {
  model: 'S16R-PTA3-C',                    // strip the （新） suffix
  cylinders: 16,
  displacement_l: 65.4,                    // was wrongly 46.56
  compression_ratio: '14.0:1',
  cooling_method: 'Liquid-Cooled',
  ignition_type: 'Compression Ignition',
  fuel_consumption_l_per_hr: 470,
  weight_kg: 6900,
  length_mm: 3077, width_mm: 1435, height_mm: 1810,
  // 60 Hz / 1800 rpm (kWm without fan, genset kWe/kVA)
  prime_power_kw_60hz: 1944,
  prime_power_kwe_60hz: 1800,
  prime_power_kva_60hz: 2250,
  standby_power_kw_60hz: 2155,
  standby_power_kwe_60hz: 2000,
  standby_power_kva_60hz: 2500,
}
const { data: u, error: uErr } = await supabase
  .from('engines').update(s16rUpdate).eq('slug', 'mitsubishi-s16r-pta3-c').select('id, model').single()
if (uErr) { console.error('✗ S16R update:', uErr.message); process.exit(1) }
console.log(`✓ updated ${u.model} (${u.id}) — added 60 Hz, fixed name & displacement`)

// ── 2) GS16R2-PTK-C : new V16 lean-burn gas engine (50 Hz) ──
const gs16r2 = {
  slug: 'mitsubishi-gs16r2-ptk-c',
  brand: 'Mitsubishi',
  model: 'GS16R2-PTK-C',
  status: 'active',
  origin: 'Japan',
  fuel_type: 'Natural Gas',
  ignition_type: 'Spark Ignition',
  cooling_method: 'Liquid-Cooled',
  configuration: 'V16',
  cylinders: 16,
  displacement_l: 79.9,
  compression_ratio: '12.0:1',
  rpm_rated: 1500,
  weight_kg: 8105,
  length_mm: 3118, width_mm: 1479, height_mm: 2030,
  emissions_standard: 'Unregulated',
  // 50 Hz / 1500 rpm prime (lean-burn, no standby published)
  prime_power_kw_50hz: 1562.5,
  prime_power_kwe_50hz: 1500,
  prime_power_kva_50hz: 1875,
}
const { data: ins, error: iErr } = await supabase
  .from('engines').upsert(gs16r2, { onConflict: 'slug' }).select('id, model').single()
if (iErr) { console.error('✗ GS16R2 insert:', iErr.message); process.exit(1) }
console.log(`✓ inserted ${ins.model} (${ins.id})`)

console.log('\nDone.')
