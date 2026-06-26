import { getAllEngines } from '@/lib/engines'
import { buildIntro, ratedSpeeds, ratedFrequencies } from '@/lib/engine-display'
import type { Engine } from '@/lib/types'

export const revalidate = 86400 // regenerate at most once a day

const BASE = 'https://engines.haifengmachinery.com'

// Compact, parseable power matrix line built from whatever ratings are populated.
function powerLine(e: Engine): string | null {
  const f = e as unknown as Record<string, number | undefined>
  const { rpm50, rpm60 } = ratedSpeeds(e)
  const { has50, has60 } = ratedFrequencies(e)
  const blocks: string[] = []
  for (const [hz, present, rpm] of [[50, has50, rpm50], [60, has60, rpm60]] as const) {
    if (!present) continue
    const ratings: string[] = []
    for (const rating of ['prime', 'standby'] as const) {
      const kwe = f[`${rating}_power_kwe_${hz}hz`]
      const kva = f[`${rating}_power_kva_${hz}hz`] ?? (kwe ? Math.round(kwe / 0.8) : undefined)
      const kw = f[`${rating}_power_kw_${hz}hz`]
      const bits = [kw ? `${kw} kWm` : '', kwe ? `${kwe} kWe` : '', kva ? `${kva} kVA` : ''].filter(Boolean)
      if (bits.length) ratings.push(`${rating} ${bits.join(' / ')}`)
    }
    if (ratings.length) blocks.push(`${hz} Hz @ ${rpm.toLocaleString()} rpm — ${ratings.join('; ')}`)
  }
  return blocks.length ? blocks.join(' | ') : null
}

function specLine(e: Engine): string {
  const kv: string[] = []
  if (e.displacement_l) kv.push(`displacement ${e.displacement_l} L`)
  if (e.configuration) kv.push(`configuration ${e.configuration}`)
  else if (e.cylinders) kv.push(`${e.cylinders} cylinders`)
  if (e.fuel_type) kv.push(`fuel ${e.fuel_type}`)
  if (e.cooling_method) kv.push(`cooling ${e.cooling_method}`)
  if (e.emissions_standard) kv.push(`emissions ${e.emissions_standard}`)
  if (e.origin) kv.push(`origin ${e.origin}`)
  kv.push(`status ${e.status}`)
  kv.push(`datasheet ${(e.pdfs?.length ?? 0) > 0 ? 'available' : 'not available'}`)
  return kv.join('; ')
}

// llms-full.txt — a flat, plain-text dump of every engine's specifications in one file, for deep
// ingestion by AI search engines. Companion to /llms.txt (which is the concise site map).
export async function GET() {
  const engines = await getAllEngines()

  // Group by brand for readability/scannability.
  const byBrand = new Map<string, Engine[]>()
  for (const e of engines) {
    const arr = byBrand.get(e.brand) ?? []
    arr.push(e)
    byBrand.set(e.brand, arr)
  }
  const brands = [...byBrand.keys()].sort((a, b) => a.localeCompare(b))

  const header = `# The Generator Engine Encyclopedia — Full Engine Data

> A flat, plain-text dump of every diesel and gas generator-set engine in the database
> (${engines.length.toLocaleString()} models across ${brands.length} brands), for AI ingestion. Each entry lists power
> ratings, displacement, configuration, fuel, emissions standard, origin and datasheet
> availability. A free resource by Haifeng Machinery.
> Genset reference: 50 Hz = 1500 RPM, 60 Hz = 1800 RPM; kVA = kWe / 0.8 power factor;
> standby (ESP) ratings exceed prime (PRP) by roughly 10%. Source: manufacturer datasheets.
> Concise site map: ${BASE}/llms.txt
`

  const sections = brands.map((brand) => {
    const list = byBrand.get(brand)!.sort((a, b) => a.model.localeCompare(b.model))
    const entries = list.map((e) => {
      const url = `${BASE}/engines/${e.slug}`
      const power = powerLine(e)
      return [
        `### ${e.brand} ${e.model}${e.series ? ` (${e.series})` : ''} — ${url}`,
        buildIntro(e),
        power ? `Power: ${power}` : null,
        `Specs: ${specLine(e)}`,
      ].filter(Boolean).join('\n')
    })
    return `## ${brand}\n\n${entries.join('\n\n')}`
  })

  const body = `${header}\n${sections.join('\n\n')}\n`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
