// Add three Caterpillar engines new to the DB, identified from the CAT genset
// catalogue (Eneria/Monnoyeur) and cross-checked against the Cat Electric Power
// Ratings Guide (LEXE7582) + Cat C9.3 published specs. C9 (8.8 L) already exists;
// C9.3 (9.3 L) is the distinct newer engine. Top genset ratings, both frequencies.
// 50 Hz figures are kVA (kWe = ×0.8); 60 Hz figures are ekW (kVA = ÷0.8).
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://ntrysdovwnbegxtjsqkz.supabase.co', process.env.SUPABASE_SERVICE_KEY)

const common = {
  brand: 'Caterpillar',
  status: 'active',
  origin: 'USA',
  fuel_type: 'Diesel',
  ignition_type: 'Compression Ignition',
  cooling_method: 'Liquid-Cooled',
  rpm_rated: 1500,
}

const engines = [
  {
    ...common,
    slug: 'caterpillar-c2-2',
    model: 'C2.2',
    displacement_l: 2.2,
    cylinders: 4,
    configuration: 'In-line 4, Turbocharged',
    emissions_standard: 'Euro Stage IIIA',
    // 50 Hz (kVA) — DE22E3 top
    prime_power_kwe_50hz: 16, prime_power_kva_50hz: 20,
    standby_power_kwe_50hz: 17.6, standby_power_kva_50hz: 22,
    // 60 Hz (ekW) — DE22E3 top
    prime_power_kwe_60hz: 18, prime_power_kva_60hz: 22.5,
    standby_power_kwe_60hz: 20, standby_power_kva_60hz: 25,
  },
  {
    ...common,
    slug: 'caterpillar-c3-3',
    model: 'C3.3',
    displacement_l: 3.3,
    cylinders: 4,
    configuration: 'In-line 4, Turbocharged',
    emissions_standard: 'Unregulated',
    // 50 Hz (kVA) — DE65E0 top
    prime_power_kwe_50hz: 48, prime_power_kva_50hz: 60,
    standby_power_kwe_50hz: 52, standby_power_kva_50hz: 65,
    // 60 Hz (ekW) — DE65E0 top
    prime_power_kwe_60hz: 55, prime_power_kva_60hz: 68.8,
    standby_power_kwe_60hz: 60, standby_power_kva_60hz: 75,
  },
  {
    ...common,
    slug: 'caterpillar-c9-3',
    model: 'C9.3',
    displacement_l: 9.3,
    cylinders: 6,
    configuration: 'In-line 6, Turbocharged Aftercooled',
    emissions_standard: 'U.S. EPA Tier 3',
    // 50 Hz — C9.3 EP top
    prime_power_kwe_50hz: 250, prime_power_kva_50hz: 313,
    standby_power_kwe_50hz: 275, standby_power_kva_50hz: 344,
    // 60 Hz — C9.3 EP top
    prime_power_kwe_60hz: 300, prime_power_kva_60hz: 375,
    standby_power_kwe_60hz: 330, standby_power_kva_60hz: 413,
  },
]

const { data, error } = await supabase.from('engines').upsert(engines, { onConflict: 'slug' }).select('id, model')
if (error) { console.error('✗', error.message); process.exit(1) }
for (const r of data) console.log(`✓ ${r.model} (${r.id})`)
console.log(`\nDone — ${data.length} Caterpillar engines.`)
