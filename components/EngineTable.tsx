import Link from 'next/link'
import type { Engine } from '@/lib/types'
import { StatusBadge } from './StatusBadge'

interface Props {
  engines: Engine[]
}

export function EngineTable({ engines }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Brand</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Model</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Series</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Standby kWe<br/><span className="font-normal normal-case text-gray-400">50 Hz</span></th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Prime kWe<br/><span className="font-normal normal-case text-gray-400">50 Hz</span></th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Standby kWe<br/><span className="font-normal normal-case text-gray-400">60 Hz</span></th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Prime kWe<br/><span className="font-normal normal-case text-gray-400">60 Hz</span></th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Emissions</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Config</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Disp (L)</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
            <th className="px-3 py-2.5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {engines.map((e) => (
            <tr key={e.id} className="hover:bg-blue-50 transition-colors">
              <td className="px-3 py-2 text-xs font-semibold text-blue-700 whitespace-nowrap">{e.brand}</td>
              <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">{e.model}</td>
              <td className="px-3 py-2 text-gray-400 whitespace-nowrap">{e.series ?? '—'}</td>
              <td className="px-3 py-2 text-right tabular-nums text-gray-700">{e.standby_power_kwe_50hz ?? '—'}</td>
              <td className="px-3 py-2 text-right tabular-nums text-gray-700">{e.prime_power_kwe_50hz ?? '—'}</td>
              <td className="px-3 py-2 text-right tabular-nums text-gray-700">{e.standby_power_kwe_60hz ?? '—'}</td>
              <td className="px-3 py-2 text-right tabular-nums text-gray-700">{e.prime_power_kwe_60hz ?? '—'}</td>
              <td className="px-3 py-2 text-xs text-green-700 whitespace-nowrap">{e.emissions_standard ?? '—'}</td>
              <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">{e.configuration ?? '—'}</td>
              <td className="px-3 py-2 text-right tabular-nums text-gray-500">{e.displacement_l ?? '—'}</td>
              <td className="px-3 py-2 text-center"><StatusBadge status={e.status} /></td>
              <td className="px-3 py-2 text-center">
                <Link
                  href={`/engines/${e.slug}`}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium whitespace-nowrap"
                >
                  Spec →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
