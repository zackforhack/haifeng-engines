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

const LEGACY_COMPARE_ALIASES: Record<string, string[]> = {
  // Older comparison links used the Perkins 2806 family shorthand. Resolve it to the
  // closest current 2806 variant for the other side of the comparison.
  'perkins-2806': [
    'perkins-2806a-e18ttag6',
    'perkins-2806a-e18ttag7',
    'perkins-2806a-e18ttag5',
    'perkins-2806a-e18ttag4',
    'perkins-2806a-e18tag3',
    'perkins-2806a-e18tag2',
    'perkins-2806c-e18tag1a',
    'perkins-2806j-e18tag1',
  ],
}

function aliasCandidates(slug: string, map: Map<string, Engine>): Engine[] {
  const explicit = LEGACY_COMPARE_ALIASES[slug]
  if (explicit) return explicit.map((s) => map.get(s)).filter((e): e is Engine => !!e)

  return [...map.values()].filter((e) => e.slug !== slug && e.slug.startsWith(slug) && e.status === 'active')
}

function chooseAlias(candidates: Engine[], reference?: Engine | null): Engine | null {
  if (!candidates.length) return null
  const refKwe = reference ? repKwe(reference) : null
  const refFuel = reference ? fuelCategory(reference) : null

  return candidates
    .map((engine) => {
      const k = repKwe(engine)
      const fuelPenalty = refFuel && fuelCategory(engine) !== refFuel ? 10 : 0
      const powerPenalty = refKwe && k ? Math.abs(Math.log(k / refKwe)) : 1
      const statusPenalty = engine.status === 'active' ? 0 : 5
      return { engine, score: fuelPenalty + powerPenalty + statusPenalty }
    })
    .sort((a, b) => a.score - b.score || a.engine.slug.localeCompare(b.engine.slug))[0]?.engine ?? null
}

async function resolveEngineSlug(slug: string, reference?: Engine | null): Promise<Engine | null> {
  const map = await engineMap()
  return map.get(slug) ?? chooseAlias(aliasCandidates(slug, map), reference)
}

export async function resolveComparePair(aSlug: string, bSlug: string): Promise<{ a: Engine | null; b: Engine | null; canonical: string | null }> {
  let [a, b] = await Promise.all([getEngineForCompare(aSlug), getEngineForCompare(bSlug)])
  if (!a && b) a = await resolveEngineSlug(aSlug, b)
  if (!b && a) b = await resolveEngineSlug(bSlug, a)
  if (!a) a = await resolveEngineSlug(aSlug, b)
  if (!b) b = await resolveEngineSlug(bSlug, a)

  return { a, b, canonical: a && b ? pairSlug(a.slug, b.slug) : null }
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
