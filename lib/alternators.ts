import { catalogNumber, catalogPage, catalogSearchPattern } from './catalog-params'
import { supabase } from './supabase'
import type { Alternator } from './types'

export interface AlternatorFilterParams {
  q?: string
  brand?: string
  series?: string
  poles?: string
  min_kva?: number
  max_kva?: number
  sort?: string
}

export interface AlternatorFilterOptions {
  brands: string[]
  series: string[]
  poles: string[]
}

function validAlternatorFilters(params: AlternatorFilterParams): boolean {
  if (params.poles !== undefined && catalogNumber(params.poles, true) === undefined) return false
  for (const value of [params.min_kva, params.max_kva]) {
    if (value !== undefined && catalogNumber(value) === undefined) return false
  }
  return params.min_kva === undefined || params.max_kva === undefined || params.min_kva <= params.max_kva
}

function alternatorQuery(params: AlternatorFilterParams, count?: 'exact') {
  let query = supabase.from('alternators').select('*', count ? { count } : undefined)
  if (params.q) {
    const term = catalogSearchPattern(params.q)
    query = query.or(`brand.ilike.${term},model.ilike.${term},series.ilike.${term}`)
  }
  if (params.brand) query = query.eq('brand', params.brand)
  if (params.series) query = query.eq('series', params.series)
  if (params.poles !== undefined) query = query.eq('poles', catalogNumber(params.poles, true)!)
  if (params.min_kva !== undefined) query = query.gte('kva', params.min_kva)
  if (params.max_kva !== undefined) query = query.lte('kva', params.max_kva)

  if (params.sort === 'kva_asc' || params.sort === 'kva_desc') {
    query = query.order('kva', { ascending: params.sort === 'kva_asc', nullsFirst: false })
  }
  return query.order('brand').order('model').order('id')
}

export interface AlternatorPageResult {
  alternators: Alternator[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function searchAlternatorsPage(
  params: AlternatorFilterParams,
  { page = 1, pageSize = 24 }: { page?: number; pageSize?: number } = {},
): Promise<AlternatorPageResult> {
  const size = Number.isSafeInteger(pageSize) && pageSize > 0 ? Math.min(pageSize, 100) : 24
  let targetPage = catalogPage(page, size)
  if (!validAlternatorFilters(params)) {
    return { alternators: [], total: 0, page: 1, pageSize: size, totalPages: 1 }
  }
  async function run(target: number) {
    const from = (target - 1) * size
    const { data, error, count } = await alternatorQuery(params, 'exact').range(from, from + size - 1)
    if (error) throw error
    return { data: (data ?? []) as Alternator[], count: count ?? 0 }
  }
  let result
  let fetchedPage = targetPage
  try {
    result = await run(targetPage)
  } catch (error) {
    if (targetPage === 1 || (error as { code?: string }).code !== 'PGRST103') throw error
    result = await run(1)
    fetchedPage = 1
  }
  const lastPage = Math.max(1, Math.ceil(result.count / size))
  targetPage = Math.min(targetPage, lastPage)
  if (targetPage !== fetchedPage) {
    try {
      result = await run(targetPage)
    } catch (error) {
      if ((error as { code?: string }).code !== 'PGRST103') throw error
      targetPage = 1
      result = await run(1)
    }
  }

  return {
    alternators: result.data,
    total: result.count,
    page: targetPage,
    pageSize: size,
    totalPages: Math.max(1, Math.ceil(result.count / size)),
  }
}

// Series pages intentionally show a complete family; catalog browsing uses
// searchAlternatorsPage so a visit transfers only the requested page of rows.
export async function filterAlternators(params: AlternatorFilterParams): Promise<Alternator[]> {
  if (!validAlternatorFilters(params)) return []
  const PAGE = 1000
  const all: Alternator[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await alternatorQuery(params).range(from, from + PAGE - 1)
    if (error) throw error
    all.push(...(data ?? []))
    if (!data || data.length < PAGE) return all
  }
}

export async function getFeaturedAlternators(): Promise<Alternator[]> {
  const landmarkSlug = 'stamford-uci224g'
  const [landmark, others] = await Promise.all([
    supabase.from('alternators').select('*').eq('brand', 'Stamford').eq('slug', landmarkSlug).maybeSingle(),
    alternatorQuery({ brand: 'Stamford' }).neq('slug', landmarkSlug).limit(5),
  ])
  if (landmark.error) throw landmark.error
  if (others.error) throw others.error
  return [...(landmark.data ? [landmark.data as Alternator] : []), ...((others.data ?? []) as Alternator[])]
}

export async function getAlternatorFilterOptions(): Promise<AlternatorFilterOptions> {
  const { data, error } = await supabase.from('alternators').select('brand, series, poles')
  if (error) throw error
  const rows = data ?? []
  const uniqStr = (arr: (string | null | undefined)[]) =>
    [...new Set(arr.filter((x): x is string => !!x))].sort()
  return {
    brands: uniqStr(rows.map((r) => r.brand)),
    series: uniqStr(rows.map((r) => r.series)),
    poles:  [...new Set(rows.map((r) => r.poles).filter((p): p is number => p != null))]
      .sort((a, b) => a - b)
      .map(String),
  }
}

export async function getAllAlternators(): Promise<Alternator[]> {
  const PAGE = 1000
  const all: Alternator[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('alternators')
      .select('slug, updated_at, status')
      .order('brand').order('model')
      .range(from, from + PAGE - 1)
    if (error) throw error
    all.push(...((data ?? []) as Alternator[]))
    if (!data || data.length < PAGE) break
    from += PAGE
  }
  return all
}

export async function getAlternatorBySlug(slug: string): Promise<Alternator | null> {
  const { data, error } = await supabase
    .from('alternators')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}
