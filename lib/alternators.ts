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

export async function filterAlternators(params: AlternatorFilterParams): Promise<Alternator[]> {
  const PAGE = 1000
  const all: Alternator[] = []
  let from = 0

  while (true) {
    let q = supabase.from('alternators').select('*')

    if (params.q) {
      q = q.or(`brand.ilike.%${params.q}%,model.ilike.%${params.q}%,series.ilike.%${params.q}%`)
    }
    if (params.brand)  q = q.eq('brand', params.brand)
    if (params.series) q = q.eq('series', params.series)
    if (params.poles)  q = q.eq('poles', Number(params.poles))

    if (params.sort === 'kva_asc') {
      q = q.order('kva', { ascending: true, nullsFirst: false }).order('brand').order('model')
    } else if (params.sort === 'kva_desc') {
      q = q.order('kva', { ascending: false, nullsFirst: false }).order('brand').order('model')
    } else {
      q = q.order('brand').order('model')
    }

    const { data, error } = await q.range(from, from + PAGE - 1)
    if (error) throw error
    all.push(...(data ?? []))
    if (!data || data.length < PAGE) break
    from += PAGE
  }

  let result = all

  if (params.min_kva != null || params.max_kva != null) {
    result = result.filter((a) => {
      if (a.kva == null) return false
      if (params.min_kva != null && a.kva < params.min_kva) return false
      if (params.max_kva != null && a.kva > params.max_kva) return false
      return true
    })
  }

  return result
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
