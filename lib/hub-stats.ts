import type { Engine } from '@/lib/types'
import { STRUCTURED_DATA_ITEM_LIMIT } from '@/lib/seo'

// Best-available electrical rating (kWe) for an engine, preferring standby then prime,
// 50 Hz then 60 Hz, falling back to the legacy mechanical kW field. Used only for the
// coarse power-range summaries on hub pages — the detail pages carry the full ratings.
export function engineKwe(e: Engine): number | null {
  const candidates = [
    e.standby_power_kwe_50hz, e.standby_power_kwe_60hz,
    e.prime_power_kwe_50hz, e.prime_power_kwe_60hz,
    e.standby_power_kw_50hz, e.prime_power_kw_50hz, e.power_kw,
  ]
  for (const v of candidates) {
    if (typeof v === 'number' && v > 0) return v
  }
  return null
}

export interface HubStats {
  total: number
  active: number
  discontinued: number
  kweMin: number | null
  kweMax: number | null
  hasDiesel: boolean
  hasGas: boolean
  configs: string[]           // distinct cylinder configurations, most common first
  emissions: string[]         // distinct emissions standards present
  brandCount: number
  topBrands: { name: string; count: number }[]
  withDatasheets: number
}

function classifyFuel(fuelType: string | undefined, fuel: Engine['fuel_type']): 'diesel' | 'gas' | null {
  const s = (fuelType ?? fuel ?? '').toLowerCase()
  if (!s) return null
  if (s.includes('diesel') || s.includes('hfo') || s.includes('dual')) return 'diesel'
  if (s.includes('gas') || s.includes('lpg') || s.includes('cng') || s.includes('lng') || s.includes('biogas') || s.includes('methane')) return 'gas'
  return null
}

function rankByCount(values: (string | undefined)[]): { name: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const v of values) {
    const k = (v ?? '').trim()
    if (!k) continue
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export function computeHubStats(engines: Engine[]): HubStats {
  const kwes = engines.map(engineKwe).filter((v): v is number => v != null)
  const fuels = engines.map((e) => classifyFuel(e.fuel_type, e.fuel_type))

  return {
    total: engines.length,
    active: engines.filter((e) => e.status === 'active').length,
    discontinued: engines.filter((e) => e.status !== 'active').length,
    kweMin: kwes.length ? Math.min(...kwes) : null,
    kweMax: kwes.length ? Math.max(...kwes) : null,
    hasDiesel: fuels.includes('diesel'),
    hasGas: fuels.includes('gas'),
    configs: rankByCount(engines.map((e) => e.configuration)).map((c) => c.name).slice(0, 6),
    emissions: [...new Set(engines.map((e) => e.emissions_standard).filter((v): v is string => !!v))].sort(),
    brandCount: new Set(engines.map((e) => e.brand)).size,
    topBrands: rankByCount(engines.map((e) => e.brand)).slice(0, 8),
    withDatasheets: engines.filter((e) => (e.pdfs?.length ?? 0) > 0).length,
  }
}

function fmtKwe(v: number): string {
  return `${Math.round(v).toLocaleString()} kWe`
}

function fuelPhrase(s: HubStats): string {
  if (s.hasDiesel && s.hasGas) return 'both diesel and gas (natural gas, biogas and CNG/LNG)'
  if (s.hasDiesel) return 'diesel'
  if (s.hasGas) return 'gas (natural gas, biogas and CNG/LNG)'
  return 'diesel and gas'
}

// A unique, fact-derived overview paragraph for a hub page. `subject` is the noun phrase the
// page is about, e.g. "Caterpillar generator engines" or "V12 generator engines".
export function buildHubOverview(subject: string, s: HubStats): string {
  const parts: string[] = []

  const span = s.kweMin != null && s.kweMax != null && s.kweMax > s.kweMin
    ? ` ranging from ${fmtKwe(s.kweMin)} to ${fmtKwe(s.kweMax)}`
    : s.kweMax != null ? ` rated up to ${fmtKwe(s.kweMax)}` : ''
  const brandClause = s.brandCount > 1 ? ` from ${s.brandCount} manufacturers` : ''
  parts.push(`This database lists ${s.total.toLocaleString()} ${subject}${brandClause}${span}, covering ${fuelPhrase(s)} power.`)

  if (s.active > 0 && s.discontinued > 0) {
    parts.push(`${s.active.toLocaleString()} are current production models and ${s.discontinued.toLocaleString()} are discontinued or archived.`)
  }

  if (s.configs.length) {
    parts.push(`Cylinder configurations include ${listToProse(s.configs.slice(0, 4))}.`)
  }
  if (s.emissions.length) {
    parts.push(`Emissions certifications span ${listToProse(s.emissions.slice(0, 4))}.`)
  }
  if (s.withDatasheets > 0) {
    parts.push(`${s.withDatasheets.toLocaleString()} models link to an official manufacturer datasheet or manual.`)
  }

  return parts.join(' ')
}

function listToProse(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

export interface HubFaq { q: string; a: string }

// 3–4 data-derived Q&As. Visible text and FAQPage schema use the same strings, so the
// structured data always matches what's on the page.
export function buildHubFaqs(subject: string, s: HubStats): HubFaq[] {
  const faqs: HubFaq[] = []
  const Subject = subject.charAt(0).toUpperCase() + subject.slice(1)

  if (s.kweMin != null && s.kweMax != null) {
    faqs.push({
      q: `What is the power range of ${subject}?`,
      a: s.kweMax > s.kweMin
        ? `${Subject} in this database range from approximately ${fmtKwe(s.kweMin)} to ${fmtKwe(s.kweMax)} of electrical output, across prime and standby ratings at 50 Hz and 60 Hz.`
        : `${Subject} in this database are rated around ${fmtKwe(s.kweMax)} of electrical output.`,
    })
  }

  faqs.push({
    q: `How many ${subject} are listed?`,
    a: `There are ${s.total.toLocaleString()} ${subject} in the database` +
      (s.active > 0 && s.discontinued > 0
        ? ` — ${s.active.toLocaleString()} current production models and ${s.discontinued.toLocaleString()} discontinued or archived.`
        : '.'),
  })

  if (s.brandCount > 1 && s.topBrands.length) {
    faqs.push({
      q: `Which manufacturers make ${subject}?`,
      a: `${subject.charAt(0).toUpperCase()}${subject.slice(1)} come from ${s.brandCount} manufacturers, including ${listToProse(s.topBrands.slice(0, 5).map((b) => b.name))}.`,
    })
  }

  if (s.withDatasheets > 0) {
    faqs.push({
      q: `Are datasheets available for ${subject}?`,
      a: `Yes — ${s.withDatasheets.toLocaleString()} of the ${s.total.toLocaleString()} ${subject} link to an official manufacturer datasheet or manual on their detail page.`,
    })
  }

  return faqs
}

// ItemList itemListElement array for CollectionPage schema, capped to keep payload sane.
export function hubItemListElements(engines: Engine[], base: string, cap = STRUCTURED_DATA_ITEM_LIMIT) {
  return engines.slice(0, cap).map((e, i) => ({
    '@type': 'ListItem' as const,
    position: i + 1,
    name: `${e.brand} ${e.model}`,
    url: `${base}/engines/${e.slug}`,
  }))
}
