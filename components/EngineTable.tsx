import Link from 'next/link'
import type { Engine } from '@/lib/types'

const KWE_RANGES = [
  { label: '< 100 kWe',         min: 0,    max: 99 },
  { label: '100 – 299 kWe',     min: 100,  max: 299 },
  { label: '300 – 599 kWe',     min: 300,  max: 599 },
  { label: '600 – 999 kWe',     min: 600,  max: 999 },
  { label: '1,000 – 1,999 kWe', min: 1000, max: 1999 },
  { label: '2,000+ kWe',        min: 2000, max: Infinity },
]

function representativeKwe(e: Engine): number | null {
  return (
    e.standby_power_kwe_50hz ??
    e.prime_power_kwe_50hz ??
    e.standby_power_kwe_60hz ??
    e.prime_power_kwe_60hz ??
    null
  )
}

function rangeIndex(e: Engine): number {
  const k = representativeKwe(e)
  if (k === null) return -1
  return KWE_RANGES.findIndex((r) => k >= r.min && k <= r.max)
}

function EmissionsBadge({ value }: { value: string }) {
  let cls = 'bg-gray-100 text-gray-600'
  if (value.includes('U.S. EPA') || value.includes('EPA'))
    cls = 'bg-blue-50 text-blue-700'
  else if (value.includes('Euro Stage'))
    cls = 'bg-green-50 text-green-700'
  else if (value.includes('China'))
    cls = 'bg-red-50 text-red-700'
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium leading-tight ${cls}`}>
      {value}
    </span>
  )
}

interface Props {
  engines: Engine[]
}

export function EngineTable({ engines }: Props) {
  const brands = [
    ...new Set(engines.map((e) => e.brand).filter((b): b is string => !!b)),
  ].sort()

  const lookup: Map<string, Engine[]>[] = KWE_RANGES.map(() => new Map())
  for (const e of engines) {
    const ri = rangeIndex(e)
    if (ri < 0 || !e.brand) continue
    const m = lookup[ri]
    if (!m.has(e.brand)) m.set(e.brand, [])
    m.get(e.brand)!.push(e)
  }

  const activeRanges = KWE_RANGES.map((r, i) => ({ ...r, i })).filter(
    ({ i }) => brands.some((b) => (lookup[i].get(b)?.length ?? 0) > 0)
  )

  if (activeRanges.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        No power ratings available for the selected engines.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="text-sm border-collapse w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-200 whitespace-nowrap min-w-[160px]">
              Power Range
            </th>
            {brands.map((brand) => (
              <th key={brand} className="px-3 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-200 whitespace-nowrap min-w-[180px]">
                {brand}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activeRanges.map(({ label, i }, rowIdx) => (
            <tr key={label} className="border-b border-gray-100 last:border-0">
              {/* Range label */}
              <td
                className="sticky left-0 z-10 px-4 py-3 font-semibold text-xs text-blue-700 border-r border-gray-200 align-top whitespace-nowrap"
                style={{ background: rowIdx % 2 === 0 ? 'white' : '#f9fafb' }}
              >
                {label}
              </td>

              {brands.map((brand) => {
                const cells = lookup[i].get(brand) ?? []
                return (
                  <td
                    key={brand}
                    className="px-2 py-2 border-r border-gray-100 align-top"
                    style={{ background: rowIdx % 2 === 0 ? 'white' : '#f9fafb' }}
                  >
                    {cells.length === 0 ? null : (
                      <div className="flex flex-col gap-1.5">
                        {[...cells].sort((a, b) => (representativeKwe(a) ?? 0) - (representativeKwe(b) ?? 0)).map((e) => (
                          <Link
                            key={e.id}
                            href={`/engines/${e.slug}`}
                            className="flex items-start justify-between gap-3 rounded-md border border-gray-200 bg-white px-2.5 py-2 hover:border-blue-400 hover:shadow-sm transition-all"
                          >
                            {/* Model name — left */}
                            <p className="font-semibold text-gray-900 text-xs leading-snug shrink-0">
                              {e.model}
                            </p>

                            {/* Specs — right, aligned */}
                            <div className="flex flex-col items-end gap-0.5 min-w-0">
                              {(e.standby_power_kwe_50hz || e.prime_power_kwe_50hz) && (
                                <p className="text-[11px] text-gray-500 whitespace-nowrap">
                                  <span className="text-gray-400">50Hz </span>
                                  {e.standby_power_kwe_50hz && (
                                    <span className="font-medium text-gray-700">{e.standby_power_kwe_50hz}</span>
                                  )}
                                  {e.standby_power_kwe_50hz && e.prime_power_kwe_50hz && (
                                    <span className="text-gray-300 mx-0.5">/</span>
                                  )}
                                  {e.prime_power_kwe_50hz && (
                                    <span className="text-gray-500">{e.prime_power_kwe_50hz}</span>
                                  )}
                                  <span className="text-gray-400"> kWe</span>
                                </p>
                              )}
                              {(e.standby_power_kwe_60hz || e.prime_power_kwe_60hz) && (
                                <p className="text-[11px] text-gray-500 whitespace-nowrap">
                                  <span className="text-gray-400">60Hz </span>
                                  {e.standby_power_kwe_60hz && (
                                    <span className="font-medium text-gray-700">{e.standby_power_kwe_60hz}</span>
                                  )}
                                  {e.standby_power_kwe_60hz && e.prime_power_kwe_60hz && (
                                    <span className="text-gray-300 mx-0.5">/</span>
                                  )}
                                  {e.prime_power_kwe_60hz && (
                                    <span className="text-gray-500">{e.prime_power_kwe_60hz}</span>
                                  )}
                                  <span className="text-gray-400"> kWe</span>
                                </p>
                              )}
                              {e.emissions_standard && (
                                <EmissionsBadge value={e.emissions_standard} />
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center gap-4 text-[11px] text-gray-400">
        <span>Standby / Prime kWe</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-sm bg-blue-100 border border-blue-300" />U.S. EPA
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-sm bg-green-100 border border-green-300" />Euro Stage
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-sm bg-red-100 border border-red-300" />China
        </span>
      </div>
    </div>
  )
}
