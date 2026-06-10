import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// JCB 448 Dieselmax engines for generator sets
// Source: JCB Power Systems product pages, Westquip WQ series genset specs,
//         JCB Stage V / TA4F spec sheets
// Engine platform: 4.8L, 4-cylinder, common rail, available in Tier 3 and Tier 4 Final
// Origin: UK (JCB Power Systems Ltd, Foston, Derbyshire)

function round1(n) { return Math.round(n * 10) / 10 }

// [model, em_std, prime_kw_60hz, standby_kw_60hz, prime_kw_50hz, standby_kw_50hz]
const rows = [
  // ── EPA Tier 3 / Stage IIIA variants ─────────────────────────────────────
  // Used in Westquip WQ75T3 (70kW prime / 75kW standby @60Hz)
  ['448 TA3-75',  'U.S. EPA Tier 3',        70,  75,  60,  65],
  // Used in Westquip WQ100T3 (95kW prime / 100kW standby @60Hz)
  ['448 TA3-100', 'U.S. EPA Tier 3',        95, 100,  82,  88],
  // ── EPA Tier 4 Final variants ─────────────────────────────────────────────
  // Used in Westquip WQ75T4 (65kW prime / 70kW standby @60Hz)
  ['448 TA4F-75',  'U.S. EPA Final Tier 4',  65,  70,  56,  60],
  // Used in Westquip WQ110T4 (100kW prime / 110kW standby @60Hz)
  ['448 TA4F-110', 'U.S. EPA Final Tier 4', 100, 110,  86,  95],
  // High-output Stage V (129kW node — confirmed from JCB spec sheets)
  ['448 SV-129',   'Euro Stage V',           117, 129, 100, 110],
]

const records = rows.map(([model, emissions_standard, prime60, sb60, prime50, sb50]) => ({
  slug:                    `jcb-${model.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-')}`,
  brand:                   'JCB',
  model,
  series:                  '448 Dieselmax',
  status:                  'active',
  fuel_type:               'Diesel',
  origin:                  'UK',
  emissions_standard,
  displacement_l:          4.8,
  cylinders:               4,
  configuration:           'Turbocharged, Intercooled, Common Rail',
  rpm_rated:               1800,
  prime_power_kw_50hz:     prime50,
  prime_power_kva_50hz:    round1(prime50 / 0.8),
  standby_power_kw_50hz:   sb50,
  standby_power_kva_50hz:  round1(sb50 / 0.8),
  prime_power_kw_60hz:     prime60,
  prime_power_kva_60hz:    round1(prime60 / 0.8),
  standby_power_kw_60hz:   sb60,
  standby_power_kva_60hz:  round1(sb60 / 0.8),
  description: `JCB 448 Dieselmax 4.8L 4-cylinder diesel engine for generator sets. ${prime60} kW prime / ${sb60} kW standby at 60Hz. ${emissions_standard}.`,
}))

console.log(`Inserting ${records.length} JCB engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
