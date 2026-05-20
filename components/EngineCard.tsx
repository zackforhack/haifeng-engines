import Link from 'next/link'
import type { Engine } from '@/lib/types'
import { StatusBadge } from './StatusBadge'

function PowerPill({ kwm, kwe, kva, rpm }: { kwm: number; kwe?: number | null; kva?: number | null; rpm: number }) {
  return (
    <div className="flex items-baseline gap-1.5 flex-wrap">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-0.5">Standby</span>
      <span className="text-sm font-bold text-gray-900">{kwm}<span className="text-xs font-normal text-gray-500 ml-0.5">kWm</span></span>
      {kwe && <span className="text-sm font-bold text-gray-900">{kwe}<span className="text-xs font-normal text-gray-500 ml-0.5">kWe</span></span>}
      {kva && <span className="text-sm font-bold text-gray-900">{kva}<span className="text-xs font-normal text-gray-500 ml-0.5">kVA</span></span>}
      <span className="text-xs text-gray-400">@{rpm}rpm</span>
    </div>
  )
}

export function EngineCard({ engine }: { engine: Engine }) {
  const standby50 = engine.standby_power_kw_50hz
  const standby60 = engine.standby_power_kw_60hz
  const rpm50 = engine.rpm_rated ?? 1500
  const rpm60 = Math.round(rpm50 * 6 / 5)

  return (
    <Link
      href={`/engines/${engine.slug}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{engine.brand}</p>
          <h3 className="text-base font-bold text-gray-900">{engine.model}</h3>
          {engine.series && <p className="text-xs text-gray-500">{engine.series}</p>}
        </div>
        <StatusBadge status={engine.status} />
      </div>

      {/* Power ratings — show both frequencies if available */}
      {(standby50 || standby60) ? (
        <div className="mb-2 space-y-1">
          {standby50 && <PowerPill kwm={standby50} kwe={engine.standby_power_kwe_50hz} kva={engine.standby_power_kva_50hz} rpm={rpm50} />}
          {standby60 && <PowerPill kwm={standby60} kwe={engine.standby_power_kwe_60hz} kva={engine.standby_power_kva_60hz} rpm={rpm60} />}
        </div>
      ) : engine.power_kw ? (
        <div className="mb-2">
          <span className="text-sm font-bold text-gray-900">{engine.power_kw}<span className="text-xs font-normal text-gray-500 ml-0.5">kW</span></span>
        </div>
      ) : null}

      {/* Engine specs row */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-1">
        {engine.displacement_l && <span>{engine.displacement_l}L</span>}
        {engine.cylinders && <span>{engine.cylinders}-cyl</span>}
        {engine.configuration && <span>{engine.configuration}</span>}
        {engine.emissions_standard && (
          <span className="text-green-700 font-medium">{engine.emissions_standard}</span>
        )}
        {engine.origin && (
          <span className="text-gray-400">Made in {engine.origin}</span>
        )}
      </div>

      {engine.year_discontinued && (
        <p className="mt-2 text-xs text-gray-400">Discontinued {engine.year_discontinued}</p>
      )}
    </Link>
  )
}
