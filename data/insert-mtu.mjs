// Inserts 63 MTU G-Drive generator engine records into Supabase
// Source: baifapower.com/static/upload/download/FADONGJI/ (official MTU technical sales documents)
//
// MTU Application Groups → DB field mapping:
//   3B (Continuous): prime = nominal power,  standby = fuel stop power
//   3G (Prime):      prime = nominal power,  standby = fuel stop power
//   3A (Specific):   prime = nominal power,  standby = fuel stop power
//   3D (Standby):    prime = null,           standby = nominal = fuel stop power
//
// Engine dimensions:
//   2000 series (12V/16V):  bore 130mm × stroke 150mm   (23.88L / 31.84L)
//   2000 series (18V):      bore 135mm × stroke 156mm   (40.2L)
//   4000 series (12V/16V/20V): bore 170mm × stroke 210mm (57.2L / 76.3L / 95.4L)
//
// All MTU G-Drive: Diesel, Compression Ignition, Liquid-Cooled, origin=Germany
// rpm_rated=1500 (50Hz base); 60Hz-only models run at 1800rpm

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ntrysdovwnbegxtjsqkz.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY'); process.exit(1) }
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const BASE = {
  brand: 'MTU', status: 'active',
  fuel_type: 'Diesel', ignition_type: 'Compression Ignition', cooling_method: 'Liquid-Cooled',
  origin: 'Germany', rpm_rated: 1500,
  prime_power_kwe_50hz: null,  prime_power_kva_50hz: null,
  standby_power_kwe_50hz: null, standby_power_kva_50hz: null,
  prime_power_kwe_60hz: null,  prime_power_kva_60hz: null,
  standby_power_kwe_60hz: null, standby_power_kva_60hz: null,
}

const BASE_2000_12V = { ...BASE, series: '2000 Series', cylinders: 12, configuration: 'V12', displacement_l: 23.88 }
const BASE_2000_16V = { ...BASE, series: '2000 Series', cylinders: 16, configuration: 'V16', displacement_l: 31.84 }
const BASE_2000_18V = { ...BASE, series: '2000 Series', cylinders: 18, configuration: 'V18', displacement_l: 40.2  }
const BASE_4000_12V = { ...BASE, series: '4000 Series', cylinders: 12, configuration: 'V12', displacement_l: 57.2  }
const BASE_4000_16V = { ...BASE, series: '4000 Series', cylinders: 16, configuration: 'V16', displacement_l: 76.3  }
const BASE_4000_20V = { ...BASE, series: '4000 Series', cylinders: 20, configuration: 'V20', displacement_l: 95.4  }

// Helper: build 50Hz-only record
const hz50 = (prime, standby) => ({
  prime_power_kw_50hz: prime, standby_power_kw_50hz: standby,
  prime_power_kw_60hz: null,  standby_power_kw_60hz: null,
})

// Helper: build 60Hz-only record
const hz60 = (prime, standby) => ({
  prime_power_kw_50hz: null,  standby_power_kw_50hz: null,
  prime_power_kw_60hz: prime, standby_power_kw_60hz: standby,
})

const records = [

  // ═══════════════════════════════════════════════════════════════════════════
  // 12V2000 SERIES — V12, 23.88L, bore 130mm × stroke 150mm
  // ═══════════════════════════════════════════════════════════════════════════

  // G25: 3D (standby), 50Hz — PDF: fuel-consumption optimized
  { ...BASE_2000_12V, model: 'MTU 12V2000 G25',  slug: 'mtu-12v2000-g25',  emissions_standard: null,
    ...hz50(null, 635) },

  // G26F: 3B (continuous), 50Hz, fuel-optimized variant
  { ...BASE_2000_12V, model: 'MTU 12V2000 G26F', slug: 'mtu-12v2000-g26f', emissions_standard: null,
    ...hz50(709, 780) },

  // G45: 3B (continuous), 60Hz — EPA Nonroad Tier 2
  { ...BASE_2000_12V, model: 'MTU 12V2000 G45',  slug: 'mtu-12v2000-g45',  emissions_standard: 'U.S. EPA Tier 2',
    ...hz60(710, 781) },

  // G65: 3B (continuous), 50Hz
  { ...BASE_2000_12V, model: 'MTU 12V2000 G65',  slug: 'mtu-12v2000-g65',  emissions_standard: null,
    ...hz50(695, 765) },

  // G85: 3B (continuous), 60Hz — EPA Tier 2
  { ...BASE_2000_12V, model: 'MTU 12V2000 G85',  slug: 'mtu-12v2000-g85',  emissions_standard: 'U.S. EPA Tier 2',
    ...hz60(810, 891) },

  // ═══════════════════════════════════════════════════════════════════════════
  // 16V2000 SERIES — V16, 31.84L, bore 130mm × stroke 150mm
  // ═══════════════════════════════════════════════════════════════════════════

  // G25: 3B (continuous), 50Hz
  { ...BASE_2000_16V, model: 'MTU 16V2000 G25',  slug: 'mtu-16v2000-g25',  emissions_standard: null,
    ...hz50(810, 891) },

  // G45: 3D (standby), 60Hz — EPA Tier 2
  { ...BASE_2000_16V, model: 'MTU 16V2000 G45',  slug: 'mtu-16v2000-g45',  emissions_standard: 'U.S. EPA Tier 2',
    ...hz60(null, 1010) },

  // G65: 3D (standby), 50Hz
  { ...BASE_2000_16V, model: 'MTU 16V2000 G65',  slug: 'mtu-16v2000-g65',  emissions_standard: null,
    ...hz50(null, 975) },

  // G85: 3D (standby), 60Hz — EPA Tier 2
  { ...BASE_2000_16V, model: 'MTU 16V2000 G85',  slug: 'mtu-16v2000-g85',  emissions_standard: 'U.S. EPA Tier 2',
    ...hz60(null, 1115) },

  // ═══════════════════════════════════════════════════════════════════════════
  // 18V2000 SERIES — V18, 40.2L, bore 135mm × stroke 156mm
  // ═══════════════════════════════════════════════════════════════════════════

  // G26F: 3B (continuous), 50Hz, fuel-optimized
  { ...BASE_2000_18V, model: 'MTU 18V2000 G26F', slug: 'mtu-18v2000-g26f', emissions_standard: null,
    ...hz50(1102, 1212) },

  // G65: 3B (continuous), 50Hz
  { ...BASE_2000_18V, model: 'MTU 18V2000 G65',  slug: 'mtu-18v2000-g65',  emissions_standard: null,
    ...hz50(1000, 1100) },

  // G76F: 3D (standby), 50Hz, fuel-optimized
  { ...BASE_2000_18V, model: 'MTU 18V2000 G76F', slug: 'mtu-18v2000-g76f', emissions_standard: null,
    ...hz50(null, 1235) },

  // G85: 3D (standby), 60Hz — EPA Tier 2
  { ...BASE_2000_18V, model: 'MTU 18V2000 G85',  slug: 'mtu-18v2000-g85',  emissions_standard: 'U.S. EPA Tier 2',
    ...hz60(null, 1310) },

  // ═══════════════════════════════════════════════════════════════════════════
  // 12V4000 SERIES — V12, 57.2L, bore 170mm × stroke 210mm
  // ═══════════════════════════════════════════════════════════════════════════

  // G14F: 3B (continuous), 50Hz, fuel-optimized
  { ...BASE_4000_12V, model: 'MTU 12V4000 G14F', slug: 'mtu-12v4000-g14f', emissions_standard: null,
    ...hz50(1420, 1562) },

  // G14S: 3B (continuous), 60Hz, standard
  { ...BASE_4000_12V, model: 'MTU 12V4000 G14S', slug: 'mtu-12v4000-g14s', emissions_standard: null,
    ...hz60(1520, 1672) },

  // G23: 3G (prime), 50Hz
  { ...BASE_4000_12V, model: 'MTU 12V4000 G23',  slug: 'mtu-12v4000-g23',  emissions_standard: null,
    ...hz50(1420, 1562) },

  // G24F: 3B (continuous), 50Hz, fuel-optimized, higher power tier
  { ...BASE_4000_12V, model: 'MTU 12V4000 G24F', slug: 'mtu-12v4000-g24f', emissions_standard: null,
    ...hz50(1575, 1733) },

  // G24S: 3B (continuous), 60Hz, standard, higher power tier
  { ...BASE_4000_12V, model: 'MTU 12V4000 G24S', slug: 'mtu-12v4000-g24s', emissions_standard: null,
    ...hz60(1736, 1910) },

  // G43: 3D (standby), 60Hz
  { ...BASE_4000_12V, model: 'MTU 12V4000 G43',  slug: 'mtu-12v4000-g43',  emissions_standard: null,
    ...hz60(null, 1736) },

  // G63: 3G (prime), 50Hz, higher power tier
  { ...BASE_4000_12V, model: 'MTU 12V4000 G63',  slug: 'mtu-12v4000-g63',  emissions_standard: null,
    ...hz50(1575, 1733) },

  // G74F: 3D (standby), 50Hz, fuel-optimized
  { ...BASE_4000_12V, model: 'MTU 12V4000 G74F', slug: 'mtu-12v4000-g74f', emissions_standard: null,
    ...hz50(null, 1575) },

  // G83: 3A (specific application), 60Hz
  { ...BASE_4000_12V, model: 'MTU 12V4000 G83',  slug: 'mtu-12v4000-g83',  emissions_standard: null,
    ...hz60(1420, 1562) },

  // G84F: 3D (standby), 50Hz, fuel-optimized, highest power tier
  { ...BASE_4000_12V, model: 'MTU 12V4000 G84F', slug: 'mtu-12v4000-g84f', emissions_standard: null,
    ...hz50(null, 1750) },

  // G84S: 3D (standby), 60Hz, standard
  { ...BASE_4000_12V, model: 'MTU 12V4000 G84S', slug: 'mtu-12v4000-g84s', emissions_standard: null,
    ...hz60(null, 1910) },

  // ═══════════════════════════════════════════════════════════════════════════
  // 16V4000 SERIES — V16, 76.3L, bore 170mm × stroke 210mm
  // ═══════════════════════════════════════════════════════════════════════════

  // G14F: 3B (continuous), 50Hz, fuel-optimized
  { ...BASE_4000_16V, model: 'MTU 16V4000 G14F', slug: 'mtu-16v4000-g14f', emissions_standard: null,
    ...hz50(1798, 1978) },

  // G14S: 3B (continuous), 60Hz, standard
  { ...BASE_4000_16V, model: 'MTU 16V4000 G14S', slug: 'mtu-16v4000-g14s', emissions_standard: null,
    ...hz60(2020, 2222) },

  // G23: 3B (continuous), 50Hz
  { ...BASE_4000_16V, model: 'MTU 16V4000 G23',  slug: 'mtu-16v4000-g23',  emissions_standard: null,
    ...hz50(1798, 1978) },

  // G24F: 3B (continuous), 50Hz, fuel-optimized, higher power tier
  { ...BASE_4000_16V, model: 'MTU 16V4000 G24F', slug: 'mtu-16v4000-g24f', emissions_standard: null,
    ...hz50(1965, 2162) },

  // G24S: 3B (continuous), 60Hz, standard, higher power tier
  { ...BASE_4000_16V, model: 'MTU 16V4000 G24S', slug: 'mtu-16v4000-g24s', emissions_standard: null,
    ...hz60(2280, 2508) },

  // G43: 3D (standby), 60Hz
  { ...BASE_4000_16V, model: 'MTU 16V4000 G43',  slug: 'mtu-16v4000-g43',  emissions_standard: null,
    ...hz60(null, 2280) },

  // G63: 3G (prime), 50Hz
  { ...BASE_4000_16V, model: 'MTU 16V4000 G63',  slug: 'mtu-16v4000-g63',  emissions_standard: null,
    ...hz50(1965, 2162) },

  // G74F: 3D (standby), 50Hz, fuel-optimized
  { ...BASE_4000_16V, model: 'MTU 16V4000 G74F', slug: 'mtu-16v4000-g74f', emissions_standard: null,
    ...hz50(null, 1965) },

  // G74S: 3D (standby), 60Hz, standard
  { ...BASE_4000_16V, model: 'MTU 16V4000 G74S', slug: 'mtu-16v4000-g74s', emissions_standard: null,
    ...hz60(null, 2280) },

  // G83: 3D (standby), 60Hz, higher power tier
  { ...BASE_4000_16V, model: 'MTU 16V4000 G83',  slug: 'mtu-16v4000-g83',  emissions_standard: null,
    ...hz60(null, 2500) },

  // G83L: 3D (standby), 60Hz, load-flexible variant, highest power tier
  { ...BASE_4000_16V, model: 'MTU 16V4000 G83L', slug: 'mtu-16v4000-g83l', emissions_standard: null,
    ...hz60(null, 2740) },

  // G84F: 3D (standby), 50Hz, fuel-optimized, highest power tier
  { ...BASE_4000_16V, model: 'MTU 16V4000 G84F', slug: 'mtu-16v4000-g84f', emissions_standard: null,
    ...hz50(null, 2185) },

  // G84S: 3D (standby), 60Hz, standard
  { ...BASE_4000_16V, model: 'MTU 16V4000 G84S', slug: 'mtu-16v4000-g84s', emissions_standard: null,
    ...hz60(null, 2500) },

  // G94S: 3D (standby), 60Hz, standard, ultra-high power tier
  { ...BASE_4000_16V, model: 'MTU 16V4000 G94S', slug: 'mtu-16v4000-g94s', emissions_standard: null,
    ...hz60(null, 2740) },

  // ═══════════════════════════════════════════════════════════════════════════
  // 20V4000 SERIES — V20, 95.4L, bore 170mm × stroke 210mm
  // ═══════════════════════════════════════════════════════════════════════════

  // G14F: 3B (continuous), 50Hz, fuel-optimized
  { ...BASE_4000_20V, model: 'MTU 20V4000 G14F', slug: 'mtu-20v4000-g14f', emissions_standard: null,
    ...hz50(2200, 2420) },

  // G14S: 3B (continuous), 60Hz, standard
  { ...BASE_4000_20V, model: 'MTU 20V4000 G14S', slug: 'mtu-20v4000-g14s', emissions_standard: null,
    ...hz60(2490, 2739) },

  // G23: 3G (prime), 50Hz
  { ...BASE_4000_20V, model: 'MTU 20V4000 G23',  slug: 'mtu-20v4000-g23',  emissions_standard: null,
    ...hz50(2200, 2420) },

  // G23F: 3B (continuous), 50Hz, fuel-optimized
  { ...BASE_4000_20V, model: 'MTU 20V4000 G23F', slug: 'mtu-20v4000-g23f', emissions_standard: null,
    ...hz50(2200, 2420) },

  // G24F: 3B (continuous), 50Hz, fuel-optimized, higher power tier
  { ...BASE_4000_20V, model: 'MTU 20V4000 G24F', slug: 'mtu-20v4000-g24f', emissions_standard: null,
    ...hz50(2420, 2662) },

  // G24S: 3B (continuous), 60Hz, standard, higher power tier
  { ...BASE_4000_20V, model: 'MTU 20V4000 G24S', slug: 'mtu-20v4000-g24s', emissions_standard: null,
    ...hz60(2740, 3014) },

  // G34F: 3B (continuous), 50Hz, fuel-optimized, third power tier
  { ...BASE_4000_20V, model: 'MTU 20V4000 G34F', slug: 'mtu-20v4000-g34f', emissions_standard: null,
    ...hz50(2590, 2849) },

  // G43: 3G (prime), 60Hz
  { ...BASE_4000_20V, model: 'MTU 20V4000 G43',  slug: 'mtu-20v4000-g43',  emissions_standard: null,
    ...hz60(2490, 2739) },

  // G44F: 3B (continuous), 50Hz, fuel-optimized, fourth power tier
  { ...BASE_4000_20V, model: 'MTU 20V4000 G44F', slug: 'mtu-20v4000-g44f', emissions_standard: null,
    ...hz50(2807, 3088) },

  // G44S: 3B (continuous), 60Hz, standard, fourth power tier
  { ...BASE_4000_20V, model: 'MTU 20V4000 G44S', slug: 'mtu-20v4000-g44s', emissions_standard: null,
    ...hz60(3010, 3311) },

  // G63: 3D (standby), 50Hz
  { ...BASE_4000_20V, model: 'MTU 20V4000 G63',  slug: 'mtu-20v4000-g63',  emissions_standard: null,
    ...hz50(null, 2670) },

  // G63F: 3B (continuous), 50Hz, fuel-optimized
  { ...BASE_4000_20V, model: 'MTU 20V4000 G63F', slug: 'mtu-20v4000-g63f', emissions_standard: null,
    ...hz50(2420, 2662) },

  // G63L: 3B (continuous), 50Hz, load-flexible
  { ...BASE_4000_20V, model: 'MTU 20V4000 G63L', slug: 'mtu-20v4000-g63l', emissions_standard: null,
    ...hz50(2590, 2849) },

  // G63LF: 3B (continuous), 50Hz, load-flexible + fuel-optimized
  { ...BASE_4000_20V, model: 'MTU 20V4000 G63LF',slug: 'mtu-20v4000-g63lf',emissions_standard: null,
    ...hz50(2590, 2849) },

  // G64F: 3D (standby), 50Hz, fuel-optimized
  { ...BASE_4000_20V, model: 'MTU 20V4000 G64F', slug: 'mtu-20v4000-g64f', emissions_standard: null,
    ...hz50(null, 2420) },

  // G64S: 3D (standby), 60Hz, standard
  { ...BASE_4000_20V, model: 'MTU 20V4000 G64S', slug: 'mtu-20v4000-g64s', emissions_standard: null,
    ...hz60(null, 2740) },

  // G74F: 3D (standby), 50Hz, fuel-optimized, higher power tier
  { ...BASE_4000_20V, model: 'MTU 20V4000 G74F', slug: 'mtu-20v4000-g74f', emissions_standard: null,
    ...hz50(null, 2670) },

  // G74S: 3D (standby), 60Hz, standard, higher power tier
  { ...BASE_4000_20V, model: 'MTU 20V4000 G74S', slug: 'mtu-20v4000-g74s', emissions_standard: null,
    ...hz60(null, 3010) },

  // G83: 3D (standby), 60Hz, fifth power tier
  { ...BASE_4000_20V, model: 'MTU 20V4000 G83',  slug: 'mtu-20v4000-g83',  emissions_standard: null,
    ...hz60(null, 3010) },

  // G83L: 3B (continuous), 60Hz, load-flexible
  { ...BASE_4000_20V, model: 'MTU 20V4000 G83L', slug: 'mtu-20v4000-g83l', emissions_standard: null,
    ...hz60(3010, 3311) },

  // G84F: 3D (standby), 50Hz, fuel-optimized
  { ...BASE_4000_20V, model: 'MTU 20V4000 G84F', slug: 'mtu-20v4000-g84f', emissions_standard: null,
    ...hz50(null, 2850) },

  // G94F: 3D (standby), 50Hz, fuel-optimized, ultra-high power tier
  { ...BASE_4000_20V, model: 'MTU 20V4000 G94F', slug: 'mtu-20v4000-g94f', emissions_standard: null,
    ...hz50(null, 3088) },

  // G94S: 3D (standby), 60Hz, standard, ultra-high power tier
  { ...BASE_4000_20V, model: 'MTU 20V4000 G94S', slug: 'mtu-20v4000-g94s', emissions_standard: null,
    ...hz60(null, 3490) },
]

console.log(`Upserting ${records.length} MTU engine records...`)
const { error } = await supabase.from('engines').upsert(records, { onConflict: 'slug' })
if (error) { console.error('Upsert failed:', error.message); process.exit(1) }

console.log('Done:')
records.forEach(r => {
  const s50 = r.standby_power_kw_50hz ? `50Hz: ${r.prime_power_kw_50hz ?? '—'}/${r.standby_power_kw_50hz}kWm` : ''
  const s60 = r.standby_power_kw_60hz ? `60Hz: ${r.prime_power_kw_60hz ?? '—'}/${r.standby_power_kw_60hz}kWm` : ''
  console.log(`  ${r.model} | ${[s50, s60].filter(Boolean).join(' | ')}`)
})
