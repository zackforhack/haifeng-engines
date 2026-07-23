// Reconcile Mitsubishi generator-drive engines with:
//   1. Shanghai MHI Engine Co., Ltd. 2026 SME product price sheet
//      (50 Hz / 1500 rpm; output values are mechanical kW with fan).
//   2. MHIET's official S12R-PTA2 and S16R-PTA constant-speed specifications.
//
// Run without --apply to preview. The electrical values for the SME rows use
// MHIET's published 95% alternator-efficiency convention.

import { createClient } from '@supabase/supabase-js'

const apply = process.argv.includes('--apply')
const round1 = (value) => Math.round(value * 10) / 10
const electrical = (mechanicalKw) => mechanicalKw == null ? null : round1(mechanicalKw * 0.95)
const kva = (electricalKw) => electricalKw == null ? null : round1(electricalKw / 0.8)

const smeRows = [
  // model, slug, series, displacement L, cylinders, prime kWm, standby kWm
  ['S6R2-PTA-C',          'mitsubishi-s6r2-pta-c',          'S6R2 Series', 29.96, 6,  575,  635],
  ['S6R2-PTAA-C',         'mitsubishi-s6r2-ptaa-c',         'S6R2 Series', 29.96, 6,  645,  710],
  ['S12R-PTA-C',          'mitsubishi-s12r-pta-c',          'S12R Series', 49.03, 12, 1080, 1190],
  ['S12R-PTA2-C',         'mitsubishi-s12r-pta2-c',         'S12R Series', 49.03, 12, 1165, 1285],
  ['S12R-PTAR-C',         'mitsubishi-s12r-ptar-c',         'S12R Series', 49.03, 12, null, 1303],
  ['S12R-PTAA2-C',        'mitsubishi-s12r-ptaa2-c',        'S12R Series', 49.03, 12, 1277, 1404],
  ['S12R-PTA3-C',         'mitsubishi-s12r-pta3-c',         'S12R Series', 49.03, 12, null, 1429],
  ['S16R-PTA-C',          'mitsubishi-s16r-pta-c',          'S16R Series', 65.37, 16, 1450, 1590],
  ['S16R-PTA2-C',         'mitsubishi-s16r-pta2-c',         'S16R Series', 65.37, 16, 1600, 1760],
  ['S16R-PTAR-C',         'mitsubishi-s16r-ptar-c',         'S16R Series', 65.37, 16, 1617, 1779],
  ['S16R-PTAA2-C',        'mitsubishi-s16r-ptaa2-c',        'S16R Series', 65.37, 16, 1684, 1895],
  ['S16R-PTA3-C',         'mitsubishi-s16r-pta3-c',         'S16R Series', 65.37, 16, 1750, 1925],
  ['S16R2-PTAW-C',        'mitsubishi-s16r2-ptaw-c',        'S16R2 Series', 79.9, 16, 1960, 2167],
  ['S16R2-PTA-C',         'mitsubishi-s16r2-pta-c',         'S16R2 Series', 79.9, 16, 1960, 2167],
  ['S16R2-A2PTAW-C (T3)', 'mitsubishi-s16r2-a2ptaw-c-t3',  'S16R2 Series', 79.9, 16, 1960, 2167],
  ['S16R2-PTAW2-E-C',     'mitsubishi-s16r2-ptaw2-e-c',     'S16R2 Series', 79.9, 16, 2209, 2430],
]

const smeRecords = smeRows.map(([
  model,
  slug,
  series,
  displacement_l,
  cylinders,
  prime,
  standby,
]) => {
  const primeKwe = electrical(prime)
  const standbyKwe = electrical(standby)
  const rating = prime == null
    ? `${standby} kWm standby at 50 Hz/1500 rpm; no prime rating is listed in the source sheet.`
    : `${prime} kWm prime and ${standby} kWm standby at 50 Hz/1500 rpm.`

  return {
    slug,
    brand: 'Mitsubishi',
    model,
    series,
    status: 'active',
    origin: 'China',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    configuration: cylinders === 6 ? 'L6' : `V${cylinders}`,
    cylinders,
    displacement_l,
    rpm_rated: 1500,
    prime_power_kw_50hz: prime,
    prime_power_kwe_50hz: primeKwe,
    prime_power_kva_50hz: kva(primeKwe),
    standby_power_kw_50hz: standby,
    standby_power_kwe_50hz: standbyKwe,
    standby_power_kva_50hz: kva(standbyKwe),
    description: `Mitsubishi ${model} ${displacement_l}L ${cylinders}-cylinder Shanghai MHI generator-drive diesel engine. ${rating}`,
  }
})

const officialRecords = [
  {
    slug: 'mitsubishi-s12r-pta2',
    brand: 'Mitsubishi',
    model: 'S12R-PTA2',
    series: 'S12R Series',
    status: 'active',
    origin: 'Japan',
    fuel_type: 'Diesel',
    ignition_type: 'Compression Ignition',
    cooling_method: 'Liquid-Cooled',
    configuration: 'V12',
    cylinders: 12,
    displacement_l: 49.03,
    rpm_rated: 1500,
    emissions_standard: 'Unregulated',
    weight_kg: 5400,
    length_mm: 1846,
    width_mm: 1401,
    height_mm: 1592,
    prime_power_kw_50hz: 1195,
    prime_power_kwe_50hz: 1135.2,
    prime_power_kva_50hz: 1419,
    standby_power_kw_50hz: 1315,
    standby_power_kwe_50hz: 1249.6,
    standby_power_kva_50hz: 1562,
    prime_power_kw_60hz: 1340,
    prime_power_kwe_60hz: 1272.8,
    prime_power_kva_60hz: 1591,
    standby_power_kw_60hz: 1470,
    standby_power_kwe_60hz: 1396.8,
    standby_power_kva_60hz: 1746,
    description: 'Mitsubishi S12R-PTA2 49.03L V12 generator-drive diesel engine. MHIET rates it at 1195/1315 kWm prime/standby at 50 Hz and 1340/1470 kWm at 60 Hz. A supplied build list also identifies 1200 kW 60 Hz generator packages using this model.',
  },
  {
    // Correct the old 90%-efficiency estimates; MHIET publishes these kVA values.
    slug: 'mitsubishi-s16r-pta',
    prime_power_kwe_50hz: 1406.4,
    prime_power_kva_50hz: 1758,
    standby_power_kwe_50hz: 1539.2,
    standby_power_kva_50hz: 1924,
    prime_power_kwe_60hz: 1510.4,
    prime_power_kva_60hz: 1888,
    standby_power_kwe_60hz: 1662.4,
    standby_power_kva_60hz: 2078,
  },
]

console.table(smeRecords.map((record) => ({
  model: record.model,
  displacement_l: record.displacement_l,
  prime_kwm_50hz: record.prime_power_kw_50hz,
  standby_kwm_50hz: record.standby_power_kw_50hz,
})))
console.log('Additional official records:', officialRecords.map((record) => record.slug).join(', '))

if (!apply) {
  console.log('\nDry run only. Re-run with --apply to update Supabase.')
  process.exit(0)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_KEY
if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)
const { error: smeError } = await supabase
  .from('engines')
  .upsert(smeRecords, { onConflict: 'slug' })
if (smeError) throw smeError

for (const record of officialRecords) {
  const { slug, ...changes } = record
  const { error } = await supabase.from('engines').update(changes).eq('slug', slug)
  if (error) throw error

  if (slug === 'mitsubishi-s12r-pta2') {
    const { data: existing, error: readError } = await supabase
      .from('engines')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (readError) throw readError
    if (!existing) {
      const { error: insertError } = await supabase.from('engines').insert(record)
      if (insertError) throw insertError
    }
  }
}

console.log(`Updated ${smeRecords.length + officialRecords.length} Mitsubishi records.`)
