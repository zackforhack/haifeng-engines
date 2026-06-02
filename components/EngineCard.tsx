import Link from 'next/link'
import type { Engine } from '@/lib/types'
import { StatusBadge } from './StatusBadge'
import { BrandLogo } from './BrandLogo'

function PowerPill({ label, kwm, kwe, kva, rpm }: { label: string; kwm?: number | null; kwe?: number | null; kva?: number | null; rpm: number }) {
  return (
    <div className="flex items-baseline gap-1.5 flex-wrap">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-0.5">{label}</span>
      {kwm && <span className="text-sm font-bold text-gray-900">{kwm}<span className="text-xs font-normal text-gray-500 ml-0.5">kWm</span></span>}
      {kwe && <span className="text-sm font-bold text-gray-900">{kwe}<span className="text-xs font-normal text-gray-500 ml-0.5">kWe</span></span>}
      {kva && <span className="text-sm font-bold text-gray-900">{kva}<span className="text-xs font-normal text-gray-500 ml-0.5">kVA</span></span>}
      <span className="text-xs text-gray-400">@{rpm}rpm</span>
    </div>
  )
}

export function EngineCard({ engine }: { engine: Engine }) {
  // rpm_rated may hold a 50Hz (1500/3000) or 60Hz (1800/3600) rated speed; derive each
  // frequency's true speed rather than blindly ×6/5 (which produced impossible RPM like 2160).
  const rated = engine.rpm_rated ?? 1500
  const ratedIs60 = rated === 1800 || rated === 3600
  const rpm50 = ratedIs60 ? Math.round(rated * 5 / 6) : rated
  const rpm60 = ratedIs60 ? rated : Math.round(rated * 6 / 5)

  const hasStandby50 = engine.standby_power_kw_50hz || engine.standby_power_kwe_50hz
  const hasPrime50   = engine.prime_power_kw_50hz   || engine.prime_power_kwe_50hz
  const show50       = hasStandby50 || hasPrime50
  const show50kw     = hasStandby50 ? engine.standby_power_kw_50hz  : engine.prime_power_kw_50hz
  const show50kwe    = hasStandby50 ? engine.standby_power_kwe_50hz : engine.prime_power_kwe_50hz
  const show50kva    = hasStandby50 ? engine.standby_power_kva_50hz : engine.prime_power_kva_50hz
  const label50      = hasStandby50 ? 'Standby' : 'Prime'

  const hasStandby60 = engine.standby_power_kw_60hz || engine.standby_power_kwe_60hz
  const hasPrime60   = engine.prime_power_kw_60hz   || engine.prime_power_kwe_60hz
  const show60       = hasStandby60 || hasPrime60
  const show60kw     = hasStandby60 ? engine.standby_power_kw_60hz  : engine.prime_power_kw_60hz
  const show60kwe    = hasStandby60 ? engine.standby_power_kwe_60hz : engine.prime_power_kwe_60hz
  const show60kva    = hasStandby60 ? engine.standby_power_kva_60hz : engine.prime_power_kva_60hz
  const label60      = hasStandby60 ? 'Standby' : 'Prime'

  return (
    <Link
      href={`/engines/${engine.slug}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <BrandLogo brand={engine.brand} size="sm" />
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{engine.brand}</p>
          </div>
          <h3 className="text-base font-bold text-gray-900">{engine.model}</h3>
          {engine.series && <p className="text-xs text-gray-500">{engine.series}</p>}
        </div>
        <StatusBadge status={engine.status} />
      </div>

      {/* Power ratings — standby if available, otherwise prime; show both frequencies */}
      {(show50 || show60) ? (
        <div className="mb-2 space-y-1">
          {show50 && <PowerPill label={label50} kwm={show50kw} kwe={show50kwe} kva={show50kva} rpm={rpm50} />}
          {show60 && <PowerPill label={label60} kwm={show60kw} kwe={show60kwe} kva={show60kva} rpm={rpm60} />}
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
