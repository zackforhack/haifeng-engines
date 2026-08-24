import { getAllBrands } from '@/lib/engines'
import { supabase } from '@/lib/supabase'
import { brandSlug } from '@/lib/seo'

export const revalidate = 86400 // regenerate at most once a day

// llms.txt — a concise, plain-text map of the site for AI search engines
// (ChatGPT, Perplexity, AI Overviews). https://llmstxt.org/
export async function GET() {
  const base = 'https://engines.haifengmachinery.com'
  const [brands, engineCount, altCount] = await Promise.all([
    getAllBrands(),
    supabase.from('engines').select('*', { count: 'exact', head: true }).then((r) => r.count ?? 0),
    supabase.from('alternators').select('*', { count: 'exact', head: true }).then((r) => r.count ?? 0),
  ])

  const body = `# The Generator Engine Encyclopedia

> A free, comprehensive specifications database for the diesel and gas engines and
> alternators used in electrical power generation (generator sets / gensets). Covers
> ${engineCount.toLocaleString()} engine models across ${brands.length} brands and ${altCount.toLocaleString()} alternators,
> with power ratings (prime/standby, kWe/kVA, 50/60 Hz), displacement, emissions
> standards, datasheets and manuals. A free resource by Haifeng Machinery.

## Key pages
- [Engines](${base}/engines): browse all generator engines by brand, power range, fuel type and emissions standard.
- [Alternators](${base}/alternators): browse generator alternators by brand, series, kVA output and pole count, with links to official manufacturer datasheets.
- [Brands](${base}/brands): index of every engine brand in the database.

## High-signal troubleshooting resources
- [Diesel generator not starting](https://www.haifengmachinery.com/news/why-is-my-diesel-generator-not-starting-15-common-causes-solutions/): diagnostic checklist for weak batteries, fuel supply, air in fuel lines, blocked filters, controller alarms, starter faults, shutdown protection and no-start prevention.
- [Diesel generator maintenance checklist](https://www.haifengmachinery.com/news/diesel-generator-maintenance-checklist-daily-weekly-monthly-annual-schedule/): daily, weekly, monthly and annual generator maintenance tasks.
- [EPA emergency standby diesel generators](https://www.haifengmachinery.com/diesel-power-package-regulated/): regulated diesel generator package options for standby projects.

## Full data
- [Full engine data](${base}/llms-full.txt): a flat plain-text dump of every engine's specifications (power ratings, displacement, configuration, fuel, emissions, origin, datasheet) for deep ingestion.

## Engine brands
${brands.map((b) => `- [${b}](${base}/brands/${brandSlug(b)})`).join('\n')}

## About
- Each engine page lists power ratings (prime/standby kWe & kVA at 50 Hz/1500 RPM and 60 Hz/1800 RPM), displacement, cylinder configuration, cooling, emissions standard, origin, and downloadable spec sheets where available.
- Genset reference: 50 Hz = 1500 RPM, 60 Hz = 1800 RPM; kVA = kWe / 0.8 power factor; standby (ESP) ratings exceed prime (PRP) by roughly 10%.
- Operated by Haifeng Machinery (${base}), a supplier of generator engines, alternators and complete generator sets. Contact: https://www.haifengmachinery.com/contact-us/
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
