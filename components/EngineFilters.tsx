'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState } from 'react'
import { Filter, RotateCcw } from 'lucide-react'
import type { FilterOptions } from '@/lib/engines'

interface Props {
  options: FilterOptions
  totalCount: number
}

export function EngineFilters({ options, totalCount }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const get = (k: string) => searchParams.get(k) ?? ''
  const q         = get('q')
  const brand     = get('brand')
  const origin    = get('origin')
  const emissions = get('emissions')
  const config    = get('config')
  const fuel      = get('fuel')
  const fuelType  = get('fuel_type')
  const hz        = get('hz')
  const status    = get('status')
  const minKwe    = get('min_kwe')
  const maxKwe    = get('max_kwe')
  const sort      = get('sort')

  const activeCount = [brand, origin, emissions, config, fuel, fuelType, hz, minKwe, maxKwe, status].filter(Boolean).length
  const [open, setOpen] = useState(false)

  function update(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (value) p.set(key, value)
    else p.delete(key)
    p.delete('page')
    if (key === 'sort' && value) p.set('view', 'grid')
    router.replace(`${pathname}?${p.toString()}`)
  }

  // The broad Fuel toggle (Diesel/Gas) and the granular Fuel Type dropdown target the same
  // column, so setting one clears the other to avoid contradictory (empty-result) combinations.
  function setFuel(value: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (value) p.set('fuel', value)
    else p.delete('fuel')
    p.delete('fuel_type')
    p.delete('page')
    router.replace(`${pathname}?${p.toString()}`)
  }

  function setFuelType(value: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (value) p.set('fuel_type', value)
    else p.delete('fuel_type')
    p.delete('fuel')
    p.delete('page')
    router.replace(`${pathname}?${p.toString()}`)
  }

  function clearAll() {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    router.replace(`${pathname}${p.size ? '?' + p.toString() : ''}`)
  }

  return (
    <aside className="mb-6 xl:sticky xl:top-24 xl:mb-0 xl:self-start">
      {/* Toolbar row */}
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-t border-gray-900 py-3 sm:flex sm:flex-wrap">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-blue-600 select-none"
        >
          <Filter aria-hidden="true" className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold leading-none">
              {activeCount}
            </span>
          )}
        </button>
        {activeCount > 0 && (
          <button type="button" onClick={clearAll} className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors">
            <RotateCcw aria-hidden="true" className="h-3 w-3" /> Clear
          </button>
        )}
        <div className="col-span-2 flex min-w-0 items-center gap-3 sm:col-span-1 sm:ml-auto xl:ml-0 xl:w-full xl:flex-col xl:items-stretch">
          <select
            value={sort}
            onChange={(e) => update('sort', e.target.value)}
            aria-label="Sort engines"
            className="min-w-0 flex-1 border border-gray-300 bg-white px-2 py-2 text-xs text-gray-700 focus:border-blue-600 focus:outline-none xl:w-full"
          >
            <option value="">Sort: Brand A → Z</option>
            <option value="kwe_desc">Sort: Power high → low</option>
            <option value="kwe_asc">Sort: Power low → high</option>
            <option value="disp_desc">Sort: Displacement high → low</option>
            <option value="disp_asc">Sort: Displacement low → high</option>
          </select>
          <span className="hidden text-sm font-bold text-blue-600 whitespace-nowrap sm:inline xl:block">
            {totalCount.toLocaleString()} engine{totalCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filter panel */}
      <div className={`${open ? 'block' : 'hidden'} border-t border-gray-200 bg-gray-50 py-4 space-y-5 xl:block xl:px-3`}>
          {/* Dropdowns row */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-1 gap-3">
            <FilterSelect label="Brand"         param="brand"     value={brand}     options={options.brands}    onUpdate={update} />
            <FilterSelect label="Origin"        param="origin"    value={origin}    options={options.origins}   onUpdate={update} />
            <FilterSelect label="Emissions"     param="emissions" value={emissions} options={options.emissions} onUpdate={update} />
            <FilterSelect label="Configuration" param="config"    value={config}    options={options.configs}   onUpdate={update} />
            <FilterSelect label="Fuel Type"     param="fuel_type" value={fuelType}  options={options.fuelTypes} onUpdate={(_, v) => setFuelType(v)} />
          </div>

          {/* Toggles + power range row */}
          <div className="flex flex-wrap items-end gap-5 xl:flex-col xl:items-stretch">
            {/* Status */}
            <div className="min-w-0 xl:w-full">
              <p className="text-xs font-medium text-gray-500 mb-1.5">Status</p>
              <ToggleGroup
                value={status}
                options={[['', 'All'], ['active', 'Active'], ['discontinued', 'Disc.'], ['limited', 'Limited']]}
                onSelect={(v) => update('status', v)}
              />
            </div>

            {/* Fuel (broad bucket; mutually exclusive with the Fuel Type dropdown) */}
            <div className="min-w-0 xl:w-full">
              <p className="text-xs font-medium text-gray-500 mb-1.5">Fuel</p>
              <ToggleGroup
                value={fuel}
                options={[['', 'All'], ['diesel', 'Diesel'], ['gas', 'Gas']]}
                onSelect={(v) => setFuel(v)}
              />
            </div>

            {/* Hz */}
            <div className="min-w-0 xl:w-full">
              <p className="text-xs font-medium text-gray-500 mb-1.5">Frequency</p>
              <ToggleGroup
                value={hz}
                options={[['', 'Any'], ['50', '50 Hz'], ['60', '60 Hz']]}
                onSelect={(v) => update('hz', v)}
              />
            </div>

            {/* Power range */}
            <div className="min-w-0 xl:w-full">
              <p className="text-xs font-medium text-gray-500 mb-1.5">Power (kWe)</p>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={minKwe}
                  onChange={(e) => update('min_kwe', e.target.value)}
                  className="min-w-0 flex-1 border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
                  min={0}
                />
                <span className="text-xs text-gray-400">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxKwe}
                  onChange={(e) => update('max_kwe', e.target.value)}
                  className="min-w-0 flex-1 border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
                  min={0}
                />
              </div>
            </div>
          </div>
      </div>
    </aside>
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
        className="w-full border border-gray-300 bg-white px-2 py-2 text-sm text-gray-700 focus:border-blue-600 focus:outline-none"
      >
        <option value="">All {label}{label.endsWith('s') ? '' : 's'}</option>
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
    <div className="grid w-full min-w-0 grid-flow-col auto-cols-fr divide-x divide-gray-300 bg-white outline outline-1 outline-gray-300">
      {options.map(([val, label]) => (
        <button
          type="button"
          key={val}
          onClick={() => onSelect(val)}
          className={`min-w-0 px-1.5 py-1.5 text-xs font-medium ${
            value === val
              ? 'bg-blue-600 text-white'
              : 'bg-white text-blue-700 hover:bg-blue-50'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
