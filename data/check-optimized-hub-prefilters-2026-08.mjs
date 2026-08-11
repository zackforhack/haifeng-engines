// Read-only regression check: compare optimized hub prefilters against a full-scan baseline.

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const SELECT = [
  'id',
  'slug',
  'brand',
  'model',
  'series',
  'status',
  'year_discontinued',
  'power_kw',
  'prime_power_kw_50hz',
  'prime_power_kwe_50hz',
  'prime_power_kva_50hz',
  'standby_power_kw_50hz',
  'standby_power_kwe_50hz',
  'standby_power_kva_50hz',
  'prime_power_kw_60hz',
  'prime_power_kwe_60hz',
  'prime_power_kva_60hz',
  'standby_power_kw_60hz',
  'standby_power_kwe_60hz',
  'standby_power_kva_60hz',
  'displacement_l',
  'cylinders',
  'configuration',
  'rpm_rated',
  'fuel_type',
  'emissions_standard',
  'origin',
  'created_at',
  'updated_at',
  'pdfs:engine_pdfs(id)',
].join(',')

const GAS_FUEL = /natural gas|bio\s?gas|biomethane|coal(?:\s|-)?(?:mine\s*)?gas|landfill gas|producer gas|syngas|cbm|cng|lng|lpg|propane|gaseous|(?:^|[^a-z])gas(?:$|[^a-z])/i
const KWE_FILTER_COLUMNS = [
  'standby_power_kwe_50hz',
  'prime_power_kwe_50hz',
  'standby_power_kwe_60hz',
  'prime_power_kwe_60hz',
  'standby_power_kw_50hz',
  'prime_power_kw_50hz',
  'standby_power_kw_60hz',
  'prime_power_kw_60hz',
]

async function fetchAll(buildQuery = (query) => query) {
  const rows = []
  for (let from = 0; ; from += 500) {
    const query = buildQuery(supabase.from('engines').select(SELECT))
    const { data, error } = await query.range(from, from + 499)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < 500) break
  }
  return rows
}

function matchesFuel(fuelType, fuel) {
  const value = fuelType ?? ''
  return fuel === 'gas' ? GAS_FUEL.test(value) : /diesel/i.test(value)
}

function normalizeEmissionComponent(value) {
  const v = String(value ?? '').trim().replace(/\s+/g, ' ')
  if (/^(?:U\.S\.\s*)?EPA\s+Final\s+Tier\s+4$/i.test(v)) return 'U.S. EPA Final Tier 4'
  if (/^(?:U\.S\.\s*)?EPA\s+Tier\s+4\s+Final$/i.test(v)) return 'U.S. EPA Final Tier 4'
  if (/^(?:US|U\.S\.\s*EPA)?\s*Tier\s+4f$/i.test(v)) return 'U.S. EPA Final Tier 4'
  if (/^Stage\s+V$/i.test(v)) return 'Euro Stage V'
  return v
}

function matchesEmission(emissionsStandard, selected) {
  if (!emissionsStandard) return false
  const em = normalizeEmissionComponent(selected)
  return emissionsStandard
    .split(/\s*\/\s*/)
    .map(normalizeEmissionComponent)
    .some((part) => part === em || part.startsWith(em + ' '))
}

function representativeKwe(engine) {
  return (
    engine.standby_power_kwe_50hz ??
    engine.prime_power_kwe_50hz ??
    engine.standby_power_kwe_60hz ??
    engine.prime_power_kwe_60hz ??
    engine.standby_power_kw_50hz ??
    engine.prime_power_kw_50hz ??
    engine.standby_power_kw_60hz ??
    engine.prime_power_kw_60hz ??
    (engine.power_kw == null ? null : Math.round(engine.power_kw * 0.9 * 10) / 10)
  )
}

function matchesPower(engine, min, max) {
  const value = representativeKwe(engine)
  if (value == null) return false
  if (min != null && value < min) return false
  if (max != null && value > max) return false
  return true
}

function numericRangePredicate(column, min, max) {
  if (min != null && max != null) return `and(${column}.gte.${min},${column}.lte.${max})`
  if (min != null) return `${column}.gte.${min}`
  return `${column}.lte.${max}`
}

function powerRangePredicate(min, max) {
  const parts = KWE_FILTER_COLUMNS.map((column) => numericRangePredicate(column, min, max))
  const mechanicalMin = min == null ? undefined : Math.round((min / 0.9) * 10) / 10
  const mechanicalMax = max == null ? undefined : Math.round((max / 0.9) * 10) / 10
  parts.push(numericRangePredicate('power_kw', mechanicalMin, mechanicalMax))
  return parts.join(',')
}

function gasFuelPredicate() {
  return [
    'fuel_type.ilike.%natural gas%',
    'fuel_type.ilike.%biogas%',
    'fuel_type.ilike.%biomethane%',
    'fuel_type.ilike.%coal gas%',
    'fuel_type.ilike.%coal-mine gas%',
    'fuel_type.ilike.%landfill gas%',
    'fuel_type.ilike.%producer gas%',
    'fuel_type.ilike.%syngas%',
    'fuel_type.ilike.%cbm%',
    'fuel_type.ilike.%cng%',
    'fuel_type.ilike.%lng%',
    'fuel_type.ilike.%lpg%',
    'fuel_type.ilike.%propane%',
    'fuel_type.ilike.%gaseous%',
    'fuel_type.eq.Gas',
  ].join(',')
}

function emissionsPrefilterPredicate(value) {
  const normalized = normalizeEmissionComponent(value)
  if (/^U\.S\. EPA Final Tier 4$/i.test(normalized)) {
    return [
      'emissions_standard.ilike.%U.S. EPA Final Tier 4%',
      'emissions_standard.ilike.%U.S. EPA Tier 4 Final%',
      'emissions_standard.ilike.%EPA Final Tier 4%',
      'emissions_standard.ilike.%EPA Tier 4 Final%',
      'emissions_standard.ilike.%Tier 4f%',
    ].join(',')
  }
  if (/^U\.S\. EPA Tier \d+/i.test(normalized)) {
    const tier = normalized.match(/Tier\s+\d+/i)?.[0]
    return tier ? `emissions_standard.ilike.%${tier}%` : null
  }
  if (/^U\.S\. EPA Stationary$/i.test(normalized)) return 'emissions_standard.ilike.%Stationary%'
  if (/^Euro Stage/i.test(normalized)) return `emissions_standard.ilike.%${normalized.replace(/^Euro\s+/, '')}%`
  if (/^China National Stage/i.test(normalized)) return `emissions_standard.ilike.%${normalized.replace(/^China National\s+/, '')}%`
  return null
}

const baseline = await fetchAll()
const cases = [
  {
    name: 'fuel gas',
    filter: (engine) => matchesFuel(engine.fuel_type, 'gas'),
    build: (query) => query.or(gasFuelPredicate()),
  },
  {
    name: 'fuel diesel',
    filter: (engine) => matchesFuel(engine.fuel_type, 'diesel'),
    build: (query) => query.ilike('fuel_type', '%diesel%'),
  },
  {
    name: 'power 100-500',
    filter: (engine) => matchesPower(engine, 100, 500),
    build: (query) => query.or(powerRangePredicate(100, 500)),
  },
  {
    name: 'power 2000+',
    filter: (engine) => matchesPower(engine, 2000),
    build: (query) => query.or(powerRangePredicate(2000)),
  },
  {
    name: 'emissions EPA Final Tier 4',
    filter: (engine) => matchesEmission(engine.emissions_standard, 'U.S. EPA Final Tier 4'),
    build: (query) => query.or(emissionsPrefilterPredicate('U.S. EPA Final Tier 4')),
  },
  {
    name: 'emissions Euro Stage V',
    filter: (engine) => matchesEmission(engine.emissions_standard, 'Euro Stage V'),
    build: (query) => query.or(emissionsPrefilterPredicate('Euro Stage V')),
  },
]

let failed = false
for (const testCase of cases) {
  const expected = baseline.filter(testCase.filter).map((engine) => engine.slug).sort()
  const optimized = (await fetchAll(testCase.build)).filter(testCase.filter).map((engine) => engine.slug).sort()
  const optimizedSet = new Set(optimized)
  const expectedSet = new Set(expected)
  const missing = expected.filter((slug) => !optimizedSet.has(slug))
  const extra = optimized.filter((slug) => !expectedSet.has(slug))
  console.log(JSON.stringify({
    case: testCase.name,
    expected: expected.length,
    optimized: optimized.length,
    missing: missing.slice(0, 10),
    extra: extra.slice(0, 10),
  }))
  if (missing.length || extra.length) failed = true
}

if (failed) process.exit(1)
