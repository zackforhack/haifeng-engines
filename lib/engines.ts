import { cache } from 'react'
import { supabase } from './supabase'
import type { Engine } from './types'

export interface FilterParams {
  q?: string
  brand?: string
  origin?: string
  emissions?: string
  config?: string
  fuel?: 'diesel' | 'gas'
  fuel_type?: string
  rpm?: number
  hz?: '50' | '60'
  status?: string
  min_kwe?: number
  max_kwe?: number
  sort?: string
}

export interface EnginePageResult {
  engines: Engine[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// "Gas" covers gaseous power-gen fuels (natural gas including CNG/LNG, biogas/biomethane,
// coal-mine gas/CBM, propane/LPG); "diesel" matches the compression-ignition diesels. Methanol (a liquid
// alt-fuel), gasoline and unknown fuels match neither broad bucket but are still selectable via
// the granular Fuel Type dropdown.
const GAS_FUEL = /natural gas|bio\s?gas|biomethane|coal(?:\s|-)?(?:mine\s*)?gas|landfill gas|producer gas|syngas|cbm|cng|lng|lpg|propane|gaseous|(?:^|[^a-z])gas(?:$|[^a-z])/i
// Full engine rows include nested PDF metadata. Keep each response below
// Next.js's 2 MB data-cache entry limit so static generation can reuse it.
const ENGINE_FETCH_PAGE = 500

const ENGINE_LIST_SELECT = [
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
].join(',')

const ENGINE_COMPARE_SELECT = [
  'id',
  'slug',
  'brand',
  'model',
  'series',
  'status',
  'power_kw',
  'prime_power_kwe_50hz',
  'standby_power_kwe_50hz',
  'prime_power_kwe_60hz',
  'standby_power_kwe_60hz',
  'displacement_l',
  'cylinders',
  'configuration',
  'rpm_rated',
  'fuel_type',
  'cooling_method',
  'emissions_standard',
  'origin',
  'weight_kg',
  'created_at',
  'updated_at',
].join(',')

const ENGINE_HUB_SELECT = `${ENGINE_LIST_SELECT},pdfs:engine_pdfs(id)`

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

export function matchesFuel(fuelType: string | null | undefined, fuel: 'diesel' | 'gas'): boolean {
  const ft = fuelType ?? ''
  return fuel === 'gas' ? GAS_FUEL.test(ft) : /diesel/i.test(ft)
}

export function canonicalFuelType(fuelType: string | null | undefined): string {
  const ft = (fuelType ?? '').trim().replace(/\s+/g, ' ')
  if (!ft) return ''
  if (/^natural gas(?:\s*\([^)]*(?:cng|lng)[^)]*\)|\s*\/\s*biomethane)$/i.test(ft)) {
    return 'Natural Gas'
  }
  if (/^(?:lpg|lp gas|propane\s*\/\s*lpg|lpg\s*\/\s*propane)$/i.test(ft)) {
    return 'Propane (LPG)'
  }
  return ft
}

// Granular Fuel Type match compares canonical labels so aliases do not split filters.
export function matchesFuelType(fuelType: string | null | undefined, selected: string): boolean {
  return canonicalFuelType(fuelType) === canonicalFuelType(selected)
}

export interface FilterOptions {
  brands: string[]
  origins: string[]
  emissions: string[]
  configs: string[]
  fuelTypes: string[]
}

function isFilterOptions(value: unknown): value is FilterOptions {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<Record<keyof FilterOptions, unknown>>
  return (
    Array.isArray(candidate.brands) &&
    Array.isArray(candidate.origins) &&
    Array.isArray(candidate.emissions) &&
    Array.isArray(candidate.configs) &&
    Array.isArray(candidate.fuelTypes)
  )
}

function normalizeEmissionComponent(value: string): string {
  const v = value.trim().replace(/\s+/g, ' ')
  if (/^(?:U\.S\.\s*)?EPA\s+Final\s+Tier\s+4$/i.test(v)) return 'U.S. EPA Final Tier 4'
  if (/^(?:U\.S\.\s*)?EPA\s+Tier\s+4\s+Final$/i.test(v)) return 'U.S. EPA Final Tier 4'
  if (/^(?:US|U\.S\.\s*EPA)?\s*Tier\s+4f$/i.test(v)) return 'U.S. EPA Final Tier 4'
  if (/^Stage\s+V$/i.test(v)) return 'Euro Stage V'
  return v
}

function emissionComponents(value: string): string[] {
  return value.split(/\s*\/\s*/).map(normalizeEmissionComponent).filter(Boolean)
}

function matchesEmission(emissionsStandard: string | null | undefined, selected: string): boolean {
  if (!emissionsStandard) return false
  const em = normalizeEmissionComponent(selected)
  const components = emissionComponents(emissionsStandard)
  return components.some((part) => part === em || part.startsWith(em + ' '))
}

function representativeKwe(e: Engine): number | null {
  return (
    e.standby_power_kwe_50hz ??
    e.prime_power_kwe_50hz ??
    e.standby_power_kwe_60hz ??
    e.prime_power_kwe_60hz ??
    e.standby_power_kw_50hz ??
    e.prime_power_kw_50hz ??
    e.standby_power_kw_60hz ??
    e.prime_power_kw_60hz ??
    (e.power_kw == null ? null : Math.round(e.power_kw * 0.9 * 10) / 10) ??
    null
  )
}

function escapeLike(value: string): string {
  return value.replace(/[%_]/g, '\\$&')
}

function numericRangePredicate(column: string, min?: number, max?: number): string {
  if (min != null && max != null) return `and(${column}.gte.${min},${column}.lte.${max})`
  if (min != null) return `${column}.gte.${min}`
  return `${column}.lte.${max}`
}

function powerRangePredicate(min?: number, max?: number): string {
  const parts = KWE_FILTER_COLUMNS.map((column) => numericRangePredicate(column, min, max))
  const mechanicalMin = min == null ? undefined : Math.round((min / 0.9) * 10) / 10
  const mechanicalMax = max == null ? undefined : Math.round((max / 0.9) * 10) / 10
  parts.push(numericRangePredicate('power_kw', mechanicalMin, mechanicalMax))
  return parts.join(',')
}

function gasFuelPredicate(): string {
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

function emissionsPrefilterPredicate(value: string): string | null {
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
  if (/^U\.S\. EPA Stationary$/i.test(normalized)) {
    return 'emissions_standard.ilike.%Stationary%'
  }
  if (/^Euro Stage/i.test(normalized)) {
    return `emissions_standard.ilike.%${escapeLike(normalized.replace(/^Euro\s+/, ''))}%`
  }
  if (/^China National Stage/i.test(normalized)) {
    return `emissions_standard.ilike.%${escapeLike(normalized.replace(/^China National\s+/, ''))}%`
  }
  return null
}

function isMissingRepresentativeKwe(error: { message?: string; details?: string | null }): boolean {
  const text = `${error.message ?? ''} ${error.details ?? ''}`.toLowerCase()
  return text.includes('representative_kwe') && (
    text.includes('does not exist') ||
    text.includes('could not find') ||
    text.includes('schema cache')
  )
}

async function runEnginePageQuery(
  params: FilterParams,
  page: number,
  pageSize: number,
  useRepresentativePowerSort: boolean,
): Promise<{ data: Engine[]; count: number }> {
  let query = supabase
    .from('engines')
    .select(ENGINE_LIST_SELECT, { count: 'exact' })

  if (params.q) {
    const term = escapeLike(params.q.trim())
    query = query.or(
      `brand.ilike.%${term}%,model.ilike.%${term}%,series.ilike.%${term}%`
    )
  }
  if (params.brand)  query = query.eq('brand', params.brand)
  if (params.origin) query = query.eq('origin', params.origin)
  if (params.config) query = query.eq('configuration', params.config)
  if (params.rpm)    query = query.eq('rpm_rated', params.rpm)
  if (params.status) query = query.eq('status', params.status)
  if (params.emissions) query = query.ilike('emissions_standard', `%${escapeLike(params.emissions)}%`)

  if (params.fuel === 'gas') {
    query = query.or([
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
    ].join(','))
  } else if (params.fuel === 'diesel') {
    query = query.ilike('fuel_type', '%diesel%')
  }

  if (params.fuel_type) {
    query = params.fuel_type === 'Natural Gas'
      ? query.ilike('fuel_type', 'Natural Gas%')
      : query.eq('fuel_type', params.fuel_type)
  }

  if (params.hz === '50') {
    query = query.or('prime_power_kwe_50hz.not.is.null,standby_power_kwe_50hz.not.is.null,prime_power_kw_50hz.not.is.null,standby_power_kw_50hz.not.is.null')
  } else if (params.hz === '60') {
    query = query.or('prime_power_kwe_60hz.not.is.null,standby_power_kwe_60hz.not.is.null,prime_power_kw_60hz.not.is.null,standby_power_kw_60hz.not.is.null')
  }

  if (params.min_kwe != null || params.max_kwe != null) {
    query = query.or(powerRangePredicate(params.min_kwe, params.max_kwe))
  }

  if (params.sort === 'disp_desc') {
    query = query.order('displacement_l', { ascending: false, nullsFirst: false })
      .order('brand').order('model')
  } else if (params.sort === 'disp_asc') {
    query = query.order('displacement_l', { ascending: true, nullsFirst: false })
      .order('brand').order('model')
  } else if (params.sort === 'kwe_desc' && useRepresentativePowerSort) {
    query = query.order('representative_kwe', { ascending: false, nullsFirst: false })
      .order('brand').order('model')
  } else if (params.sort === 'kwe_asc' && useRepresentativePowerSort) {
    query = query.order('representative_kwe', { ascending: true, nullsFirst: false })
      .order('brand').order('model')
  } else {
    query = query.order('brand').order('model')
  }

  const from = (page - 1) * pageSize
  const { data, error, count } = await query.range(from, from + pageSize - 1)
  if (error) throw error
  return { data: (data ?? []) as unknown as Engine[], count: count ?? 0 }
}

export async function searchEnginesPage(
  params: FilterParams,
  { page = 1, pageSize }: { page?: number; pageSize: number },
): Promise<EnginePageResult> {
  const safePageSize = Math.max(1, Math.min(pageSize, 100))
  const requestedPage = Math.max(1, Math.floor(page))

  async function run(targetPage: number, useRepresentativePowerSort = true) {
    try {
      return await runEnginePageQuery(params, targetPage, safePageSize, useRepresentativePowerSort)
    } catch (error) {
      if (
        useRepresentativePowerSort &&
        (params.sort === 'kwe_desc' || params.sort === 'kwe_asc') &&
        isMissingRepresentativeKwe(error as { message?: string; details?: string | null })
      ) {
        return runEnginePageQuery(params, targetPage, safePageSize, false)
      }
      throw error
    }
  }

  let { data, count } = await run(requestedPage)
  const totalPages = Math.max(1, Math.ceil(count / safePageSize))
  const safePage = Math.min(requestedPage, totalPages)

  if (safePage !== requestedPage) {
    const rerun = await run(safePage)
    data = rerun.data
    count = rerun.count
  }

  return {
    engines: data,
    total: count,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(count / safePageSize)),
  }
}

export async function filterEngines(params: FilterParams): Promise<Engine[]> {
  const all: Engine[] = []
  let from = 0

  while (true) {
    let q = supabase
      .from('engines')
      .select(ENGINE_HUB_SELECT)

    if (params.q) {
      q = q.or(
        `brand.ilike.%${params.q}%,model.ilike.%${params.q}%,series.ilike.%${params.q}%`
      )
    }
    if (params.brand)  q = q.eq('brand', params.brand)
    if (params.origin) q = q.eq('origin', params.origin)
    if (params.config) q = q.eq('configuration', params.config)
  if (params.rpm)    q = q.eq('rpm_rated', params.rpm)
  if (params.status) q = q.eq('status', params.status)
    // Emissions still get a post-filter for component normalization, but a broad
    // DB prefilter avoids scanning the whole catalog for static hub pages.
    if (params.emissions) {
      const predicate = emissionsPrefilterPredicate(params.emissions)
      if (predicate) q = q.or(predicate)
    }

    if (params.fuel === 'gas') {
      q = q.or(gasFuelPredicate())
    } else if (params.fuel === 'diesel') {
      q = q.ilike('fuel_type', '%diesel%')
    }

    if (params.fuel_type) {
      q = params.fuel_type === 'Natural Gas'
        ? q.ilike('fuel_type', 'Natural Gas%')
        : q.eq('fuel_type', params.fuel_type)
    }

  if (params.hz === '50') {
      q = q.or('prime_power_kwe_50hz.not.is.null,standby_power_kwe_50hz.not.is.null,prime_power_kw_50hz.not.is.null,standby_power_kw_50hz.not.is.null')
  } else if (params.hz === '60') {
      q = q.or('prime_power_kwe_60hz.not.is.null,standby_power_kwe_60hz.not.is.null,prime_power_kw_60hz.not.is.null,standby_power_kw_60hz.not.is.null')
    }

    if (params.min_kwe != null || params.max_kwe != null) {
      q = q.or(powerRangePredicate(params.min_kwe, params.max_kwe))
  }

    if (params.sort === 'disp_desc') {
      q = q.order('displacement_l', { ascending: false, nullsFirst: false })
        .order('brand').order('model')
    } else if (params.sort === 'disp_asc') {
      q = q.order('displacement_l', { ascending: true, nullsFirst: false })
        .order('brand').order('model')
    } else {
      q = q.order('brand').order('model')
    }

    const { data, error } = await q.range(from, from + ENGINE_FETCH_PAGE - 1)
    if (error) throw error
    all.push(...((data ?? []) as unknown as Engine[]))
    if (!data || data.length < ENGINE_FETCH_PAGE) break
    from += ENGINE_FETCH_PAGE
  }

  // Post-fetch filters
  let result = all

  // Emissions: exact component match OR word-boundary prefix match.
  // Exact/component: "U.S. EPA Final Tier 4" matches "Euro Stage V / U.S. EPA Final Tier 4".
  // Prefix: "U.S. EPA" matches "U.S. EPA Final Tier 4" and each component of dual standards.
  // Space suffix prevents "Stage II" from falsely matching "Stage IIIA".
  if (params.emissions) {
    result = result.filter((e) => matchesEmission(e.emissions_standard, params.emissions!))
  }

  // Fuel category (post-fetch: "gas" spans several fuel_type strings)
  if (params.fuel) {
    result = result.filter((e) => matchesFuel(e.fuel_type, params.fuel!))
  }

  // Granular fuel type (e.g. "Coal Gas", "Methanol"; aliases are canonicalized before matching)
  if (params.fuel_type) {
    result = result.filter((e) => matchesFuelType(e.fuel_type, params.fuel_type!))
  }

  // Power range filter (too complex for PostgREST OR across 4 columns)
  if (params.min_kwe != null || params.max_kwe != null) {
    result = result.filter((e) => {
      const kwe = representativeKwe(e)
      if (kwe === null) return false
      if (params.min_kwe != null && kwe < params.min_kwe) return false
      if (params.max_kwe != null && kwe > params.max_kwe) return false
      return true
    })
  }

  // kWe sort (post-fetch — no single DB column)
  if (params.sort === 'kwe_desc') {
    result.sort((a, b) => (representativeKwe(b) ?? 0) - (representativeKwe(a) ?? 0))
  } else if (params.sort === 'kwe_asc') {
    result.sort(
      (a, b) => (representativeKwe(a) ?? Infinity) - (representativeKwe(b) ?? Infinity)
    )
  }

  return result
}

async function getFilterOptionsByScan(): Promise<FilterOptions> {
  // Paginate — PostgREST caps a single request at 1000 rows, and the table
  // now exceeds that, so an unpaginated query silently drops brands/emissions
  // that only appear in later rows (e.g. recently-added Caterpillar).
  const PAGE = 1000
  const rows: { brand: string | null; origin: string | null; emissions_standard: string | null; configuration: string | null; fuel_type: string | null }[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('engines')
      .select('brand, origin, emissions_standard, configuration, fuel_type')
      .range(from, from + PAGE - 1)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < PAGE) break
    from += PAGE
  }
  const uniq = (arr: (string | null | undefined)[]) =>
    [...new Set(arr.filter((x): x is string => !!x))].sort()
  return {
    brands:    uniq(rows.map((r) => r.brand)),
    origins:   uniq(rows.map((r) => r.origin)),
    emissions: [
      'U.S. EPA',
      'Euro Stage',
      ...uniq(
        rows.flatMap((r) =>
          r.emissions_standard ? emissionComponents(r.emissions_standard) : []
        )
      ).filter((v) => v !== 'U.S. EPA' && v !== 'Euro Stage'),
    ],
    configs:   uniq(rows.map((r) => r.configuration)),
    // Most common fuels first (Diesel, Natural Gas), then the rest alphabetically.
    // Alias variants collapse into canonical labels, so CNG/LNG appears as Natural Gas
    // and LPG appears as Propane (LPG).
    fuelTypes: (() => {
      const pref = ['Diesel', 'Natural Gas']
      const list = [...new Set(
        uniq(rows.map((r) => r.fuel_type)).map(canonicalFuelType),
      )]
      return [
        ...pref.filter((f) => list.includes(f)),
        ...list.filter((f) => !pref.includes(f)),
      ]
    })(),
  }
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const { data, error } = await supabase.rpc('engine_filter_options')
  if (!error && isFilterOptions(data)) return data

  // Local/dev databases may not have the performance RPC applied yet.
  return getFilterOptionsByScan()
}

export async function getAllEngines(): Promise<Engine[]> {
  return filterEngines({})
}

export async function getAllEnginesForCompare(): Promise<Engine[]> {
  const PAGE = 1000
  const all: Engine[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('engines')
      .select(ENGINE_COMPARE_SELECT)
      .order('brand')
      .order('model')
      .range(from, from + PAGE - 1)
    if (error) throw error
    all.push(...((data ?? []) as unknown as Engine[]))
    if (!data || data.length < PAGE) break
    from += PAGE
  }
  return all
}

// Memoized for the request: generateMetadata, the page body, and the OG image route all
// call this for the same slug — cache() collapses those into a single Supabase round-trip.
export const getEngineBySlug = cache(async (slug: string): Promise<Engine | null> => {
  const { data, error } = await supabase
    .from('engines')
    .select('*, pdfs:engine_pdfs(*)')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
})

// Other engines from the same brand for internal linking, with same-series models first.
export async function getRelatedEngines(engine: Engine, limit = 6): Promise<Engine[]> {
  const siblings = await getEnginesByBrand(engine.brand)
  return siblings
    .filter((e) => e.slug !== engine.slug)
    .sort((a, b) => {
      const aSeries = a.series && a.series === engine.series ? 0 : 1
      const bSeries = b.series && b.series === engine.series ? 0 : 1
      if (aSeries !== bSeries) return aSeries - bSeries
      return a.model.localeCompare(b.model)
    })
    .slice(0, limit)
}

// Resolve a lowercase URL slug (e.g. "vm motori") back to the stored brand casing
// ("VM Motori") for titles/headings. ilike is a case-insensitive exact match here (no wildcards).
export const getBrandDisplayName = cache(async (slug: string): Promise<string | null> => {
  const { data } = await supabase.from('engines').select('brand').ilike('brand', slug).limit(1)
  return data?.[0]?.brand ?? null
})

export async function getEnginesByBrand(brand: string): Promise<Engine[]> {
  const { data, error } = await supabase
    .from('engines')
    .select(ENGINE_HUB_SELECT)
    .ilike('brand', brand)
    .order('model', { ascending: true })
  if (error) throw error
  return (data ?? []) as unknown as Engine[]
}

export interface DbStats {
  total: number
  brandCount: number
  originCount: number
}

export interface EngineSitemapEntry {
  slug: string
  status: Engine['status']
  updated_at: string
}

export interface BrandCount {
  brand: string
  total: number
  active: number
}

export async function getDbStats(): Promise<DbStats> {
  const [{ count, error }, options] = await Promise.all([
    supabase.from('engines').select('id', { count: 'exact', head: true }),
    getFilterOptions(),
  ])
  if (error) throw error
  return {
    total: count ?? 0,
    brandCount: options.brands.length,
    originCount: options.origins.length,
  }
}

export async function getAllEngineSlugs(): Promise<string[]> {
  const PAGE = 1000
  const all: { slug: string }[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('engines')
      .select('slug')
      .order('slug', { ascending: true })
      .range(from, from + PAGE - 1)
    if (error) throw error
    all.push(...(data ?? []))
    if (!data || data.length < PAGE) break
    from += PAGE
  }
  return all.map((row) => row.slug)
}

export async function getEngineSitemapEntries(): Promise<EngineSitemapEntry[]> {
  const PAGE = 1000
  const all: EngineSitemapEntry[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('engines')
      .select('slug, status, updated_at')
      .order('slug', { ascending: true })
      .range(from, from + PAGE - 1)
    if (error) throw error
    all.push(...((data ?? []) as EngineSitemapEntry[]))
    if (!data || data.length < PAGE) break
    from += PAGE
  }
  return all
}

export async function getBrandCounts(): Promise<BrandCount[]> {
  const PAGE = 1000
  const all: { brand: string | null; status: Engine['status'] | null }[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('engines')
      .select('brand, status')
      .order('brand', { ascending: true })
      .range(from, from + PAGE - 1)
    if (error) throw error
    all.push(...((data ?? []) as { brand: string | null; status: Engine['status'] | null }[]))
    if (!data || data.length < PAGE) break
    from += PAGE
  }

  const counts = new Map<string, BrandCount>()
  for (const row of all) {
    if (!row.brand) continue
    const current = counts.get(row.brand) ?? { brand: row.brand, total: 0, active: 0 }
    current.total += 1
    if (row.status === 'active') current.active += 1
    counts.set(row.brand, current)
  }
  return [...counts.values()].sort((a, b) => a.brand.localeCompare(b.brand))
}

export async function getAllBrands(): Promise<string[]> {
  // Paginate past the 1000-row PostgREST cap, otherwise late-alphabet brands
  // (ordered by brand) beyond row 1000 are dropped.
  const PAGE = 1000
  const all: { brand: string | null }[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('engines')
      .select('brand')
      .order('brand', { ascending: true })
      .range(from, from + PAGE - 1)
    if (error) throw error
    all.push(...(data ?? []))
    if (!data || data.length < PAGE) break
    from += PAGE
  }
  return [...new Set(all.map((r) => r.brand).filter((b): b is string => !!b))]
}

export async function searchEngines(query: string): Promise<Engine[]> {
  return filterEngines({ q: query })
}

// Spec-sheet PDFs are served under our own domain (/specsheets/...) and proxied to
// Supabase storage by a rewrite in next.config — so the link, branding and any SEO
// equity stay on engines.haifengmachinery.com rather than the Supabase host.
export function getPDFUrl(storagePath: string): string {
  const safe = storagePath.split('/').map(encodeURIComponent).join('/')
  return `/specsheets/${safe}`
}

// Distinct spec-sheet PDF paths (many range datasheets are shared across engines),
// each with the latest link date — used to list the masked /specsheets URLs in the sitemap.
export async function getAllPdfPaths(): Promise<{ path: string; updatedAt: string }[]> {
  const PAGE = 1000
  const latest = new Map<string, string>()
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('engine_pdfs')
      .select('storage_path, created_at')
      .range(from, from + PAGE - 1)
    if (error) throw error
    for (const r of data ?? []) {
      const prev = latest.get(r.storage_path)
      if (!prev || r.created_at > prev) latest.set(r.storage_path, r.created_at)
    }
    if (!data || data.length < PAGE) break
    from += PAGE
  }
  return [...latest].map(([path, updatedAt]) => ({ path, updatedAt }))
}
