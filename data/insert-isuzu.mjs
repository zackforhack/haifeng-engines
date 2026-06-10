import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Isuzu Industrial Diesel Engines for Power Generation
// Sources: Isuzu official product pages (isuzu.co.jp/world/product/industrial/generator)
//          Tier 4 Final page + Stage IIIA page
// Rated output values used as prime power; standby = prime × 1.1
// 50Hz (1500rpm) / 60Hz (1800rpm) — kVA at 0.8 pf

function round1(n) { return Math.round(n * 10) / 10 }

// [model, disp_l, cyls, config, em_std, prime_kw_60hz, prime_kw_50hz]
const rows = [
  // ── Small L-series ────────────────────────────────────────────────────────
  ['4LE2T',  2.179, 4, 'Turbocharged',             'U.S. EPA Final Tier 4',  30,   25],
  ['4LE2X',  2.179, 4, 'Turbocharged, Intercooled', 'U.S. EPA Final Tier 4',  49,   41],
  // ── J-series ─────────────────────────────────────────────────────────────
  ['4JJ1X',  2.999, 4, 'Turbocharged, Intercooled', 'U.S. EPA Final Tier 4',  71,   57],
  // ── H-series (4-cyl) ──────────────────────────────────────────────────────
  ['4HK1X',  5.193, 4, 'Turbocharged, Intercooled', 'U.S. EPA Final Tier 4', 127,  108],
  // ── H-series (6-cyl) ──────────────────────────────────────────────────────
  ['6HK1X',  7.790, 6, 'Turbocharged, Intercooled', 'Euro Stage IIIA / U.S. EPA Tier 3', 198, 168],
  // ── UZ-series ─────────────────────────────────────────────────────────────
  ['6UZ1X',  9.839, 6, 'Turbocharged, Intercooled', 'Euro Stage IIIA / U.S. EPA Tier 3', 260, 228],
  // ── WG-series (large) ─────────────────────────────────────────────────────
  ['6WG1X', 15.681, 6, 'Turbocharged, Intercooled', 'U.S. EPA Final Tier 4', 382,  353],
]

const records = rows.map(([model, displacement_l, cylinders, config, emissions_standard, prime60, prime50]) => {
  const sb60 = round1(prime60 * 1.1)
  const sb50 = round1(prime50 * 1.1)
  return {
    slug:                     `isuzu-${model.toLowerCase().replace(/\s+/g,'-')}`,
    brand:                    'Isuzu',
    model,
    series:                   model.slice(0, 2) + '-Series',
    status:                   'active',
    fuel_type:                'Diesel',
    origin:                   'Japan',
    emissions_standard,
    displacement_l,
    cylinders,
    configuration:            config,
    rpm_rated:                1800,
    prime_power_kw_50hz:      prime50,
    prime_power_kva_50hz:     round1(prime50 / 0.8),
    standby_power_kw_50hz:    sb50,
    standby_power_kva_50hz:   round1(sb50 / 0.8),
    prime_power_kw_60hz:      prime60,
    prime_power_kva_60hz:     round1(prime60 / 0.8),
    standby_power_kw_60hz:    sb60,
    standby_power_kva_60hz:   round1(sb60 / 0.8),
    description: `Isuzu ${model} ${displacement_l}L ${cylinders}-cylinder diesel engine for generator sets. ${prime60} kW prime at 60Hz. ${emissions_standard}.`,
  }
})

console.log(`Inserting ${records.length} Isuzu engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
