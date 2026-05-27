'use client'

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
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

interface Point {
  x: number
  y: number
  brand: string
  model: string
  emissions: string | null
}

const COLORS = [
  '#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed',
  '#0891b2', '#db2777', '#65a30d', '#ea580c', '#4f46e5',
  '#0d9488', '#b45309', '#9333ea', '#0284c7', '#15803d',
]

export function PowerScatterChart({ engines }: Props) {
  const brands = [...new Set(engines.map((e) => e.brand).filter(Boolean))].sort()
  const brandIndex = Object.fromEntries(brands.map((b, i) => [b, i]))

  const points: Point[] = engines
    .map((e) => ({
      x: brandIndex[e.brand ?? ''] ?? -1,
      y: representativeKwe(e) ?? -1,
      brand: e.brand ?? '',
      model: e.model ?? '',
      emissions: e.emissions_standard ?? null,
    }))
    .filter((p) => p.x >= 0 && p.y > 0)

  const maxKwe = Math.max(...points.map((p) => p.y))
  const yMax = Math.ceil(maxKwe / 500) * 500

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-xs text-gray-400 mb-3">
        Each dot is one engine model — hover for details
      </p>
      <ResponsiveContainer width="100%" height={420}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 80, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[-0.5, brands.length - 0.5]}
            ticks={brands.map((_, i) => i)}
            tickFormatter={(i: number) => brands[i] ?? ''}
            angle={-45}
            textAnchor="end"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            interval={0}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, yMax]}
            tickFormatter={(v: number) => `${v}`}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            label={{ value: 'kWe', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11, fill: '#6b7280' } }}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ payload }) => {
              if (!payload?.length) return null
              const p = payload[0].payload as Point
              return (
                <div className="bg-white border border-gray-200 rounded shadow-md px-3 py-2 text-xs">
                  <p className="font-semibold text-gray-900">{p.brand} {p.model}</p>
                  <p className="text-blue-600 font-bold">{p.y} kWe</p>
                  {p.emissions && <p className="text-gray-400 mt-0.5">{p.emissions}</p>}
                </div>
              )
            }}
          />
          {[500, 1000, 2000].map((v) =>
            v < yMax ? (
              <ReferenceLine key={v} y={v} stroke="#e5e7eb" strokeDasharray="4 4" />
            ) : null
          )}
          <Scatter
            data={points}
            fill="#2563eb"
            fillOpacity={0.6}
            stroke="none"
            shape={(props: any) => {
              const colorIdx = (props.x !== undefined ? Math.round(props.x) : 0) % COLORS.length
              return (
                <circle
                  cx={props.cx}
                  cy={props.cy}
                  r={4}
                  fill={COLORS[Math.abs(colorIdx)]}
                  fillOpacity={0.65}
                />
              )
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
