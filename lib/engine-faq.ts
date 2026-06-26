import type { Engine } from './types'
import { ratedSpeeds, ratedFrequencies, compactConfig } from './engine-display'

export interface EngineFaq { q: string; a: string }

// kVA for a specific frequency + rating, derived from kVA / kWe / kW (in that order) at 0.8 pf.
function kvaOf(e: Engine, hz: 50 | 60, rating: 'prime' | 'standby'): number | null {
  const f = e as unknown as Record<string, number | undefined>
  const kva = f[`${rating}_power_kva_${hz}hz`]
  if (kva) return Math.round(kva)
  const kwe = f[`${rating}_power_kwe_${hz}hz`]
  if (kwe) return Math.round(kwe / 0.8)
  const kw = f[`${rating}_power_kw_${hz}hz`]
  if (kw) return Math.round(kw / 0.8)
  return null
}

function fuelNoun(e: Engine): string {
  const s = (e.fuel_type ?? 'diesel').toLowerCase()
  if (s.includes('gas') || s.includes('lng') || s.includes('cng') || s.includes('biogas') || s.includes('methane')) {
    return e.fuel_type ?? 'natural gas'
  }
  return 'diesel'
}

function configPhrase(e: Engine): string | null {
  const cc = compactConfig(e)
  if (cc && /^[LVW]\d+$/.test(cc)) {
    const layout = cc[0] === 'L' ? 'inline' : cc[0] === 'V' ? 'V' : 'W'
    const n = cc.slice(1)
    return layout === 'inline' ? `an inline-${n} (${n}-cylinder)` : `a ${layout}${n} (${n}-cylinder)`
  }
  if (e.cylinders) return `a ${e.cylinders}-cylinder`
  return null
}

// Data-derived, quotable Q&As for an engine detail page. Visible text and FAQPage schema use the
// same strings. Intent: give AI engines (and featured snippets) concise, declarative passages to
// cite, since the rest of the page is mostly a spec table.
export function buildEngineFaqs(engine: Engine): EngineFaq[] {
  const name = `${engine.brand} ${engine.model}`
  const faqs: EngineFaq[] = []
  const { has50, has60 } = ratedFrequencies(engine)
  const { rpm50, rpm60 } = ratedSpeeds(engine)

  // Power output
  const powerBits: string[] = []
  for (const [hz, present, rpm] of [[50, has50, rpm50], [60, has60, rpm60]] as const) {
    if (!present) continue
    const standby = kvaOf(engine, hz, 'standby')
    const prime = kvaOf(engine, hz, 'prime')
    const r: string[] = []
    if (standby) r.push(`${standby.toLocaleString()} kVA standby`)
    if (prime) r.push(`${prime.toLocaleString()} kVA prime`)
    if (r.length) powerBits.push(`${r.join(' / ')} at ${hz} Hz (${rpm.toLocaleString()} rpm)`)
  }
  if (powerBits.length) {
    faqs.push({
      q: `What is the power output of the ${name}?`,
      a: `The ${name} is rated at ${powerBits.join('; and ')}.`,
    })
  }

  // Frequency / speed
  if (has50 || has60) {
    const freqs: string[] = []
    if (has50) freqs.push(`50 Hz (${rpm50.toLocaleString()} rpm)`)
    if (has60) freqs.push(`60 Hz (${rpm60.toLocaleString()} rpm)`)
    faqs.push({
      q: `Does the ${engine.model} run at 50 Hz or 60 Hz?`,
      a: has50 && has60
        ? `The ${name} is available for both ${freqs.join(' and ')}.`
        : `The ${name} is rated for ${freqs[0]}.`,
    })
  }

  // Fuel
  faqs.push({
    q: `What fuel does the ${name} use?`,
    a: `The ${name} is a ${fuelNoun(engine)} generator-set engine.`,
  })

  // Displacement + configuration
  const cfg = configPhrase(engine)
  if (engine.displacement_l || cfg) {
    const disp = engine.displacement_l ? `${engine.displacement_l} L` : null
    if (disp && cfg) {
      faqs.push({
        q: `What is the displacement and cylinder configuration of the ${engine.model}?`,
        a: `The ${name} is ${cfg} engine with a displacement of ${disp}.`,
      })
    } else if (disp) {
      faqs.push({ q: `What is the displacement of the ${engine.model}?`, a: `The ${name} has a displacement of ${disp}.` })
    } else if (cfg) {
      faqs.push({ q: `What is the cylinder configuration of the ${engine.model}?`, a: `The ${name} is ${cfg} engine.` })
    }
  }

  // Emissions
  if (engine.emissions_standard && !/unregulated/i.test(engine.emissions_standard)) {
    faqs.push({
      q: `What emissions standard does the ${engine.model} meet?`,
      a: `The ${name} is certified to ${engine.emissions_standard} emissions standards.`,
    })
  }

  // Production status
  if (engine.status === 'discontinued') {
    faqs.push({
      q: `Is the ${engine.model} still in production?`,
      a: `No — the ${name} is discontinued${engine.year_discontinued ? ` (production ended around ${engine.year_discontinued})` : ''}. Its specifications and datasheets remain archived here for reference.`,
    })
  } else if (engine.status === 'active') {
    faqs.push({
      q: `Is the ${name} still in production?`,
      a: `Yes — the ${name} is a current production model.`,
    })
  }

  // Datasheet availability
  if ((engine.pdfs?.length ?? 0) > 0) {
    faqs.push({
      q: `Is a datasheet available for the ${engine.model}?`,
      a: `Yes — an official ${engine.brand} datasheet for the ${name} can be downloaded from this page.`,
    })
  }

  return faqs
}
