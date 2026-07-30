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

function estimatedKwe(e: Engine): number | null {
  if (e.power_kw == null) return null
  return Math.round(e.power_kw * 0.9 * 10) / 10
}

function representativeKwe(e: Engine): number | null {
  return (
    e.standby_power_kwe_50hz ??
    e.prime_power_kwe_50hz ??
    e.standby_power_kwe_60hz ??
    e.prime_power_kwe_60hz ??
    e.standby_power_kw_50hz ??
    e.prime_power_kw_50hz ??
    e.standby_power_kw_60hz ??
    e.prime_power_kw_60hz ??
    estimatedKwe(e) ??
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
    <span className={`inline-block rounded px-1 py-px text-[11px] font-medium leading-tight ${cls}`}>
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

  const activeRanges = KWE_RANGES.map((range, i) => ({ ...range, i })).filter(
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
    <div className="space-y-10">
      {activeRanges.map(({ label, i }) => {
        // Only brands that have at least one engine in THIS range
        const rangeBrands = allBrands.filter((b) => (lookup[i].get(b)?.length ?? 0) > 0)

        return (
          <section key={label}>
            <div className="mb-2 flex items-baseline justify-between border-t border-gray-900 pt-2">
              <h3 className="text-sm font-bold text-blue-700">
                {label}
              </h3>
              <span className="text-[11px] text-gray-400">{rangeBrands.length} brands</span>
            </div>
            <div className="overflow-x-auto border-b border-gray-900">
              <table className="text-xs border-collapse w-full">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-900">
                    {rangeBrands.map((brand) => {
                      const count = lookup[i].get(brand)?.length ?? 0
                      const dense = count > 4
                      return (
                        <th
                          key={brand}
                          className={`px-2 py-2.5 text-left font-bold text-gray-900 border-r border-gray-200 last:border-r-0 whitespace-nowrap ${dense ? 'min-w-[300px]' : 'min-w-[160px]'}`}
                        >
                          {brand}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {rangeBrands.map((brand) => {
                      const cells = (lookup[i].get(brand) ?? []).sort(
                        (a, b) => (representativeKwe(a) ?? 0) - (representativeKwe(b) ?? 0)
                      )
                      const dense = cells.length > 4
                      return (
                        <td
                          key={brand}
                          className="px-1.5 py-1.5 border-r border-gray-100 last:border-r-0 align-top"
                        >
                          <div className={dense ? 'grid grid-cols-2 divide-x divide-gray-100' : 'flex flex-col'}>
                            {cells.map((e) => (
                              <Link
                                key={e.id}
                                href={`/engines/${e.slug}`}
                                title={e.model ?? undefined}
                                className="flex flex-col gap-px border-b border-gray-100 px-1.5 py-2 last:border-0 hover:bg-blue-50 transition-colors"
                              >
                                <span className="font-semibold text-gray-900 truncate">
                                  {e.model}
                                </span>
                                <div className="flex flex-col gap-px">
                                  {(() => {
                                    // Standby / Prime kWe per frequency — standby (the rating that
                                    // matters for backup gensets) is the bold, leading figure.
                                    const rows = ([
                                      ['50Hz', e.standby_power_kwe_50hz ?? e.standby_power_kw_50hz, e.prime_power_kwe_50hz ?? e.prime_power_kw_50hz, !!(e.standby_power_kwe_50hz || e.prime_power_kwe_50hz)],
                                      ['60Hz', e.standby_power_kwe_60hz ?? e.standby_power_kw_60hz, e.prime_power_kwe_60hz ?? e.prime_power_kw_60hz, !!(e.standby_power_kwe_60hz || e.prime_power_kwe_60hz)],
                                    ] as const).filter(([, sb, pr]) => sb || pr)
                                    return (<>
                                      {rows.map(([hz, sb, pr, isKwe]) => {
                                        const unit = isKwe ? 'kWe' : 'kW'
                                        return (
                                          <span key={hz} className="text-gray-500 whitespace-nowrap">
                                            <span className="text-gray-400">{hz} </span>
                                            {sb && <span className="font-bold text-gray-900">{sb}</span>}
                                            {sb && pr && <span className="text-gray-300 mx-px">/</span>}
                                            {pr && <span>{pr}</span>}
                                            <span className="text-gray-400"> {unit}</span>
                                          </span>
                                        )
                                      })}
                                      {rows.length === 0 && estimatedKwe(e) != null && (
                                        <span
                                          className="text-amber-700 whitespace-nowrap"
                                          title="Reference estimate: 90% of listed mechanical engine power"
                                        >
                                          <span className="font-bold">≈ {estimatedKwe(e)}</span>
                                          <span> kWe est.</span>
                                        </span>
                                      )}
                                      {e.emissions_standard && <EmissionsBadge value={e.emissions_standard} />}
                                    </>)
                                  })()}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )
      })}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-0.5 text-xs text-gray-400">
        <span><strong className="text-gray-700">Standby</strong> / Prime kWe</span>
        <span className="text-amber-700">
          <strong>Estimated kWe</strong> = 0.9 × mechanical kW; reference only
        </span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-blue-100 border border-blue-300" />U.S. EPA</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-green-100 border border-green-300" />Euro Stage</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-red-100 border border-red-300" />China</span>
      </div>
    </div>
  )
}
