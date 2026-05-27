import Link from 'next/link'
import type { Engine } from '@/lib/types'

function representativeKwe(e: Engine): number | null {
  return (
    e.standby_power_kwe_50hz ??
    e.prime_power_kwe_50hz ??
    e.standby_power_kwe_60hz ??
    e.prime_power_kwe_60hz ??
    null
  )
}

interface Props {
  engines: Engine[]
}

export function EngineTable({ engines }: Props) {
  const brands = [...new Set(engines.map((e) => e.brand).filter((b): b is string => !!b))].sort()

  // All distinct kWe values present in the result set, sorted ascending
  const kweSet = new Set<number>()
  for (const e of engines) {
    const k = representativeKwe(e)
    if (k !== null) kweSet.add(k)
  }
  const kweValues = [...kweSet].sort((a, b) => a - b)

  // lookup[brand][kwe] = Engine[]
  const lookup = new Map<string, Map<number, Engine[]>>()
  for (const brand of brands) lookup.set(brand, new Map())
  for (const e of engines) {
    const k = representativeKwe(e)
    if (k === null || !e.brand) continue
    const brandMap = lookup.get(e.brand)!
    if (!brandMap.has(k)) brandMap.set(k, [])
    brandMap.get(k)!.push(e)
  }

  if (kweValues.length === 0) {
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
            {/* kWe header */}
            <th className="sticky left-0 z-10 bg-gray-50 px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-r border-gray-200 whitespace-nowrap min-w-[80px]">
              kWe
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
          {kweValues.map((kwe, rowIdx) => {
            const hasAny = brands.some((b) => (lookup.get(b)?.get(kwe)?.length ?? 0) > 0)
            if (!hasAny) return null
            return (
              <tr key={kwe} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                {/* kWe label */}
                <td className="sticky left-0 z-10 px-3 py-2 text-right font-bold text-blue-700 border-r border-gray-200 whitespace-nowrap"
                  style={{ background: rowIdx % 2 === 0 ? 'white' : 'rgb(249 250 251 / 0.5)' }}
                >
                  {kwe}
                </td>
                {brands.map((brand) => {
                  const cells = lookup.get(brand)?.get(kwe) ?? []
                  return (
                    <td key={brand} className="px-2 py-1.5 border-r border-gray-100 align-top min-w-[110px]">
                      {cells.length === 0 ? (
                        <span className="text-gray-200 select-none">·</span>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          {cells.map((e) => (
                            <Link
                              key={e.id}
                              href={`/engines/${e.slug}`}
                              className="block text-xs text-blue-700 font-medium hover:text-blue-900 hover:underline whitespace-nowrap"
                              title={[e.brand, e.model, e.emissions_standard, e.configuration].filter(Boolean).join(' · ')}
                            >
                              {e.model}
                            </Link>
                          ))}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
