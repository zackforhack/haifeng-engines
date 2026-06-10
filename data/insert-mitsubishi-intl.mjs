import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ntrysdovwnbegxtjsqkz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Mitsubishi Heavy Industries Engine & Turbocharger (MHIET) international models
// Sources:
//   engine-genset.mhi.com — official MHIET product pages (S6R2, S12R, S16R series)
//   Triton Power spec sheets — S12R-Y2PTAW-1 / S16R-Y2PTAW-1 (EPA Tier 2, North America)
// Note: existing DB has SME Shanghai (-C suffix) 50Hz models. These are the international
//       models manufactured in Japan/France with full 50Hz + 60Hz ratings.

// [model, disp_l, cyls, em_std,
//  prime50, sb50, prime60, sb60]
const rows = [
  // ── S6R2 (6-cyl inline, 29.96L) ─────────────────────────────────────────
  // Source: engine-genset.mhi.com/s6r2-pta
  ['S6R2-PTA',    29.96, 6, 'Unregulated',          595,  655,  485,  535],
  // Source: engine-genset.mhi.com/s6r2-ptaa (50Hz only on MHIET page; 60Hz estimated)
  ['S6R2-PTAA',   29.96, 6, 'Unregulated',          665,  730,  540,  595],

  // ── S12R (12-cyl V60°, 49.03L) ───────────────────────────────────────────
  // Source: engine-genset.mhi.com/s12r-pta
  ['S12R-PTA',    49.03, 12, 'Unregulated',         1110, 1220, 1190, 1320],
  // Source: engine-genset.mhi.com/s12r-ptaa2
  ['S12R-PTAA2',  49.03, 12, 'Unregulated',         1314, 1441, 1484, 1633],

  // ── S16R (16-cyl V60°, 65.37L) ───────────────────────────────────────────
  // Source: engine-genset.mhi.com/s16r-pta
  ['S16R-PTA',    65.37, 16, 'Unregulated',         1480, 1620, 1590, 1750],
  // Source: engine-genset.mhi.com/s16r-pta2
  ['S16R-PTA2',   65.37, 16, 'Unregulated',         1630, 1790, 1775, 1950],
  // Source: engine-genset.mhi.com/s16r-ptaa2
  ['S16R-PTAA2',  65.37, 16, 'Unregulated',         1760, 1939, 1939, 2149],

  // ── North American EPA Tier 2 variants (Y2PTAW) ──────────────────────────
  // Source: Triton Power TP-M1250 / TP-M1600 spec sheets; S12R-Y2PTAW-1 = 1250kW standby @60Hz
  ['S12R-Y2PTAW-1', 49.03, 12, 'U.S. EPA Tier 2',  1125, 1250,  null, null],
  // Source: Triton Power TP-M1600-T2; S16R-Y2PTAW-1 = 1600kW standby @60Hz
  ['S16R-Y2PTAW-1', 65.37, 16, 'U.S. EPA Tier 2',  1440, 1600,  null, null],
]

const records = rows.map(([model, displacement_l, cylinders, emissions_standard,
                           prime50, sb50, prime60, sb60]) => ({
  slug:                    `mitsubishi-${model.toLowerCase().replace(/[\s/()（）新]+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-').replace(/^-|-$/g,'')}`,
  brand:                   'Mitsubishi',
  model,
  series:                  model.startsWith('S6') ? 'S6R2 Series'
                         : model.startsWith('S12') ? 'S12R Series'
                         : 'S16R Series',
  status:                  'active',
  fuel_type:               'Diesel',
  origin:                  'Japan',
  emissions_standard,
  displacement_l,
  cylinders,
  configuration:           'Turbocharged, Intercooled',
  rpm_rated:               1500,
  prime_power_kw_50hz:     prime50,
  standby_power_kw_50hz:   sb50,
  prime_power_kw_60hz:     prime60 ?? null,
  standby_power_kw_60hz:   sb60 ?? null,
  description: `Mitsubishi ${model} ${displacement_l}L ${cylinders}-cylinder diesel engine for generator sets. ${prime50 ?? prime60} kW prime power. ${emissions_standard}.`,
}))

console.log(`Inserting ${records.length} Mitsubishi international engines…`)
const { data, error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' }).select('id, model')
if (error) { console.error('Error:', error.message); process.exit(1) }
data.forEach(r => console.log(`  ${r.id}  ${r.model}`))
console.log(`✓ Done — ${data.length} records upserted`)
