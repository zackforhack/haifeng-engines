import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { filterEngines } from '@/lib/engines'
import { EngineTable } from '@/components/EngineTable'
import { HubContent } from '@/components/HubContent'
import { hubItemListElements } from '@/lib/hub-stats'
import { limitedEngines, ENGINE_HUB_DISPLAY_LIMIT } from '@/lib/seo'

const BASE = 'https://engines.haifengmachinery.com'
const GAS_HUB_DISPLAY_LIMIT = 240

const FUELS = {
  diesel: {
    label: 'Diesel',
    title: 'Diesel Generator Engines',
    metaDescription: 'Diesel generator engines with specs, power ratings, emissions context and datasheets by brand and model.',
    intro: 'Diesel generator engines are the workhorse of standby and prime power — efficient, durable and available from a few kW to several megawatts. Browse the full diesel range below.',
  },
  gas: {
    label: 'Gas',
    title: 'Gas Generator Engines',
    metaDescription: 'Natural gas, CNG/LNG, biogas, biomethane and propane/LPG generator engines with specs, ratings, emissions context and datasheets.',
    intro: 'Gas generator engines — natural gas including CNG/LNG, biogas, biomethane and propane (LPG) — support continuous, CHP, prime and standby power research. Browse the gas-engine range below.',
  },
} as const

type FuelKey = keyof typeof FUELS

interface Props { params: Promise<{ fuel: string }> }

function gasFamily(fuelType: string | null | undefined): string {
  const fuel = (fuelType ?? '').toLowerCase()
  if (/lpg|propane/.test(fuel)) return 'Propane (LPG)'
  if (/biogas|bio gas|biomethane/.test(fuel)) return 'Biogas / biomethane'
  if (/natural gas|cng|lng/.test(fuel)) return 'Natural gas'
  if (/coal|cbm/.test(fuel)) return 'Coal gas / CBM'
  return 'Other gas'
}

function gasFamilyCounts(engines: Awaited<ReturnType<typeof filterEngines>>) {
  const order = ['Natural gas', 'Biogas / biomethane', 'Propane (LPG)', 'Coal gas / CBM', 'Other gas']
  const counts = new Map<string, number>()
  for (const engine of engines) {
    const family = gasFamily(engine.fuel_type)
    counts.set(family, (counts.get(family) ?? 0) + 1)
  }
  return order
    .map((label) => ({ label, count: counts.get(label) ?? 0 }))
    .filter((item) => item.count > 0)
}

export function generateStaticParams() {
  return Object.keys(FUELS).map((fuel) => ({ fuel }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { fuel } = await params
  const cfg = FUELS[fuel as FuelKey]
  if (!cfg) return {}
  return {
    title: { absolute: cfg.title },
    description: cfg.metaDescription,
    alternates: { canonical: `/engines/fuel/${fuel}` },
  }
}

export default async function EngineFuelPage({ params }: Props) {
  const { fuel } = await params
  const cfg = FUELS[fuel as FuelKey]
  if (!cfg) notFound()

  const engines = await filterEngines({ fuel: fuel as FuelKey })
  if (!engines.length) notFound()
  const displayLimit = fuel === 'gas' ? GAS_HUB_DISPLAY_LIMIT : ENGINE_HUB_DISPLAY_LIMIT
  const displayedEngines = limitedEngines(engines, displayLimit)
  const gasFamilies = fuel === 'gas' ? gasFamilyCounts(engines) : []

  const brands = new Set(engines.map((e) => e.brand)).size
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: cfg.title, url: `${BASE}/engines/fuel/${fuel}`, description: cfg.intro,
    mainEntity: { '@type': 'ItemList', numberOfItems: engines.length, itemListElement: hubItemListElements(engines, BASE) },
  }
  const related = [
    { label: fuel === 'diesel' ? 'Gas engines' : 'Diesel engines', href: `/engines/fuel/${fuel === 'diesel' ? 'gas' : 'diesel'}` },
    { label: 'Under 100 kWe', href: '/engines/power/under-100-kwe' },
    { label: '100–500 kWe', href: '/engines/power/100-500-kwe' },
    { label: '500–1,500 kWe', href: '/engines/power/500-1500-kwe' },
    { label: '1,500+ kWe', href: '/engines/power/1500-plus-kwe' },
  ]
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Engines', item: `${BASE}/engines` },
      { '@type': 'ListItem', position: 2, name: cfg.title, item: `${BASE}/engines/fuel/${fuel}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumb]).replace(/</g, '\\u003c') }} />
      <div>
        <nav className="text-sm text-gray-400 mb-4">
          <Link href="/engines" className="hover:text-blue-600">Engines</Link>
          {' / '}<span className="text-gray-700">{cfg.title}</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{cfg.title}</h1>
        <p className="text-gray-500 mb-6 max-w-3xl">{cfg.intro} <span className="text-gray-400">({engines.length.toLocaleString()} models across {brands} brands.)</span></p>
        {gasFamilies.length > 0 && (
          <div className="mb-6 grid grid-cols-2 border-y border-gray-900 bg-white sm:grid-cols-3 lg:grid-cols-5">
            {gasFamilies.map((item) => (
              <div key={item.label} className="border-r border-b border-gray-200 px-4 py-3 last:border-r-0 lg:border-b-0">
                <p className="text-xs font-bold text-gray-500">{item.label}</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{item.count.toLocaleString()} models</p>
              </div>
            ))}
          </div>
        )}
        <EngineTable engines={displayedEngines} />
        {engines.length > displayedEngines.length && (
          <p className="text-xs text-gray-400 mt-3">
            Showing the first {displayLimit.toLocaleString()} of {engines.length.toLocaleString()} models on this fuel page. Use the filters on the main engine database for the full set.
          </p>
        )}
        <div className="mt-8 text-sm">
          <Link href="/engines" className="text-blue-600 hover:underline">← All engines</Link>
        </div>
        <HubContent subject={`${cfg.label.toLowerCase()} generator engines`} engines={engines} related={related} />
      </div>
    </>
  )
}
