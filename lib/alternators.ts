import { supabase } from './supabase'
import type { Alternator } from './types'

export interface AlternatorFilterParams {
  q?: string
  brand?: string
  excitation?: string
  poles?: string
  ip?: string
  min_kva?: number
  max_kva?: number
  sort?: string
}

export interface AlternatorFilterOptions {
  brands: string[]
  excitations: string[]
  poles: string[]
  ips: string[]
}

function representativeKva(a: Alternator): number | null {
  return (
    a.prime_kva_50hz ??
    a.standby_kva_50hz ??
    a.prime_kva_60hz ??
    a.standby_kva_60hz ??
    null
  )
}

export async function filterAlternators(params: AlternatorFilterParams): Promise<Alternator[]> {
  const PAGE = 1000
  const all: Alternator[] = []
  let from = 0

  while (true) {
    let q = supabase.from('alternators').select('*')

    if (params.q) {
      q = q.or(`brand.ilike.%${params.q}%,model.ilike.%${params.q}%,series.ilike.%${params.q}%,frame.ilike.%${params.q}%`)
    }
    if (params.brand)     q = q.eq('brand', params.brand)
    if (params.excitation) q = q.eq('excitation_type', params.excitation)
    if (params.ip)        q = q.eq('ip_rating', params.ip)
    if (params.poles)     q = q.eq('poles', Number(params.poles))

    if (params.sort === 'kva_desc') {
      q = q.order('prime_kva_50hz', { ascending: false, nullsFirst: false }).order('brand').order('model')
    } else if (params.sort === 'kva_asc') {
      q = q.order('prime_kva_50hz', { ascending: true, nullsFirst: false }).order('brand').order('model')
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
      const kva = representativeKva(a)
      if (kva === null) return false
      if (params.min_kva != null && kva < params.min_kva) return false
      if (params.max_kva != null && kva > params.max_kva) return false
      return true
    })
  }

  if (params.sort === 'kva_desc') {
    result.sort((a, b) => (representativeKva(b) ?? 0) - (representativeKva(a) ?? 0))
  } else if (params.sort === 'kva_asc') {
    result.sort((a, b) => (representativeKva(a) ?? Infinity) - (representativeKva(b) ?? Infinity))
  }

  return result
}

export async function getAlternatorFilterOptions(): Promise<AlternatorFilterOptions> {
  const { data, error } = await supabase
    .from('alternators')
    .select('brand, excitation_type, poles, ip_rating')
  if (error) throw error
  const rows = data ?? []
  const uniq = (arr: (string | number | null | undefined)[]) =>
    [...new Set(arr.filter((x): x is string => !!x))].sort()
  return {
    brands:     uniq(rows.map((r) => r.brand)),
    excitations: uniq(rows.map((r) => r.excitation_type)),
    poles:      uniq(rows.map((r) => r.poles != null ? String(r.poles) : null)),
    ips:        uniq(rows.map((r) => r.ip_rating)),
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
