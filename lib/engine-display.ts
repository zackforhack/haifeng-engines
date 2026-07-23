import type { Engine } from './types'

// Shared, pure display helpers used by the engine detail page, its generated OG image,
// and its metadata — so the headline figures stay identical across all three.

export interface RatedSpeeds {
  rpm50: number
  rpm60: number
  ratedIs60: boolean
}

// rpm_rated may hold a 50Hz (1500/3000) or 60Hz (1800/3600) rated speed. Derive each
// frequency's true speed rather than blindly ×6/5 (which turned 1800 into 2160).
export function ratedSpeeds(engine: Engine): RatedSpeeds {
  const rated = engine.rpm_rated ?? 1500
  const ratedIs60 = rated === 1800 || rated === 3600
  const rpm50 = ratedIs60 ? Math.round((rated * 5) / 6) : rated
  const rpm60 = ratedIs60 ? rated : Math.round((rated * 6) / 5)
  return { rpm50, rpm60, ratedIs60 }
}

// Which frequencies the engine actually carries a power rating for.
export function ratedFrequencies(e: Engine): { has50: boolean; has60: boolean } {
  const f = e as unknown as Record<string, number | undefined>
  const has = (hz: 50 | 60) =>
    !!(f[`prime_power_kw_${hz}hz`] || f[`standby_power_kw_${hz}hz`] || f[`prime_power_kwe_${hz}hz`] || f[`standby_power_kwe_${hz}hz`])
  return { has50: has(50), has60: has(60) }
}

export function isVariableSpeedMechanical(e: Engine): boolean {
  const { has50, has60 } = ratedFrequencies(e)
  const fixedGeneratorSpeeds = new Set([1500, 1800, 3000, 3600])
  return !!e.power_kw && !has50 && !has60 && !!e.rpm_rated
    && !fixedGeneratorSpeeds.has(e.rpm_rated)
}

// "1,500 / 1,800 RPM" when the engine is rated for both frequencies, else the single speed.
export function ratedSpeedLabel(e: Engine): string {
  const { rpm50, rpm60 } = ratedSpeeds(e)
  const { has50, has60 } = ratedFrequencies(e)
  if (has50 && has60) return `${rpm50.toLocaleString()} / ${rpm60.toLocaleString()} RPM`
  if (has60 && !has50) return `${rpm60.toLocaleString()} RPM`
  return `${rpm50.toLocaleString()} RPM`
}

// Compact cylinder-layout token (L6 / V12 / W18) for tight spaces like the OG card stat tiles.
// Defends against any verbose/aspiration-only `configuration` value sneaking in: it extracts the
// layout token, or derives it from the cylinder count (≤6 = inline, ≥8 = V).
export function compactConfig(e: Engine): string | null {
  const c = (e.configuration || '').trim()
  if (/^[LVW]\d+$/i.test(c)) return c.toUpperCase()
  let m
  if ((m = c.match(/^in-?line\s*(\d+)/i))) return 'L' + m[1]
  if ((m = c.match(/^([vw])\s*(\d+)/i)))   return m[1].toUpperCase() + m[2]
  if (/^single-cylinder/i.test(c))         return 'L1'
  if (e.cylinders) return (e.cylinders <= 6 ? 'L' : 'V') + e.cylinders
  return c || null
}

export interface HeadlinePower {
  kva?: number
  kwe?: number
  kw?: number
  hz: 50 | 60
  rating: 'Standby' | 'Prime'
}

// The single most marketable rating, preferring 50Hz standby, then 50Hz prime, then 60Hz.
export function headlinePower(e: Engine): HeadlinePower | null {
  const order: [50 | 60, 'Standby' | 'Prime', 'standby' | 'prime'][] = [
    [50, 'Standby', 'standby'],
    [50, 'Prime', 'prime'],
    [60, 'Standby', 'standby'],
    [60, 'Prime', 'prime'],
  ]
  const f = e as unknown as Record<string, number | undefined>
  for (const [hz, rating, p] of order) {
    const kva = f[`${p}_power_kva_${hz}hz`]
    const kwe = f[`${p}_power_kwe_${hz}hz`]
    const kw = f[`${p}_power_kw_${hz}hz`]
    if (kva || kwe || kw) return { kva, kwe, kw, hz, rating }
  }
  if (e.power_kw) return { kw: e.power_kw, hz: 50, rating: 'Standby' }
  return null
}

// kVA for headlines: stored value if present, else derived from kWe at 0.8 pf.
export function displayKva(p: HeadlinePower | null): number | null {
  if (!p) return null
  if (p.kva) return Math.round(p.kva)
  if (p.kwe) return Math.round(p.kwe / 0.8)
  return null
}

// kWe for headlines: stored value if present, else derived from kVA at 0.8 pf.
export function displayKwe(p: HeadlinePower | null): number | null {
  if (!p) return null
  if (p.kwe) return Math.round(p.kwe)
  if (p.kva) return Math.round(p.kva * 0.8)
  return null
}

// Best electrical (kWe) or mechanical (kW) output for a headline.
export function displayOutput(p: HeadlinePower | null): { value: number; unit: 'kWe' | 'kW' } | null {
  if (!p) return null
  if (p.kwe) return { value: Math.round(p.kwe), unit: 'kWe' }
  if (p.kw) return { value: Math.round(p.kw), unit: 'kW' }
  return null
}

// One-to-two sentence SEO intro, built only from populated fields. Used when an engine has
// no editorial description so the page never ships as thin content.
export function buildIntro(e: Engine): string {
  const hp = headlinePower(e)
  const kva = displayKva(hp)
  const out = displayOutput(hp)
  const { rpm50, rpm60 } = ratedSpeeds(e)

  // Configuration like "L6"/"V12" already encodes the cylinder count, so prefer it and
  // expand the prefix (L→inline); otherwise fall back to the raw cylinder count.
  let configDesc = ''
  if (e.configuration) {
    const m = e.configuration.match(/^([LVW])-?(\d+)$/i)
    configDesc = m
      ? (m[1].toUpperCase() === 'L' ? `inline-${m[2]}` : `${m[1].toUpperCase()}${m[2]}`)
      : e.configuration.toLowerCase()
  } else if (e.cylinders) {
    configDesc = `${e.cylinders}-cylinder`
  }

  const descriptors = [
    e.displacement_l ? `${e.displacement_l}-litre` : '',
    configDesc,
  ].filter(Boolean).join(' ')

  const fuel = (e.fuel_type || 'diesel').toLowerCase()
  const variableSpeed = isVariableSpeedMechanical(e)
  let s = variableSpeed
    ? `The ${e.brand} ${e.model} is a ${descriptors ? descriptors + ' ' : ''}high-speed industrial ${fuel} engine`
    : `The ${e.brand} ${e.model} is a ${descriptors ? descriptors + ' ' : ''}${fuel} engine for generator sets`

  if (variableSpeed && e.power_kw && e.rpm_rated) {
    s += ` with a maximum mechanical output of ${e.power_kw.toLocaleString()} kW at ${e.rpm_rated.toLocaleString()} RPM`
  } else if (kva || out) {
    const bits: string[] = []
    if (kva) bits.push(`${kva.toLocaleString()} kVA`)
    if (out) bits.push(`${out.value.toLocaleString()} ${out.unit}`)
    const speed = hp ? (hp.hz === 60 ? rpm60 : rpm50) : rpm50
    s += `, rated at ${bits.join(' / ')} ${hp?.rating.toLowerCase() ?? 'standby'} power at ${speed.toLocaleString()} RPM (${hp?.hz ?? 50} Hz)`
  }
  s += '.'
  if (variableSpeed) {
    s += ' Generator use requires an engineered variable-speed drivetrain or power-electronics system; this is not a standard fixed-speed 50/60 Hz genset rating.'
  }

  // "Liquid-cooled" already ends in "-cooled"; only append "-cooled" when missing.
  const cool = e.cooling_method
    ? (/cool/i.test(e.cooling_method) ? e.cooling_method.toLowerCase() : `${e.cooling_method.toLowerCase()}-cooled`)
    : null
  if (cool && e.origin) s += ` It is a ${cool} engine built in ${e.origin}.`
  else if (cool) s += ` It is ${cool}.`
  else if (e.origin) s += ` It is built in ${e.origin}.`

  if (e.emissions_standard && !/unregulated/i.test(e.emissions_standard)) {
    s += ` It meets ${e.emissions_standard} emissions standards.`
  }

  return s
}
