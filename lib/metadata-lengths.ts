import { compactConfig, displayKva, displayKwe, headlinePower, isVariableSpeedMechanical } from './engine-display'
import type { Alternator, Engine } from './types'

const MAX_TITLE = 60
const MAX_PREFERRED_TITLE = 65
const MAX_DESCRIPTION = 160

function normalize(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function trimToSentence(value: string, maxLength: number): string {
  const clean = normalize(value)
  if (clean.length <= maxLength) return clean

  const cut = clean.slice(0, maxLength - 3)
  const lastSpace = cut.lastIndexOf(' ')
  const clipped = lastSpace > 80 ? cut.slice(0, lastSpace) : cut
  return normalize(clipped.replace(/[,:;.-]+$/, '')) + '...'
}

function engineName(engine: Engine): string {
  return normalize(`${engine.brand} ${engine.model}`)
}

function shortFuel(engine: Engine): string {
  const fuel = (engine.fuel_type || '').toLowerCase()
  if (fuel.includes('natural gas')) return 'gas'
  if (fuel.includes('diesel')) return 'diesel'
  return fuel || 'generator'
}

function powerLabel(engine: Engine): string | null {
  const power = headlinePower(engine)
  const kva = displayKva(power)
  if (kva) return `${kva.toLocaleString()} kVA`

  const kwe = displayKwe(power)
  if (kwe) return `${kwe.toLocaleString()} kWe`

  if (power?.kw) return `${Math.round(power.kw).toLocaleString()} kW`
  return null
}

function compactSpecBits(engine: Engine): string[] {
  const bits = [
    shortFuel(engine),
    engine.displacement_l ? `${engine.displacement_l} L` : '',
    compactConfig(engine) ?? '',
    powerLabel(engine) ?? '',
  ].filter(Boolean)

  return [...new Set(bits)]
}

function firstWithin(candidates: string[], maxLength: number): string {
  const clean = candidates.map(normalize).filter(Boolean)
  return clean.find((candidate) => candidate.length <= maxLength) ?? trimToSentence(clean.at(-1) ?? '', maxLength)
}

export function engineMetadataTitle(engine: Engine, preferred?: string): string {
  if (preferred && normalize(preferred).length <= MAX_PREFERRED_TITLE) return normalize(preferred)

  const name = engineName(engine)
  const rating = powerLabel(engine)

  return firstWithin([
    rating ? `${name} Specs - ${rating}` : `${name} Specs`,
    `${name} Engine Specs`,
    `${name} Specs`,
    rating ? `${engine.model} Specs - ${rating}` : `${engine.model} Specs`,
    `${engine.model} Specs`,
  ], MAX_TITLE)
}

export function engineMetadataDescription(engine: Engine, preferred?: string): string {
  if (preferred && normalize(preferred).length <= MAX_DESCRIPTION) return normalize(preferred)

  const name = engineName(engine)
  const specs = compactSpecBits(engine)
  const emissions = engine.emissions_standard && !/unregulated|none/i.test(engine.emissions_standard)
    ? engine.emissions_standard
    : ''

  if (isVariableSpeedMechanical(engine)) {
    return firstWithin([
      `${name} high-speed industrial engine specs: ${[...specs, emissions].filter(Boolean).join(', ')}. Compare maximum power, torque and datasheets.`,
      `${name} off-road engine specs: ${specs.join(', ')}. Review maximum mechanical power, emissions and datasheets.`,
    ], MAX_DESCRIPTION)
  }

  return firstWithin([
    `${name} generator engine specs: ${[...specs, emissions].filter(Boolean).join(', ')}. Compare ratings, datasheets and generator-set fit.`,
    `${name} specs: ${specs.join(', ')}. Compare ratings, dimensions, emissions and datasheets for generator sets.`,
    `${name} generator engine specs with ratings, displacement, configuration, emissions, datasheets and package support.`,
  ], MAX_DESCRIPTION)
}

export function compareMetadataTitle(a: Engine, b: Engine): string {
  const aName = engineName(a)
  const bName = engineName(b)

  return firstWithin([
    `${aName} vs ${bName} Specs`,
    `${a.model} vs ${b.model} Engine Compare`,
    `${a.model} vs ${b.model} Specs`,
  ], MAX_TITLE)
}

export function compareMetadataDescription(a: Engine, b: Engine): string {
  const aName = engineName(a)
  const bName = engineName(b)

  return firstWithin([
    `Compare ${aName} vs ${bName}: kVA, kWe, displacement, configuration, emissions, dimensions and generator-set fit.`,
    `Compare ${a.model} vs ${b.model}: power ratings, displacement, cylinders, emissions, dimensions and generator-set fit.`,
  ], MAX_DESCRIPTION)
}

function alternatorName(alternator: Alternator): string {
  return normalize(`${alternator.brand} ${alternator.model}`)
}

export function alternatorMetadataTitle(alternator: Alternator, preferred?: string): string {
  if (preferred && normalize(preferred).length <= MAX_PREFERRED_TITLE) return normalize(preferred)

  const name = alternatorName(alternator)
  const rating = alternator.kva != null ? `${alternator.kva.toLocaleString()} kVA` : ''

  return firstWithin([
    rating ? `${name} Specs - ${rating}` : `${name} Specs`,
    `${name} Alternator Specs`,
    `${alternator.model} Specs${rating ? ` - ${rating}` : ''}`,
    `${alternator.model} Specs`,
  ], MAX_TITLE)
}

export function alternatorMetadataDescription(alternator: Alternator, preferred?: string): string {
  if (preferred && normalize(preferred).length <= MAX_DESCRIPTION) return normalize(preferred)

  const name = alternatorName(alternator)
  const specs = [
    alternator.kva != null ? `${alternator.kva.toLocaleString()} kVA` : '',
    alternator.poles ? `${alternator.poles}-pole` : '',
    alternator.series ? `${alternator.series} series` : '',
  ].filter(Boolean)

  return firstWithin([
    `${name} generator alternator specs: ${specs.join(', ')}. Compare datasheet details and generator-set matching context.`,
    `${name} alternator specs with kVA rating, pole count, series, datasheet link and generator-set matching context.`,
  ], MAX_DESCRIPTION)
}
