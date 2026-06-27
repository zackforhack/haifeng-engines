import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getAllBrands, getEnginesByBrand } from '@/lib/engines'
import { EngineCard } from '@/components/EngineCard'
import { BrandLogo } from '@/components/BrandLogo'
import { HubContent } from '@/components/HubContent'
import { buildHubOverview, computeHubStats, engineKwe, hubItemListElements } from '@/lib/hub-stats'
import { brandSlug, limitedEngines, resolveBrandSlug, ENGINE_HUB_DISPLAY_LIMIT } from '@/lib/seo'
import type { Engine } from '@/lib/types'

interface Props {
  params: Promise<{ brand: string }>
}

function brandMetaDescription(name: string, engines: Engine[]): string {
  const stats = computeHubStats(engines)
  const kwes = engines.map(engineKwe).filter((v): v is number => v != null)
  const power =
    kwes.length && Math.max(...kwes) > Math.min(...kwes)
      ? ` from ${Math.round(Math.min(...kwes)).toLocaleString()} to ${Math.round(Math.max(...kwes)).toLocaleString()} kWe`
      : ''
  const fuel = stats.hasDiesel && stats.hasGas ? 'diesel and gas' : stats.hasGas ? 'gas' : 'diesel'
  return `Browse ${engines.length.toLocaleString()} ${name} ${fuel} generator engine specifications${power}, including emissions ratings, datasheets, and manuals.`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params
  const decoded = decodeURIComponent(brand)
  const brands = await getAllBrands()
  const name = resolveBrandSlug(decoded, brands) ?? decoded
  const slug = brandSlug(name)
  const engines = resolveBrandSlug(decoded, brands) ? await getEnginesByBrand(name) : []
  const description = engines.length
    ? brandMetaDescription(name, engines)
    : `Browse all ${name} diesel and gas generator engine specifications, datasheets, and manuals for electrical power generation.`

  return {
    title: `${name} Generator Engine Specs`,
    description,
    alternates: { canonical: `/brands/${slug}` },
    openGraph: {
      title: `${name} Generator Engine Specs`,
      description,
      type: 'website',
      url: `/brands/${slug}`,
    },
  }
}

export async function generateStaticParams() {
  const brands = await getAllBrands()
  return brands.map((b) => ({ brand: brandSlug(b) }))
}

export default async function BrandPage({ params }: Props) {
  const { brand } = await params
  const decoded = decodeURIComponent(brand)
  const brands = await getAllBrands()
  const resolvedBrand = resolveBrandSlug(decoded, brands)
  if (!resolvedBrand) notFound()

  const canonicalSlug = brandSlug(resolvedBrand)
  if (brand !== canonicalSlug) redirect(`/brands/${canonicalSlug}`)

  const engines = await getEnginesByBrand(resolvedBrand)

  if (!engines.length) notFound()

  const activeEngines = engines.filter((e) => e.status === 'active')
  const discontinuedEngines = engines.filter((e) => e.status !== 'active')
  const displayedActive = limitedEngines(activeEngines)
  const remainingSlots = Math.max(0, ENGINE_HUB_DISPLAY_LIMIT - displayedActive.length)
  const displayedDiscontinued = discontinuedEngines.slice(0, remainingSlots)
  const displayedCount = displayedActive.length + displayedDiscontinued.length

  const base = 'https://engines.haifengmachinery.com'
  const name = engines[0].brand
  const subject = `${name} generator engines`
  const stats = computeHubStats(engines)
  const overview = buildHubOverview(subject, stats)
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${name} Generator Engines`,
      url: `${base}/brands/${canonicalSlug}`,
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
        { '@type': 'ListItem', position: 2, name, item: `${base}/brands/${canonicalSlug}` },
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
        <span className="text-gray-700">{name}</span>
      </nav>

      <BrandLogo brand={engines[0].brand} size="lg" className="mb-3" />
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{engines[0].brand} Generator Engines</h1>
      <p className="text-gray-500 mb-4">{engines.length} engines in the database</p>
      <p className="text-gray-600 leading-relaxed max-w-3xl mb-8">{overview}</p>

      {activeEngines.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">In Production</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedActive.map((engine) => (
              <EngineCard key={engine.id} engine={engine} />
            ))}
          </div>
        </section>
      )}

      {displayedDiscontinued.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Discontinued / Archived</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedDiscontinued.map((engine) => (
              <EngineCard key={engine.id} engine={engine} />
            ))}
          </div>
        </section>
      )}

      {engines.length > displayedCount && (
        <p className="text-xs text-gray-400 mt-3">
          Showing the first {displayedCount.toLocaleString()} of {engines.length.toLocaleString()} {name} engines on this brand page. Use the main engine filters for the full set.
        </p>
      )}

      <HubContent
        subject={subject}
        engines={engines}
        showOverview={false}
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
