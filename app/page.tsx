import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Database, FileText, Gauge, Layers3 } from 'lucide-react'
import { getDbStats, getFilterOptions } from '@/lib/engines'
import { getAllAlternators } from '@/lib/alternators'
import { getAllGuides } from '@/lib/guides'
import { SearchBar } from '@/components/SearchBar'
import { CountUp } from '@/components/CountUp'
import { CommercialPathways } from '@/components/CommercialPathways'
import { brandSlug } from '@/lib/seo'
import { PRIORITY_BRAND_HUBS, PRIORITY_MODEL_SPECS } from '@/lib/seo-opportunities'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { absolute: 'Generator Engine Specs Database by Haifeng Machinery' },
  description:
    'Haifeng Machinery / Haifeng Power generator engine database for diesel and gas generator engines, alternators, datasheets, guides, brands, power output and emissions standards.',
  alternates: { canonical: '/' },
}

const BASE = 'https://engines.haifengmachinery.com'

const POWER_PRESETS = [
  { label: 'Under 100 kWe', slug: 'under-100-kwe' },
  { label: '100–500 kWe', slug: '100-500-kwe' },
  { label: '500–1,500 kWe', slug: '500-1500-kwe' },
  { label: '1,500+ kWe', slug: '1500-plus-kwe' },
]

const brandHref = (brand: string) => `/brands/${brandSlug(brand)}`

export default async function HomePage() {
  const [stats, options, alternators, guides] = await Promise.all([
    getDbStats(),
    getFilterOptions(),
    getAllAlternators(),
    Promise.resolve(getAllGuides()),
  ])

  const sections = [
    {
      href: '/engines',
      title: 'Engines',
      desc: `${stats.total.toLocaleString()} diesel and gas engine specification pages`,
      count: stats.total,
      icon: Database,
    },
    {
      href: '/alternators',
      title: 'Alternators',
      desc: `${alternators.length} generator alternator models`,
      count: alternators.length,
      icon: Gauge,
    },
    {
      href: '/brands',
      title: 'Brands',
      desc: `${stats.brandCount} engine manufacturers worldwide`,
      count: stats.brandCount,
      icon: Layers3,
    },
    {
      href: '/guides',
      title: 'Guides',
      desc: `${guides.length} practical generator references`,
      count: guides.length,
      icon: FileText,
    },
  ]

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'The Generator Engine Encyclopedia — sections',
    itemListElement: sections.map((section, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: section.title,
      url: `${BASE}${section.href}`,
    })),
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList).replace(/</g, '\\u003c') }}
      />

      <section className="catalog-grid border-b border-gray-900 pb-10 pt-2 sm:pb-14 sm:pt-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="section-index mb-6">Global technical reference</p>
            <h1 className="max-w-4xl text-[clamp(2.5rem,7vw,6.6rem)] font-bold leading-[0.92] text-gray-900">
              <span className="block text-blue-600">
                <CountUp end={stats.total} />+
              </span>
              Generator Engine Specifications
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
              Search diesel and gas generator engines, alternators, manufacturer datasheets,
              emissions standards, and verified power ratings.
            </p>
            <div className="mt-8 max-w-2xl">
              <Suspense>
                <SearchBar defaultValue="" target="/engines" />
              </Suspense>
            </div>
          </div>

          <dl className="grid grid-cols-3 border-t border-gray-900 lg:col-span-5">
            {[
              { value: alternators.length, label: 'Alternators' },
              { value: stats.brandCount, label: 'Brands' },
              { value: stats.originCount, label: 'Countries' },
            ].map(({ value, label }) => (
              <div key={label} className="border-r border-gray-200 px-3 py-4 last:border-r-0 sm:px-5">
                <dd className="text-2xl font-bold text-gray-900 sm:text-4xl">
                  <CountUp end={value} />
                </dd>
                <dt className="mt-2 text-xs text-gray-500">{label}</dt>
              </div>
            ))}
            <div className="col-span-3 border-t border-gray-200 px-3 py-3 text-xs text-gray-500 sm:px-5">
              <span className="font-bold text-blue-600">{stats.total.toLocaleString()}</span>{' '}
              <span>Engines indexed</span>
            </div>
          </dl>
        </div>
      </section>

      <section className="swiss-photo -mx-4 sm:-mx-6 lg:-mx-8">
        <Image
          src="/hero/cummins-engine.jpg"
          alt="Cummins generator engine installation"
          fill
          preload
          sizes="100vw"
        />
        <div className="absolute bottom-0 left-[18%] z-10 bg-white px-4 py-2 text-xs text-gray-600 sm:px-6">
          Generator engine reference database by Haifeng Machinery
        </div>
      </section>

      <section className="border-b border-gray-900 py-10 sm:py-14">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="section-index mb-3">01 Catalog</p>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Browse the database</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 border-t border-gray-900 md:grid-cols-2 xl:grid-cols-4">
          {sections.map((section, index) => {
            const Icon = section.icon
            return (
              <Link
                key={section.href}
                href={section.href}
                className="group border-b border-r border-gray-200 p-5 hover:bg-blue-50 xl:border-b-0"
              >
                <div className="mb-8 flex items-start justify-between">
                  <span className="text-xs font-bold text-blue-600">0{index + 1}</span>
                  <Icon aria-hidden="true" className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">
                  <CountUp end={section.count} />
                </p>
                <h3 className="mt-2 text-lg font-bold text-gray-900">{section.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">{section.desc}</p>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="border-b border-gray-900 py-10 sm:py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="section-index mb-3">02 Models</p>
            <h2 className="text-2xl font-bold text-gray-900">High-interest specifications</h2>
          </div>
          <Link href="/engines" className="hidden items-center gap-2 text-sm font-bold text-blue-600 hover:underline sm:flex">
            Browse all <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 border-t border-gray-900 sm:grid-cols-2 lg:grid-cols-5">
          {PRIORITY_MODEL_SPECS.map((spec, index) => (
            <Link
              key={spec.href}
              href={spec.href}
              className="group min-h-40 border-b border-r border-gray-200 p-4 hover:bg-blue-50"
            >
              <span className="text-xs text-gray-400">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-8 text-sm font-bold text-gray-900 group-hover:text-blue-600">{spec.label}</h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">{spec.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <CommercialPathways
        eyebrow="03 Package routes"
        title="Move from an engine shortlist to a generator package"
        intro="Compare model, output, emissions, datasheet availability, and alternator fit before choosing the Haifeng Machinery product route that matches the project."
      />

      <section className="border-b border-gray-900 py-10 sm:py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="section-index mb-3">04 Manufacturers</p>
            <h2 className="text-2xl font-bold text-gray-900">Generator brand hubs</h2>
          </div>
          <Link href="/brands" className="text-sm font-bold text-blue-600 hover:underline">All brands</Link>
        </div>
        <div className="grid grid-cols-1 border-t border-gray-900 sm:grid-cols-2 lg:grid-cols-5">
          {PRIORITY_BRAND_HUBS.map((brand) => (
            <Link
              key={brand.name}
              href={brandHref(brand.name)}
              className="min-h-36 border-b border-r border-gray-200 p-4 hover:bg-blue-50"
            >
              <h3 className="text-sm font-bold text-gray-900">{brand.name} generator engines</h3>
              <p className="mt-7 text-xs leading-relaxed text-gray-500">{brand.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 border-b border-gray-900 py-10 sm:py-14 lg:grid-cols-12">
        <div className="mb-8 lg:col-span-3 lg:mb-0">
          <p className="section-index mb-3">05 Browse</p>
          <h2 className="text-2xl font-bold text-gray-900">Technical facets</h2>
        </div>
        <div className="space-y-8 lg:col-span-9">
          <FacetLinks
            title="Fuel"
            links={[
              { label: 'Diesel', href: '/engines/fuel/diesel' },
              { label: 'Gas: natural gas, CNG, LNG, and biogas', href: '/engines/fuel/gas' },
            ]}
          />
          <FacetLinks
            title="Emissions"
            links={['U.S. EPA', 'Euro Stage', 'U.S. EPA Final Tier 4', 'Euro Stage V', 'Unregulated'].map((value) => ({
              label: value,
              href: `/engines?${new URLSearchParams({ emissions: value }).toString()}`,
            }))}
          />
          <FacetLinks
            title="Power"
            links={POWER_PRESETS.map(({ label, slug }) => ({ label, href: `/engines/power/${slug}` }))}
          />
          <FacetLinks
            title="Brands"
            links={options.brands.map((brand) => ({ label: brand, href: brandHref(brand) }))}
          />
        </div>
      </section>
    </div>
  )
}

function FacetLinks({
  title,
  links,
}: {
  title: string
  links: Array<{ label: string; href: string }>
}) {
  return (
    <div className="grid grid-cols-1 border-t border-gray-900 pt-3 sm:grid-cols-4">
      <h3 className="mb-3 text-sm font-bold text-gray-900 sm:mb-0">{title}</h3>
      <div className="flex flex-wrap gap-x-5 gap-y-2 sm:col-span-3">
        {links.map((link) => (
          <Link key={`${title}-${link.label}`} href={link.href} className="text-sm text-gray-600 underline decoration-gray-300 underline-offset-4 hover:text-blue-600 hover:decoration-blue-600">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
