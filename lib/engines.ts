import { supabase } from './supabase'
import type { Engine } from './types'

export interface FilterParams {
  q?: string
  brand?: string
  origin?: string
  emissions?: string
  config?: string
  hz?: '50' | '60'
  status?: string
  min_kwe?: number
  max_kwe?: number
  sort?: string
}

export interface FilterOptions {
  brands: string[]
  origins: string[]
  emissions: string[]
  configs: string[]
}

function representativeKwe(e: Engine): number | null {
  return (
    e.standby_power_kwe_50hz ??
    e.prime_power_kwe_50hz ??
    e.standby_power_kwe_60hz ??
    e.prime_power_kwe_60hz ??
    null
  )
}

export async function filterEngines(params: FilterParams): Promise<Engine[]> {
  const PAGE = 1000
  const all: Engine[] = []
  let from = 0

  while (true) {
    let q = supabase
      .from('engines')
      .select('*, pdfs:engine_pdfs(*)')

    if (params.q) {
      q = q.or(
        `brand.ilike.%${params.q}%,model.ilike.%${params.q}%,series.ilike.%${params.q}%`
      )
    }
    if (params.brand)     q = q.eq('brand', params.brand)
    if (params.origin)    q = q.eq('origin', params.origin)
    if (params.emissions) q = q.eq('emissions_standard', params.emissions)
    if (params.config)    q = q.eq('configuration', params.config)
    if (params.status)    q = q.eq('status', params.status)

    if (params.hz === '50') {
      q = q.or('prime_power_kwe_50hz.not.is.null,standby_power_kwe_50hz.not.is.null')
    } else if (params.hz === '60') {
      q = q.or('prime_power_kwe_60hz.not.is.null,standby_power_kwe_60hz.not.is.null')
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

    const { data, error } = await q.range(from, from + PAGE - 1)
    if (error) throw error
    all.push(...(data ?? []))
    if (!data || data.length < PAGE) break
    from += PAGE
  }

  // Power range filter (post-fetch — too complex for PostgREST OR across 4 columns)
  let result = all
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

export async function getFilterOptions(): Promise<FilterOptions> {
  const { data, error } = await supabase
    .from('engines')
    .select('brand, origin, emissions_standard, configuration')
  if (error) throw error
  const rows = data ?? []
  const uniq = (arr: (string | null | undefined)[]) =>
    [...new Set(arr.filter((x): x is string => !!x))].sort()
  return {
    brands:    uniq(rows.map((r) => r.brand)),
    origins:   uniq(rows.map((r) => r.origin)),
    emissions: uniq(rows.map((r) => r.emissions_standard)),
    configs:   uniq(rows.map((r) => r.configuration)),
  }
}

export async function getAllEngines(): Promise<Engine[]> {
  return filterEngines({})
}

export async function getEngineBySlug(slug: string): Promise<Engine | null> {
  const { data, error } = await supabase
    .from('engines')
    .select('*, pdfs:engine_pdfs(*)')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

export async function getEnginesByBrand(brand: string): Promise<Engine[]> {
  const { data, error } = await supabase
    .from('engines')
    .select('*, pdfs:engine_pdfs(*)')
    .ilike('brand', brand)
    .order('model', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getAllBrands(): Promise<string[]> {
  const { data, error } = await supabase
    .from('engines')
    .select('brand')
    .order('brand', { ascending: true })
  if (error) throw error
  return [...new Set((data ?? []).map((r) => r.brand))]
}

export async function searchEngines(query: string): Promise<Engine[]> {
  return filterEngines({ q: query })
}

export function getPDFUrl(storagePath: string): string {
  const { data } = supabase.storage.from('engine-pdfs').getPublicUrl(storagePath)
  return data.publicUrl
}
