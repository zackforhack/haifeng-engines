'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

// Motor starting (inrush) multipliers by start method — the running load is drawn
// continuously, but the largest motor briefly pulls this multiple of its running
// power at startup, which usually sets the peak the generator must cover.
const START_METHODS = [
  { label: 'Direct-on-line (DOL)', factor: 3 },
  { label: 'Soft starter', factor: 2 },
  { label: 'Variable frequency drive (VFD)', factor: 1.5 },
  { label: 'No motors / resistive only', factor: 1 },
]

function n(v: string): number {
  const x = parseFloat(v)
  return Number.isFinite(x) && x > 0 ? x : 0
}

function enginePowerRangeHref(requiredKw: number): string {
  if (requiredKw < 100) return '/engines/power/under-100-kwe'
  if (requiredKw < 500) return '/engines/power/100-500-kwe'
  if (requiredKw < 1500) return '/engines/power/500-1500-kwe'
  if (requiredKw < 2000) return '/engines/power/1500-plus-kwe'
  return '/engines/power/2000-plus-kwe'
}

export function GeneratorSizingCalculator() {
  const [running, setRunning] = useState('200')
  const [motor, setMotor] = useState('45')
  const [factorIdx, setFactorIdx] = useState(0)
  const [pf, setPf] = useState('0.8')
  const [margin, setMargin] = useState('25')

  const r = useMemo(() => {
    const totalRunning = n(running)
    const largestMotor = Math.min(n(motor), totalRunning)
    const factor = START_METHODS[factorIdx].factor
    const powerFactor = n(pf) || 0.8
    const marginPct = n(margin)

    const startingSurge = largestMotor * (factor - 1)        // extra above its running power
    const peakDemand = totalRunning + startingSurge          // worst case: motor starts while rest runs
    const continuousSized = totalRunning * (1 + marginPct / 100)
    const requiredKw = Math.max(peakDemand, continuousSized)
    const requiredKva = requiredKw / powerFactor

    return {
      totalRunning,
      startingSurge,
      peakDemand,
      requiredKw: Math.ceil(requiredKw),
      requiredKva: Math.ceil(requiredKva),
    }
  }, [running, motor, factorIdx, pf, margin])

  const field = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none'

  return (
    <div className="not-prose my-8 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
      <div className="bg-gray-900 px-6 py-4">
        <h3 className="text-white font-bold text-lg">Generator Sizing Calculator</h3>
        <p className="text-gray-300 text-xs mt-0.5">Estimate the generator rating your loads need. Guidance only — confirm with an engineer.</p>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-xs font-semibold text-gray-600 mb-1">Total running load (kW)</span>
          <input type="number" min={0} value={running} onChange={(e) => setRunning(e.target.value)} className={field} />
          <span className="block text-[11px] text-gray-400 mt-1">Everything running at the same time.</span>
        </label>

        <label className="block">
          <span className="block text-xs font-semibold text-gray-600 mb-1">Largest single motor (kW)</span>
          <input type="number" min={0} value={motor} onChange={(e) => setMotor(e.target.value)} className={field} />
          <span className="block text-[11px] text-gray-400 mt-1">Biggest AC, pump or compressor.</span>
        </label>

        <label className="block">
          <span className="block text-xs font-semibold text-gray-600 mb-1">Motor start method</span>
          <select value={factorIdx} onChange={(e) => setFactorIdx(Number(e.target.value))} className={field}>
            {START_METHODS.map((m, i) => <option key={m.label} value={i}>{m.label} (×{m.factor})</option>)}
          </select>
          <span className="block text-[11px] text-gray-400 mt-1">Sets the startup inrush surge.</span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1">Power factor</span>
            <input type="number" min={0.1} max={1} step={0.05} value={pf} onChange={(e) => setPf(e.target.value)} className={field} />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1">Spare margin (%)</span>
            <input type="number" min={0} value={margin} onChange={(e) => setMargin(e.target.value)} className={field} />
          </label>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="rounded-xl bg-white border border-gray-200 p-5">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Recommended (prime)</p>
              <p className="text-3xl font-extrabold text-blue-700">{r.requiredKw.toLocaleString()} <span className="text-lg font-semibold text-gray-400">kW</span></p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Apparent power</p>
              <p className="text-3xl font-extrabold text-gray-900">{r.requiredKva.toLocaleString()} <span className="text-lg font-semibold text-gray-400">kVA</span></p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1">
            <div className="flex justify-between"><span>Running load</span><span>{r.totalRunning.toLocaleString()} kW</span></div>
            <div className="flex justify-between"><span>+ Largest-motor starting surge</span><span>{Math.ceil(r.startingSurge).toLocaleString()} kW</span></div>
            <div className="flex justify-between font-semibold text-gray-700"><span>Peak demand at startup</span><span>{Math.ceil(r.peakDemand).toLocaleString()} kW</span></div>
          </div>
          <Link
            href={enginePowerRangeHref(r.requiredKw)}
            className="mt-5 block text-center bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse the matching engine power range →
          </Link>
        </div>
      </div>
    </div>
  )
}
