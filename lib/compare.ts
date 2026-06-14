import { getAllEngines } from './engines'
import type { Engine } from './types'

// Head-to-head engine comparison pages. Pairs are curated (each engine vs its closest cross-brand
// rivals in the same fuel + power band), so we avoid the 2M-combination explosion and only build
// comparisons a buyer would actually run. A module-level engine map means the 3k+ pre-rendered
// pages do zero per-page DB work — just in-memory lookups.

const GAS = /natural gas|biogas|biomethane|coal gas|cng|lng|lpg|propane/i
export function fuelCategory(e: Engine): 'diesel' | 'gas' | 'other' {
  const f = e.fuel_type || ''
  return /diesel/i.test(f) ? 'diesel' : GAS.test(f) ? 'gas' : 'other'
}

// The single most representative electrical rating, for power-proximity matching.
export function repKwe(e: Engine): number | null {
  return e.standby_power_kwe_50hz ?? e.prime_power_kwe_50hz ?? e.standby_power_kwe_60hz ?? e.prime_power_kwe_60hz ?? null
}

let _mapPromise: Promise<Map<string, Engine>> | null = null
function engineMap(): Promise<Map<string, Engine>> {
  if (!_mapPromise) _mapPromise = getAllEngines().then((es) => new Map(es.map((e) => [e.slug, e])))
  return _mapPromise
}

export async function getEngineForCompare(slug: string): Promise<Engine | null> {
  return (await engineMap()).get(slug) ?? null
}

// Canonical (alphabetical) ordering so A-vs-B and B-vs-A resolve to one URL — no duplicate content.
export function canonicalPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a]
}
export function pairSlug(a: string, b: string): string {
  const [x, y] = canonicalPair(a, b)
  return `${x}-vs-${y}`
}
export function parsePair(param: string): { a: string; b: string } | null {
  const i = param.indexOf('-vs-')
  if (i <= 0) return null
  const a = param.slice(0, i)
  const b = param.slice(i + 4)
  if (!a || !b || a === b) return null
  return { a, b }
}

const N_COMPETITORS = 2
const BAND_LO = 0.7
const BAND_HI = 1.4

// Closest same-fuel, cross-brand, similar-power active engines.
export async function competitorsFor(engine: Engine, limit = N_COMPETITORS): Promise<Engine[]> {
  const k = repKwe(engine)
  if (k == null) return []
  const cat = fuelCategory(engine)
  if (cat === 'other') return []
  const map = await engineMap()
  return [...map.values()]
    .map((o) => ({ o, k2: repKwe(o) }))
    .filter(({ o, k2 }) =>
      o.slug !== engine.slug && o.brand !== engine.brand && o.status === 'active' &&
      fuelCategory(o) === cat && k2 != null && k2 >= k * BAND_LO && k2 <= k * BAND_HI)
    .sort((a, b) => Math.abs(Math.log((a.k2 as number) / k)) - Math.abs(Math.log((b.k2 as number) / k)))
    .slice(0, limit)
    .map(({ o }) => o)
}

// Every curated canonical pair — drives generateStaticParams and the sitemap.
export async function getComparisonPairs(): Promise<string[]> {
  const map = await engineMap()
  const pool = [...map.values()].filter((e) => e.status === 'active' && repKwe(e) != null && fuelCategory(e) !== 'other')
  const set = new Set<string>()
  for (const e of pool) {
    for (const o of await competitorsFor(e)) set.add(pairSlug(e.slug, o.slug))
  }
  return [...set]
}
