export type CatalogSearchParams = Record<string, string | string[] | undefined>

export function catalogPage(value: unknown, pageSize = 100): number {
  const number = typeof value === 'number' ? value :
    typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN
  // Keep the entire database range within the signed integer limit.
  return Number.isSafeInteger(number) && number > 0 &&
    number <= Math.floor(2147483647 / pageSize) ? number : 1
}

export function catalogNumber(value: unknown, integer = false): number | undefined {
  if (typeof value !== 'number' && (typeof value !== 'string' || !/^\d+(?:\.\d+)?$/.test(value))) return undefined
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0 || number > 2147483647) return undefined
  if (integer && (!Number.isInteger(number) || number < 1)) return undefined
  return number
}

export function normalizeCatalogParams(raw: CatalogSearchParams, kind: 'engines' | 'alternators'): Record<string, string | undefined> {
  const params: Record<string, string | undefined> = {}
  for (const [key, value] of Object.entries(raw)) {
    // Match URLSearchParams.get: the first repeated value wins.
    const first = Array.isArray(value) ? value[0] : value
    params[key] = typeof first === 'string' ? first.trim() || undefined : undefined
  }
  if (params.page) params.page = String(catalogPage(params.page))
  if (params.view && !['grid', 'table'].includes(params.view)) delete params.view
  const sorts = kind === 'engines' ? ['kwe_asc', 'kwe_desc', 'disp_asc', 'disp_desc'] : ['kva_asc', 'kva_desc']
  if (params.sort && !sorts.includes(params.sort)) delete params.sort
  if (kind === 'alternators') {
    for (const key of ['poles', 'min_kva', 'max_kva']) {
      if (params[key] === undefined) continue
      const number = catalogNumber(params[key], key === 'poles')
      params[key] = number === undefined ? undefined : String(number)
    }
    if (params.min_kva !== undefined && params.max_kva !== undefined && Number(params.min_kva) > Number(params.max_kva)) {
      [params.min_kva, params.max_kva] = [params.max_kva, params.min_kva]
    }
  }
  return params
}

// Quote PostgREST values as well as escaping LIKE wildcards.
export function catalogSearchPattern(value: string): string {
  return JSON.stringify(`%${value.replace(/[\\%_]/g, '\\$&')}%`)
}

export function catalogParamsHref(path: string, params: Record<string, string | undefined>): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, value)
  }
  return query.size ? `${path}?${query}` : path
}

export function catalogParamsChanged(raw: CatalogSearchParams, normalized: Record<string, string | undefined>): boolean {
  return Object.keys(raw).some((key) => raw[key] !== normalized[key])
}
