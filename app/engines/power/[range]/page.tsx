import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { filterEngines } from '@/lib/engines'
import { EngineTable } from '@/components/EngineTable'
import { HubContent } from '@/components/HubContent'
import { hubItemListElements } from '@/lib/hub-stats'

const BASE = 'https://engines.haifengmachinery.com'

const RANGES = {
  'under-100-kwe':  { label: 'Under 100 kWe',    min: undefined, max: 100 },
  '100-500-kwe':    { label: '100 – 500 kWe',    min: 100, max: 500 },
  '500-1500-kwe':   { label: '500 – 1,500 kWe',  min: 500, max: 1500 },
  '1500-plus-kwe':  { label: '1,500+ kWe',       min: 1500, max: undefined },
} as const

type RangeKey = keyof typeof RANGES

interface Props { params: Promise<{ range: string }> }

export function generateStaticParams() {
  return Object.keys(RANGES).map((range) => ({ range }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { range } = await params
  const cfg = RANGES[range as RangeKey]
  if (!cfg) return {}
  return {
    title: `${cfg.label} Generator Engines`,
    description: `Diesel and gas generator engines rated ${cfg.label} — specifications, prime and standby power, and datasheets by brand and model.`,
    alternates: { canonical: `/engines/power/${range}` },
  }
}

export default async function EnginePowerPage({ params }: Props) {
  const { range } = await params
  const cfg = RANGES[range as RangeKey]
  if (!cfg) notFound()

  const engines = await filterEngines({ min_kwe: cfg.min, max_kwe: cfg.max })
  if (!engines.length) notFound()

  const brands = new Set(engines.map((e) => e.brand)).size
  const related = [
    ...Object.entries(RANGES)
      .filter(([slug]) => slug !== range)
      .map(([slug, c]) => ({ label: c.label, href: `/engines/power/${slug}` })),
    { label: 'Diesel engines', href: '/engines/fuel/diesel' },
    { label: 'Gas engines', href: '/engines/fuel/gas' },
  ]
  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'CollectionPage',
      name: `${cfg.label} Generator Engines`, url: `${BASE}/engines/power/${range}`,
      mainEntity: { '@type': 'ItemList', numberOfItems: engines.length, itemListElement: hubItemListElements(engines, BASE) },
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Engines', item: `${BASE}/engines` },
        { '@type': 'ListItem', position: 2, name: `${cfg.label} Generator Engines`, item: `${BASE}/engines/power/${range}` },
      ],
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div>
        <nav className="text-sm text-gray-400 mb-4">
          <Link href="/engines" className="hover:text-blue-600">Engines</Link>
          {' / '}<span className="text-gray-700">{cfg.label}</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{cfg.label} Generator Engines</h1>
        <p className="text-gray-500 mb-6 max-w-3xl">
          Diesel and gas generator engines rated {cfg.label}, by standby kWe.
          <span className="text-gray-400"> ({engines.length.toLocaleString()} models across {brands} brands.)</span>
        </p>
        <EngineTable engines={engines} />
        <div className="mt-8 text-sm">
          <Link href="/engines" className="text-blue-600 hover:underline">← All engines</Link>
        </div>
        <HubContent subject={`${cfg.label.toLowerCase()} generator engines`} engines={engines} related={related} />
      </div>
    </>
  )
}
