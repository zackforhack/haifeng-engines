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
  let cls = 'bg-gray-100 text-gray-500'
  if (value.includes('U.S. EPA') || value.includes('EPA'))
    cls = 'bg-blue-50 text-blue-600'
  else if (value.includes('Euro Stage'))
    cls = 'bg-green-50 text-green-700'
  else if (value.includes('China'))
    cls = 'bg-red-50 text-red-600'
  return (
    <span className={`inline-block px-1 py-px rounded text-[10px] font-medium leading-tight ${cls}`}>
      {value}
    </span>
  )
}

interface Props {
  engines: Engine[]
}

export function EngineTable({ engines }: Props) {
  const allBrands = [
    ...new Set(engines.map((e) => e.brand).filter((b): b is string => !!b)),
  ].sort()

  // Build lookup[rangeIdx][brand] = Engine[]
  const lookup: Map<string, Engine[]>[] = KWE_RANGES.map(() => new Map())
  for (const e of engines) {
    const ri = rangeIndex(e)
    if (ri < 0 || !e.brand) continue
    const m = lookup[ri]
    if (!m.has(e.brand)) m.set(e.brand, [])
    m.get(e.brand)!.push(e)
  }

  const activeRanges = KWE_RANGES.map((r, i) => ({ ...r, i })).filter(
    ({ i }) => allBrands.some((b) => (lookup[i].get(b)?.length ?? 0) > 0)
  )

  if (activeRanges.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        No power ratings available for the selected engines.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {activeRanges.map(({ label, i }) => {
        // Only brands that have at least one engine in THIS range
        const rangeBrands = allBrands.filter((b) => (lookup[i].get(b)?.length ?? 0) > 0)

        return (
          <div key={label}>
            <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1.5 px-0.5">
              {label}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="text-xs border-collapse w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {rangeBrands.map((brand) => (
                      <th
                        key={brand}
                        className="px-2 py-2 text-center font-semibold text-gray-700 border-r border-gray-200 last:border-r-0 whitespace-nowrap min-w-[160px]"
                      >
                        {brand}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {rangeBrands.map((brand) => {
                      const cells = (lookup[i].get(brand) ?? []).sort(
                        (a, b) => (representativeKwe(a) ?? 0) - (representativeKwe(b) ?? 0)
                      )
                      return (
                        <td
                          key={brand}
                          className="px-1.5 py-1.5 border-r border-gray-100 last:border-r-0 align-top"
                        >
                          {(() => {
                            const dense = cells.length > 4
                            return (
                              <div className={dense ? 'grid grid-cols-2 divide-x divide-gray-100' : 'flex flex-col'}>
                                {cells.map((e) => (
                                  <Link
                                    key={e.id}
                                    href={`/engines/${e.slug}`}
                                    title={e.model ?? undefined}
                                    className="flex flex-col gap-px px-1.5 py-1 border-b border-gray-100 last:border-0 hover:bg-blue-50 transition-colors overflow-hidden"
                                  >
                                    <span className="font-semibold text-gray-900 truncate">
                                      {e.model}
                                    </span>
                                    <div className="flex flex-col gap-px">
                                      {(e.standby_power_kwe_50hz || e.prime_power_kwe_50hz) && (
                                        <span className="text-gray-500 truncate">
                                          <span className="text-gray-400">50Hz </span>
                                          {e.standby_power_kwe_50hz && <span className="font-medium text-gray-700">{e.standby_power_kwe_50hz}</span>}
                                          {e.standby_power_kwe_50hz && e.prime_power_kwe_50hz && <span className="text-gray-300 mx-px">/</span>}
                                          {e.prime_power_kwe_50hz && <span>{e.prime_power_kwe_50hz}</span>}
                                          <span className="text-gray-400"> kWe</span>
                                        </span>
                                      )}
                                      {(e.standby_power_kwe_60hz || e.prime_power_kwe_60hz) && (
                                        <span className="text-gray-500 truncate">
                                          <span className="text-gray-400">60Hz </span>
                                          {e.standby_power_kwe_60hz && <span className="font-medium text-gray-700">{e.standby_power_kwe_60hz}</span>}
                                          {e.standby_power_kwe_60hz && e.prime_power_kwe_60hz && <span className="text-gray-300 mx-px">/</span>}
                                          {e.prime_power_kwe_60hz && <span>{e.prime_power_kwe_60hz}</span>}
                                          <span className="text-gray-400"> kWe</span>
                                        </span>
                                      )}
                                      {e.emissions_standard && <EmissionsBadge value={e.emissions_standard} />}
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            )
                          })()}
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-gray-400 px-0.5">
        <span>Standby / Prime kWe</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-blue-100 border border-blue-300" />U.S. EPA</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-green-100 border border-green-300" />Euro Stage</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-red-100 border border-red-300" />China</span>
      </div>
    </div>
  )
}
