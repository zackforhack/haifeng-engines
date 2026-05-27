'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState } from 'react'
import type { FilterOptions } from '@/lib/engines'

interface Props {
  options: FilterOptions
  totalCount: number
}

export function EngineFilters({ options, totalCount }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(true)

  const get = (k: string) => searchParams.get(k) ?? ''
  const q         = get('q')
  const brand     = get('brand')
  const origin    = get('origin')
  const emissions = get('emissions')
  const config    = get('config')
  const hz        = get('hz')
  const status    = get('status')
  const minKwe    = get('min_kwe')
  const maxKwe    = get('max_kwe')
  const sort      = get('sort')

  const activeCount = [brand, origin, emissions, config, hz, minKwe, maxKwe, status].filter(Boolean).length

  function update(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (value) p.set(key, value)
    else p.delete(key)
    router.replace(`${pathname}?${p.toString()}`)
  }

  function clearAll() {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    router.replace(`${pathname}${p.size ? '?' + p.toString() : ''}`)
  }

  return (
    <div className="mb-6">
      {/* Toolbar row */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 select-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h2" />
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold leading-none">
              {activeCount}
            </span>
          )}
        </button>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
            Clear all
          </button>
        )}
        <div className="ml-auto flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => update('sort', e.target.value)}
            className="text-xs px-2 py-1.5 border border-gray-300 rounded bg-white text-gray-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Sort: Brand A → Z</option>
            <option value="kwe_desc">Sort: Power high → low</option>
            <option value="kwe_asc">Sort: Power low → high</option>
            <option value="disp_desc">Sort: Displacement high → low</option>
            <option value="disp_asc">Sort: Displacement low → high</option>
          </select>
          <span className="text-sm text-gray-400 whitespace-nowrap">
            {totalCount.toLocaleString()} engine{totalCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filter panel */}
      {open && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          {/* Dropdowns row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <FilterSelect label="Brand"         param="brand"     value={brand}     options={options.brands}    onUpdate={update} />
            <FilterSelect label="Origin"        param="origin"    value={origin}    options={options.origins}   onUpdate={update} />
            <FilterSelect label="Emissions"     param="emissions" value={emissions} options={options.emissions} onUpdate={update} />
            <FilterSelect label="Configuration" param="config"    value={config}    options={options.configs}   onUpdate={update} />
          </div>

          {/* Toggles + power range row */}
          <div className="flex flex-wrap items-end gap-5">
            {/* Status */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Status</p>
              <ToggleGroup
                value={status}
                options={[['', 'All'], ['active', 'Active'], ['discontinued', 'Disc.'], ['limited', 'Limited']]}
                onSelect={(v) => update('status', v)}
              />
            </div>

            {/* Hz */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Frequency</p>
              <ToggleGroup
                value={hz}
                options={[['', 'Any'], ['50', '50 Hz'], ['60', '60 Hz']]}
                onSelect={(v) => update('hz', v)}
              />
            </div>

            {/* Power range */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Power (kWe)</p>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={minKwe}
                  onChange={(e) => update('min_kwe', e.target.value)}
                  className="w-20 px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  min={0}
                />
                <span className="text-xs text-gray-400">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxKwe}
                  onChange={(e) => update('max_kwe', e.target.value)}
                  className="w-20 px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  min={0}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterSelect({
  label, param, value, options, onUpdate,
}: {
  label: string
  param: string
  value: string
  options: string[]
  onUpdate: (k: string, v: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onUpdate(param, e.target.value)}
        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      >
        <option value="">All {label}s</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

function ToggleGroup({
  value, options, onSelect,
}: {
  value: string
  options: [string, string][]
  onSelect: (v: string) => void
}) {
  return (
    <div className="flex gap-1">
      {options.map(([val, label]) => (
        <button
          key={val}
          onClick={() => onSelect(val)}
          className={`px-2.5 py-1 text-xs rounded-full border font-medium transition-colors ${
            value === val
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
