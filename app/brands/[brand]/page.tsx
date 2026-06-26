import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllBrands, getEnginesByBrand, getBrandDisplayName } from '@/lib/engines'
import { EngineCard } from '@/components/EngineCard'
import { BrandLogo } from '@/components/BrandLogo'
import { HubContent } from '@/components/HubContent'
import { hubItemListElements } from '@/lib/hub-stats'

interface Props {
  params: Promise<{ brand: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params
  const decoded = decodeURIComponent(brand)
  const name = (await getBrandDisplayName(decoded)) ?? decoded
  return {
    title: `${name} Generator Engine Specs`,
    description: `Browse all ${name} diesel and gas generator engine specifications, datasheets, and manuals for electrical power generation.`,
    alternates: { canonical: `/brands/${encodeURIComponent(decoded.toLowerCase())}` },
  }
}

export async function generateStaticParams() {
  const brands = await getAllBrands()
  return brands.map((b) => ({ brand: b.toLowerCase() }))
}

export default async function BrandPage({ params }: Props) {
  const { brand } = await params
  const decoded = decodeURIComponent(brand)
  const engines = await getEnginesByBrand(decoded)

  if (!engines.length) notFound()

  const activeEngines = engines.filter((e) => e.status === 'active')
  const discontinuedEngines = engines.filter((e) => e.status !== 'active')

  const base = 'https://engines.haifengmachinery.com'
  const name = engines[0].brand
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${name} Generator Engines`,
      url: `${base}/brands/${encodeURIComponent(decoded.toLowerCase())}`,
      description: `All ${name} diesel and gas generator engine specifications and datasheets.`,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: engines.length,
        itemListElement: hubItemListElements(engines, base),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Brands', item: `${base}/brands` },
        { '@type': 'ListItem', position: 2, name, item: `${base}/brands/${encodeURIComponent(decoded.toLowerCase())}` },
      ],
    },
  ]

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <nav className="text-sm text-gray-400 mb-4">
        <Link href="/brands" className="hover:text-blue-600">Brands</Link>
        {' / '}
        <span className="text-gray-700 capitalize">{decoded}</span>
      </nav>

      <BrandLogo brand={engines[0].brand} size="lg" className="mb-3" />
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{engines[0].brand} Generator Engines</h1>
      <p className="text-gray-500 mb-8">{engines.length} engines in the database</p>

      {activeEngines.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">In Production</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeEngines.map((engine) => (
              <EngineCard key={engine.id} engine={engine} />
            ))}
          </div>
        </section>
      )}

      {discontinuedEngines.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Discontinued / Archived</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {discontinuedEngines.map((engine) => (
              <EngineCard key={engine.id} engine={engine} />
            ))}
          </div>
        </section>
      )}

      <HubContent
        subject={`${name} generator engines`}
        engines={engines}
        related={[
          { label: 'Diesel engines', href: '/engines/fuel/diesel' },
          { label: 'Gas engines', href: '/engines/fuel/gas' },
          { label: 'Under 100 kWe', href: '/engines/power/under-100-kwe' },
          { label: '100–500 kWe', href: '/engines/power/100-500-kwe' },
          { label: '500–1,500 kWe', href: '/engines/power/500-1500-kwe' },
          { label: '1,500+ kWe', href: '/engines/power/1500-plus-kwe' },
          { label: 'All brands', href: '/brands' },
        ]}
      />
    </div>
  )
}
