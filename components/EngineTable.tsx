import Link from 'next/link'
import type { Engine } from '@/lib/types'

const KWE_RANGES = [
  { label: '< 100 kWe',          min: 0,    max: 99 },
  { label: '100 – 299 kWe',      min: 100,  max: 299 },
  { label: '300 – 599 kWe',      min: 300,  max: 599 },
  { label: '600 – 999 kWe',      min: 600,  max: 999 },
  { label: '1,000 – 1,999 kWe',  min: 1000, max: 1999 },
  { label: '2,000+ kWe',         min: 2000, max: Infinity },
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

interface Props {
  engines: Engine[]
}

export function EngineTable({ engines }: Props) {
  const brands = [
    ...new Set(engines.map((e) => e.brand).filter((b): b is string => !!b)),
  ].sort()

  // lookup[rangeIdx][brand] = Engine[]
  const lookup: Map<string, Engine[]>[] = KWE_RANGES.map(() => new Map())
  for (const e of engines) {
    const ri = rangeIndex(e)
    if (ri < 0 || !e.brand) continue
    const brandMap = lookup[ri]
    if (!brandMap.has(e.brand)) brandMap.set(e.brand, [])
    brandMap.get(e.brand)!.push(e)
  }

  // Only render ranges that have at least one engine
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
      <table className="text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="sticky left-0 z-10 bg-gray-50 px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-r border-gray-200 whitespace-nowrap min-w-[150px]">
              Power Range
            </th>
            {brands.map((brand) => (
              <th
                key={brand}
                className="px-3 py-2.5 text-center text-xs font-semibold text-gray-700 border-b border-r border-gray-200 whitespace-nowrap"
              >
                {brand}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activeRanges.map(({ label, i }, rowIdx) => (
            <tr key={label} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
              {/* Range label */}
              <td
                className="sticky left-0 z-10 px-3 py-2 font-semibold text-xs text-blue-700 border-r border-gray-200 whitespace-nowrap align-top"
                style={{ background: rowIdx % 2 === 0 ? 'white' : 'rgb(249 250 251 / 0.6)' }}
              >
                {label}
              </td>

              {brands.map((brand) => {
                const cells = lookup[i].get(brand) ?? []
                return (
                  <td key={brand} className="px-2 py-1.5 border-r border-gray-100 align-top min-w-[160px] max-w-[220px]">
                    {cells.length === 0 ? (
                      <span className="text-gray-200 select-none">·</span>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {cells.map((e) => (
                          <Link
                            key={e.id}
                            href={`/engines/${e.slug}`}
                            className="block group rounded px-1.5 py-1 hover:bg-blue-50 transition-colors"
                          >
                            <p className="font-semibold text-blue-700 group-hover:text-blue-900 text-xs whitespace-nowrap">
                              {e.model}
                            </p>

                            {/* 50 Hz row */}
                            {(e.standby_power_kwe_50hz || e.prime_power_kwe_50hz) && (
                              <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">
                                <span className="text-gray-400">50Hz </span>
                                {e.standby_power_kwe_50hz && (
                                  <span>{e.standby_power_kwe_50hz}<span className="text-gray-400">s</span> </span>
                                )}
                                {e.prime_power_kwe_50hz && (
                                  <span>{e.prime_power_kwe_50hz}<span className="text-gray-400">p</span></span>
                                )}
                                <span className="text-gray-400"> kWe</span>
                              </p>
                            )}

                            {/* 60 Hz row */}
                            {(e.standby_power_kwe_60hz || e.prime_power_kwe_60hz) && (
                              <p className="text-xs text-gray-500 whitespace-nowrap">
                                <span className="text-gray-400">60Hz </span>
                                {e.standby_power_kwe_60hz && (
                                  <span>{e.standby_power_kwe_60hz}<span className="text-gray-400">s</span> </span>
                                )}
                                {e.prime_power_kwe_60hz && (
                                  <span>{e.prime_power_kwe_60hz}<span className="text-gray-400">p</span></span>
                                )}
                                <span className="text-gray-400"> kWe</span>
                              </p>
                            )}

                            {/* Emissions */}
                            {e.emissions_standard && (
                              <p className="text-xs text-green-700 mt-0.5 leading-tight">
                                {e.emissions_standard}
                              </p>
                            )}
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
    </div>
  )
}
