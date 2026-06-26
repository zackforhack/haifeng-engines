import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { filterEngines } from '@/lib/engines'
import { EngineTable } from '@/components/EngineTable'
import { HubContent } from '@/components/HubContent'
import { hubItemListElements } from '@/lib/hub-stats'

const BASE = 'https://engines.haifengmachinery.com'

const FUELS = {
  diesel: {
    label: 'Diesel',
    title: 'Diesel Generator Engines',
    intro: 'Diesel generator engines are the workhorse of standby and prime power — efficient, durable and available from a few kW to several megawatts. Browse the full diesel range below.',
  },
  gas: {
    label: 'Gas',
    title: 'Gas Generator Engines',
    intro: 'Gas generator engines — natural gas, CNG/LNG and biogas — deliver lower-emission, lower-cost power for continuous and CHP duty. Browse the full gas range below.',
  },
} as const

type FuelKey = keyof typeof FUELS

interface Props { params: Promise<{ fuel: string }> }

export function generateStaticParams() {
  return Object.keys(FUELS).map((fuel) => ({ fuel }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { fuel } = await params
  const cfg = FUELS[fuel as FuelKey]
  if (!cfg) return {}
  return {
    title: cfg.title,
    description: `${cfg.intro} Specifications, power ratings and datasheets for ${cfg.label.toLowerCase()} generator engines by brand and model.`,
    alternates: { canonical: `/engines/fuel/${fuel}` },
  }
}

export default async function EngineFuelPage({ params }: Props) {
  const { fuel } = await params
  const cfg = FUELS[fuel as FuelKey]
  if (!cfg) notFound()

  const engines = await filterEngines({ fuel: fuel as FuelKey })
  if (!engines.length) notFound()

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
        <EngineTable engines={engines} />
        <div className="mt-8 text-sm">
          <Link href="/engines" className="text-blue-600 hover:underline">← All engines</Link>
        </div>
        <HubContent subject={`${cfg.label.toLowerCase()} generator engines`} engines={engines} related={related} />
      </div>
    </>
  )
}
