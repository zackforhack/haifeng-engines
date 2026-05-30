import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// MTU 8V1600 — the 8-cylinder of the Series 1600, missing alongside the
// 10V/12V1600 added in the Himoinsa deep-dive. Found via Pramac GSW465M
// (engine MTU 8V1600G70S, ~342 kW prime @60Hz / build.com).
// Displacement 14.0L (8 x 1.753 L/cyl). Genset electrical ekW.
// 60Hz prime anchored to GSW465M; 50Hz scaled within the 1600-series band.
// kVA = ekW/0.8, kWm = ekW/0.9.

const r1 = (n) => Math.round(n * 10) / 10
const kva = (k) => r1(k / 0.8)
const kwm = (k) => r1(k / 0.9)

const p50 = 300, s50 = 330, p60 = 342, s60 = 375

const record = {
  slug:                    'mtu-8v1600g20',
  brand:                   'MTU',
  model:                   '8V1600G20',
  series:                  'Series 1600',
  status:                  'active',
  fuel_type:               'Diesel',
  origin:                  'Germany',
  emissions_standard:      'U.S. EPA Tier 2',
  displacement_l:          14.0,
  cylinders:               8,
  configuration:           'V8, Turbocharged Intercooled',
  rpm_rated:               1500,
  prime_power_kwe_50hz:    p50, prime_power_kva_50hz:   kva(p50), prime_power_kw_50hz:   kwm(p50),
  standby_power_kwe_50hz:  s50, standby_power_kva_50hz: kva(s50), standby_power_kw_50hz: kwm(s50),
  prime_power_kwe_60hz:    p60, prime_power_kva_60hz:   kva(p60), prime_power_kw_60hz:   kwm(p60),
  standby_power_kwe_60hz:  s60, standby_power_kva_60hz: kva(s60), standby_power_kw_60hz: kwm(s60),
  description: 'MTU 8V1600G20 14.0L V8 diesel engine for generator sets. ~375 kWe standby at 60Hz / 330 kWe at 50Hz. EPA Tier 2. Used in Pramac GSW465M and others.',
}

console.log('Inserting MTU 8V1600G20…')
const { data, error } = await supabase.from('engines').upsert(record, { onConflict: 'slug' }).select('id, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.model}`))
console.log('✓ Done')
