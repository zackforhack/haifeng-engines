import Link from 'next/link'
import type { Engine } from '@/lib/types'
import { StatusBadge } from './StatusBadge'

export function EngineCard({ engine }: { engine: Engine }) {
  return (
    <Link
      href={`/engines/${engine.slug}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{engine.brand}</p>
          <h3 className="text-base font-bold text-gray-900">{engine.model}</h3>
          {engine.series && <p className="text-xs text-gray-500">{engine.series}</p>}
        </div>
        <StatusBadge status={engine.status} />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-sm text-gray-600">
        {engine.power_kw && (
          <span><span className="font-medium text-gray-900">{engine.power_kw}</span> kW</span>
        )}
        {engine.power_hp && (
          <span><span className="font-medium text-gray-900">{engine.power_hp}</span> HP</span>
        )}
        {engine.displacement_l && (
          <span><span className="font-medium text-gray-900">{engine.displacement_l}L</span> displacement</span>
        )}
        {engine.cylinders && (
          <span><span className="font-medium text-gray-900">{engine.cylinders}</span> cylinders</span>
        )}
      </div>

      {engine.year_discontinued && (
        <p className="mt-2 text-xs text-gray-400">Discontinued {engine.year_discontinued}</p>
      )}
    </Link>
  )
}
