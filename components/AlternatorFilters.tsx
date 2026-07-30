'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { RotateCcw } from 'lucide-react'
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
    <div className="mb-4 border-y border-gray-900 bg-white py-4">
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Brand */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Brand</label>
          <select value={brand} onChange={(e) => update('brand', e.target.value)}
            className="h-10 w-full border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none">
            <option value="">All Brands</option>
            {options.brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        {/* Series */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Series</label>
          <select value={series} onChange={(e) => update('series', e.target.value)}
            className="h-10 w-full border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none">
            <option value="">All Series</option>
            {options.series.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {/* Poles */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Poles</label>
          <select value={poles} onChange={(e) => update('poles', e.target.value)}
            className="h-10 w-full border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none">
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
              className="h-9 w-24 border border-gray-300 bg-white px-2 text-xs focus:border-blue-500 focus:outline-none"
              min={0} />
            <span className="text-xs text-gray-400">–</span>
            <input type="number" placeholder="Max" value={maxKva}
              onChange={(e) => update('max_kva', e.target.value)}
              className="h-9 w-24 border border-gray-300 bg-white px-2 text-xs focus:border-blue-500 focus:outline-none"
              min={0} />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <select value={sort} onChange={(e) => update('sort', e.target.value)}
            className="h-9 border border-gray-300 bg-white px-3 text-xs text-gray-700 focus:border-blue-500 focus:outline-none">
            <option value="">Sort: Brand A → Z</option>
            <option value="kva_desc">Sort: kVA high → low</option>
            <option value="kva_asc">Sort: kVA low → high</option>
          </select>
          {activeCount > 0 && (
            <button onClick={clearAll} className="inline-flex h-9 items-center gap-2 border border-gray-300 px-3 text-xs font-bold text-gray-600 hover:border-blue-500 hover:text-blue-700">
              <RotateCcw aria-hidden="true" size={13} /> Reset
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
