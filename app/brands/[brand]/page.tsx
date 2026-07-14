import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getAllBrands, getEnginesByBrand } from '@/lib/engines'
import { EngineCard } from '@/components/EngineCard'
import { BrandLogo } from '@/components/BrandLogo'
import { HubContent } from '@/components/HubContent'
import { buildHubOverview, computeHubStats, engineKwe, hubItemListElements } from '@/lib/hub-stats'
import { brandSlug, limitedEngines, resolveBrandSlug, ENGINE_HUB_DISPLAY_LIMIT } from '@/lib/seo'
import { PRIORITY_BRAND_HUBS, PRIORITY_MODEL_SPECS } from '@/lib/seo-opportunities'
import { brandHubProfile, type BrandHubProfile } from '@/lib/brand-hub-seo'
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
  return `Browse ${engines.length.toLocaleString()} ${name} generator engine specifications for ${fuel} generators${power}, including emissions ratings, datasheets, manuals, and generator-set selection context.`
}

function brandMetaTitle(name: string, stats: ReturnType<typeof computeHubStats>): string {
  const fuel = stats.hasDiesel && stats.hasGas ? 'Diesel & Gas' : stats.hasGas ? 'Gas' : 'Diesel'
  return `${name} Generators & ${fuel} Engine Specs`
}

function brandApplications(name: string, stats: ReturnType<typeof computeHubStats>, profile?: BrandHubProfile | null): string[] {
  if (profile) return profile.applications
  const apps = ['standby generator sets', 'prime-power generator packages', 'industrial power modules']
  if (stats.hasGas) apps.push('gas generator sets and CHP projects')
  if (stats.hasDiesel) apps.push('diesel standby and emergency power')
  if ((stats.kweMax ?? 0) >= 1000) apps.push('data center, mining, oil and gas, and utility-scale packages')
  if ((stats.kweMin ?? 999999) <= 100) apps.push('compact commercial and telecom standby sets')
  return [...new Set(apps)].map((app) => `${name} ${app}`)
}

function brandSearchPhrases(name: string, stats: ReturnType<typeof computeHubStats>, profile?: BrandHubProfile | null): string[] {
  const phrases = [`${name} generator`, `${name} generators`, `${name} generator engines`]
  if (stats.hasDiesel) phrases.push(`${name} diesel generators`)
  if (stats.hasGas) phrases.push(`${name} gas engines`)
  if (profile) phrases.push(...profile.commonSearches)
  return [...new Set(phrases)]
}

function relatedBrandHubs(name: string, brands: string[]) {
  const available = new Set(brands.map(brandSlug))
  return PRIORITY_BRAND_HUBS
    .filter((brand) => brandSlug(brand.name) !== brandSlug(name))
    .filter((brand) => available.has(brandSlug(brand.name)))
    .slice(0, 4)
}

function prioritySpecsForBrand(name: string) {
  return PRIORITY_MODEL_SPECS
    .filter((spec) => spec.type === 'engine')
    .filter((spec) => brandSlug(spec.brand) === brandSlug(name))
}

function BrandBuyerGuide({
  name,
  engines,
  stats,
  brands,
  profile,
}: {
  name: string
  engines: Engine[]
  stats: ReturnType<typeof computeHubStats>
  brands: string[]
  profile: BrandHubProfile | null
}) {
  const featured = profile?.featuredModels.length
    ? profile.featuredModels
        .map((slug) => engines.find((engine) => engine.slug === slug))
        .filter((engine): engine is Engine => !!engine)
    : []
  const fallbackRanked = [...engines]
    .map((engine) => ({ engine, kwe: engineKwe(engine) }))
    .sort((a, b) => (b.kwe ?? 0) - (a.kwe ?? 0))
    .map(({ engine }) => engine)
  const ranked = (featured.length ? featured : fallbackRanked)
    .map((engine) => ({ engine, kwe: engineKwe(engine) }))
    .slice(0, 8)
  const apps = brandApplications(name, stats, profile).slice(0, 6)
  const searches = brandSearchPhrases(name, stats, profile)
  const relatedBrands = relatedBrandHubs(name, brands)
  const prioritySpecs = prioritySpecsForBrand(name)

  return (
    <section className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          {profile ? `How to choose ${name} for a generator set` : `${name} generator engine selection guide`}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          {profile?.overview ?? (
            <>Use this {name} hub to shortlist generator engines by electrical output, fuel type, emissions standard,
            datasheet coverage, and 50 Hz or 60 Hz rating. For a complete generator set, the engine choice should be
            checked together with alternator sizing, controller features, enclosure layout, voltage, cooling, exhaust,
            fuel system, and local compliance requirements.</>
          )}
        </p>
        {profile && (
          <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Selection checklist</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {profile.howToChoose.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-blue-500">-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Model</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">Output</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Fuel</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Emissions</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map(({ engine, kwe }) => (
                <tr key={engine.slug} className="border-t border-gray-100">
                  <td className="py-2 px-3">
                    <Link href={`/engines/${engine.slug}`} className="font-medium text-blue-600 hover:underline">
                      {engine.model}
                    </Link>
                  </td>
                  <td className="py-2 px-3 text-right text-gray-700">{kwe != null ? `${Math.round(kwe).toLocaleString()} kWe` : '—'}</td>
                  <td className="py-2 px-3 text-gray-700">{engine.fuel_type ?? '—'}</td>
                  <td className="py-2 px-3 text-gray-700">{engine.emissions_standard ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        {profile?.links.length ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Related resources</h2>
            <div className="space-y-2">
              {profile.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm font-medium text-blue-600 hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Common applications</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            {apps.map((app) => (
              <li key={app} className="flex gap-2">
                <span className="text-blue-500">-</span>
                <span>{app}</span>
              </li>
            ))}
          </ul>
        </div>

        {prioritySpecs.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Priority model specs</h2>
            <div className="space-y-3">
              {prioritySpecs.map((spec) => (
                <Link key={spec.href} href={spec.href} className="block group">
                  <span className="block text-sm font-semibold text-blue-600 group-hover:underline">
                    {spec.label}
                  </span>
                  <span className="block text-xs text-gray-500 leading-relaxed mt-0.5">
                    {spec.desc}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Common searches</h2>
          <div className="flex flex-wrap gap-2">
            {searches.map((phrase) => (
              <span key={phrase} className="px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                {phrase}
              </span>
            ))}
          </div>
        </div>

        {relatedBrands.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Related generator brands</h2>
            <div className="space-y-2">
              {relatedBrands.map((brand) => (
                <Link
                  key={brand.name}
                  href={`/brands/${brandSlug(brand.name)}`}
                  className="block text-sm font-medium text-blue-600 hover:underline"
                >
                  {brand.name} generator engines
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
          <p className="font-semibold text-gray-900 mb-1">{profile?.cta.title ?? `Need a ${name} generator package?`}</p>
          <p className="text-sm text-gray-600 mb-3">
            {profile?.cta.body ?? 'Haifeng Machinery can help select the engine, alternator, controller, enclosure, voltage, cooling package, and compliance path for a complete generator set.'}
          </p>
          <div className="space-y-2">
            <a
              href={profile?.cta.primaryHref ?? 'https://www.haifengmachinery.com/contact-us/'}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {profile?.cta.primaryLabel ?? 'Request generator support'} ↗
            </a>
            {profile && (
              <a
                href={profile.cta.secondaryHref}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-white border border-blue-200 text-blue-600 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {profile.cta.secondaryLabel} ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params
  const decoded = decodeURIComponent(brand)
  const brands = await getAllBrands()
  const name = resolveBrandSlug(decoded, brands) ?? decoded
  const slug = brandSlug(name)
  const engines = resolveBrandSlug(decoded, brands) ? await getEnginesByBrand(name) : []
  const stats = computeHubStats(engines)
  const profile = brandHubProfile(slug)
  const description = engines.length
    ? profile?.description ?? brandMetaDescription(name, engines)
    : `Browse all ${name} diesel and gas generator engine specifications, datasheets, and manuals for electrical power generation.`
  const title = engines.length ? profile?.title ?? brandMetaTitle(name, stats) : `${name} Generator Engine Specs`

  return {
    title,
    description,
    alternates: { canonical: `/brands/${slug}` },
    openGraph: {
      title,
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
  const profile = brandHubProfile(canonicalSlug)
  const overview = profile?.overview ?? buildHubOverview(subject, stats)
  const searchPhrases = brandSearchPhrases(name, stats, profile)
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: profile?.h1 ?? `${name} Generator Engines`,
      alternateName: searchPhrases,
      url: `${base}/brands/${canonicalSlug}`,
      description: profile?.description ?? brandMetaDescription(name, engines),
      about: searchPhrases.map((phrase) => ({ '@type': 'Thing', name: phrase })),
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
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile?.h1 ?? `${engines[0].brand} Generator Engines`}</h1>
      <p className="text-gray-500 mb-4">{engines.length} engines in the database</p>
      <p className="text-gray-600 leading-relaxed max-w-3xl mb-8">{overview}</p>

      <BrandBuyerGuide name={name} engines={engines} stats={stats} brands={brands} profile={profile} />

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
