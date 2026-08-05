'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Filter, RotateCcw } from 'lucide-react'
import type { FilterOptions } from '@/lib/engines'

interface Props {
  options: FilterOptions
}

export function EngineFilters({ options }: Props) {
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
  const activeCount = [brand, origin, emissions, config, fuel, fuelType, hz, status].filter(Boolean).length
  const [open, setOpen] = useState(activeCount > 0)

  function update(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (value) p.set(key, value)
    else p.delete(key)
    p.delete('page')
    const qs = p.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  // The broad Fuel toggle (Diesel/Gas) and the granular Fuel Type dropdown target the same
  // column, so setting one clears the other to avoid contradictory (empty-result) combinations.
  function setFuel(value: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (value) p.set('fuel', value)
    else p.delete('fuel')
    p.delete('fuel_type')
    p.delete('page')
    const qs = p.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  function setFuelType(value: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (value) p.set('fuel_type', value)
    else p.delete('fuel_type')
    p.delete('fuel')
    p.delete('page')
    const qs = p.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  function clearAll() {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    router.replace(`${pathname}${p.size ? '?' + p.toString() : ''}`, { scroll: false })
  }

  return (
    <aside className="mb-6 xl:sticky xl:top-24 xl:mb-0 xl:self-start">
      <div className="border-y border-gray-900 bg-white">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex min-h-10 items-center gap-2 text-sm font-bold text-gray-900 transition-colors hover:text-blue-600 xl:pointer-events-none"
          >
            <Filter aria-hidden="true" className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <span className="bg-blue-600 px-1.5 py-0.5 text-xs font-bold leading-none text-white">
                {activeCount}
              </span>
            )}
          </button>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="flex min-h-8 items-center gap-1.5 text-xs font-bold text-blue-700 transition-colors hover:text-blue-900"
            >
              <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>

        <div className={`${open ? 'block' : 'hidden'} border-t border-gray-200 px-4 py-4 xl:block`}>
          <div className="space-y-6">
            <fieldset>
              <legend className="mb-3 text-xs font-bold uppercase text-gray-500">Quick filters</legend>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <FilterToggle label="Fuel">
                  <ToggleGroup
                    value={fuel}
                    options={[['', 'All'], ['diesel', 'Diesel'], ['gas', 'Gas']]}
                    onSelect={(v) => setFuel(v)}
                  />
                </FilterToggle>
                <FilterToggle label="Frequency">
                  <ToggleGroup
                    value={hz}
                    options={[['', 'Any'], ['50', '50 Hz'], ['60', '60 Hz']]}
                    onSelect={(v) => update('hz', v)}
                  />
                </FilterToggle>
                <FilterChoice
                  label="Status"
                  value={status}
                  options={[['', 'All production statuses'], ['active', 'Active'], ['discontinued', 'Discontinued'], ['limited', 'Limited']]}
                  onSelect={(v) => update('status', v)}
                />
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-xs font-bold uppercase text-gray-500">Refine by specs</legend>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <FilterSelect label="Brand"         param="brand"     value={brand}     options={options.brands}    onUpdate={update} />
                <FilterSelect label="Emissions"     param="emissions" value={emissions} options={options.emissions} onUpdate={update} />
                <FilterSelect label="Configuration" param="config"    value={config}    options={options.configs}   onUpdate={update} />
                <FilterSelect label="Origin"        param="origin"    value={origin}    options={options.origins}   onUpdate={update} />
                <FilterSelect
                  label="Exact fuel"
                  param="fuel_type"
                  value={fuelType}
                  options={options.fuelTypes}
                  allLabel="All fuel types"
                  onUpdate={(_, v) => setFuelType(v)}
                />
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </aside>
  )
}

function FilterSelect({
  label, param, value, options, onUpdate, allLabel,
}: {
  label: string
  param: string
  value: string
  options: string[]
  onUpdate: (k: string, v: string) => void
  allLabel?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-gray-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onUpdate(param, e.target.value)}
        className="h-9 w-full border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 focus:border-blue-600 focus:outline-none"
      >
        <option value="">{allLabel ?? `All ${label}${label.endsWith('s') ? '' : 's'}`}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

function FilterChoice({
  label, value, options, onSelect,
}: {
  label: string
  value: string
  options: [string, string][]
  onSelect: (v: string) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-gray-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onSelect(e.target.value)}
        className="h-9 w-full border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 focus:border-blue-600 focus:outline-none"
      >
        {options.map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>
    </div>
  )
}

function FilterToggle({
  label, children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-bold text-gray-600">{label}</p>
      {children}
    </div>
  )
}

function ToggleGroup({
  value, options, onSelect, columns,
}: {
  value: string
  options: [string, string][]
  onSelect: (v: string) => void
  columns?: 2 | 3 | 4
}) {
  const gridClass = columns === 2
    ? 'grid-cols-2'
    : columns === 4
      ? 'grid-cols-4'
      : 'grid-flow-col auto-cols-fr'

  return (
    <div className={`grid w-full min-w-0 gap-px border border-gray-300 bg-gray-300 ${gridClass}`}>
      {options.map(([val, label]) => (
        <button
          type="button"
          key={val}
          onClick={() => onSelect(val)}
          className={`min-h-9 min-w-0 px-2 text-xs font-bold transition-colors ${
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
