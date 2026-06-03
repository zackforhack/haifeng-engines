'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { AlternatorFilterOptions } from '@/lib/alternators'

interface Props {
  options: AlternatorFilterOptions
  totalCount: number
}

export function AlternatorFilters({ options, totalCount }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const get = (k: string) => searchParams.get(k) ?? ''
  const q       = get('q')
  const brand   = get('brand')
  const series  = get('series')
  const poles   = get('poles')
  const minKva  = get('min_kva')
  const maxKva  = get('max_kva')
  const sort    = get('sort')

  const activeCount = [brand, series, poles, minKva, maxKva].filter(Boolean).length

  function update(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (value) p.set(key, value)
    else p.delete(key)
    p.delete('page')
    router.replace(`${pathname}?${p.toString()}`)
  }

  function clearAll() {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    router.replace(`${pathname}${p.size ? '?' + p.toString() : ''}`)
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <div className="grid grid-cols-3 gap-3 mb-3">
        {/* Brand */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Brand</label>
          <select value={brand} onChange={(e) => update('brand', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none">
            <option value="">All Brands</option>
            {options.brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        {/* Series */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Series</label>
          <select value={series} onChange={(e) => update('series', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none">
            <option value="">All Series</option>
            {options.series.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {/* Poles */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Poles</label>
          <select value={poles} onChange={(e) => update('poles', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none">
            <option value="">All</option>
            {options.poles.map((p) => <option key={p} value={p}>{p}-pole</option>)}
          </select>
        </div>
      </div>

      {/* kVA range + sort + meta row */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">kVA Range</p>
          <div className="flex items-center gap-1.5">
            <input type="number" placeholder="Min" value={minKva}
              onChange={(e) => update('min_kva', e.target.value)}
              className="w-20 px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              min={0} />
            <span className="text-xs text-gray-400">–</span>
            <input type="number" placeholder="Max" value={maxKva}
              onChange={(e) => update('max_kva', e.target.value)}
              className="w-20 px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              min={0} />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <select value={sort} onChange={(e) => update('sort', e.target.value)}
            className="text-xs px-2 py-1.5 border border-gray-300 rounded bg-white text-gray-700 focus:ring-1 focus:ring-blue-500 focus:outline-none">
            <option value="">Sort: Brand A → Z</option>
            <option value="kva_desc">Sort: kVA high → low</option>
            <option value="kva_asc">Sort: kVA low → high</option>
          </select>
          {activeCount > 0 && (
            <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
              Clear all
            </button>
          )}
          <span className="text-sm text-gray-400 whitespace-nowrap">
            {totalCount.toLocaleString()} alternator{totalCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
