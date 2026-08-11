import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Database, FileText, Gauge, Layers3 } from 'lucide-react'
import { getDbStats } from '@/lib/engines'
import { getAllAlternators } from '@/lib/alternators'
import { getAllGuides } from '@/lib/guides'
import { SearchBar } from '@/components/SearchBar'
import { CountUp } from '@/components/CountUp'

export const revalidate = 3600

export const metadata: Metadata = {
  title: { absolute: 'Generator Engine Specs Database by Haifeng Machinery' },
  description:
    'Haifeng Machinery / Haifeng Power generator engine database for diesel and gas generator engines, alternators, datasheets, guides, brands, power output and emissions standards.',
  alternates: { canonical: '/' },
}

const BASE = 'https://engines.haifengmachinery.com'

const HERO_STARTERS = [
  {
    tag: 'Data center',
    label: '2,000+ kWe engines',
    desc: 'High-output standby models for critical power research',
    href: '/engines/power/2000-plus-kwe',
  },
  {
    tag: 'Compliance',
    label: 'EPA-certified engines',
    desc: 'U.S. EPA emissions listings for regulated projects',
    href: '/engines?emissions=U.S.+EPA&view=grid',
  },
  {
    tag: 'Gas power',
    label: 'Gas generator engines',
    desc: 'Natural gas, propane (LPG), and biogas models',
    href: '/engines/fuel/gas',
  },
]

const PACKAGE_ROUTES = [
  {
    label: 'Industrial generator product offerings',
    desc: 'Move from a technical shortlist into Haifeng package categories.',
    href: 'https://www.haifengmachinery.com/product-offerings/',
  },
  {
    label: 'EPA standby diesel generators',
    desc: 'Review regulated emergency standby diesel generator packages.',
    href: 'https://www.haifengmachinery.com/diesel-power-package-regulated/',
  },
  {
    label: 'Gas generator systems',
    desc: 'Match gas engine research to 50/60 Hz package options.',
    href: 'https://www.haifengmachinery.com/gas-power-package-50hz-60hz/',
  },
]

export default async function HomePage() {
  const [stats, alternators, guides] = await Promise.all([
    getDbStats(),
    getAllAlternators(),
    Promise.resolve(getAllGuides()),
  ])

  const sections = [
    {
      href: '/engines',
      title: 'Engines',
      desc: 'Diesel and gas engine specifications, filters, and datasheets',
      count: stats.total,
      icon: Database,
    },
    {
      href: '/alternators',
      title: 'Alternators',
      desc: 'Generator alternator models and data-sheet references',
      count: alternators.length,
      icon: Gauge,
    },
    {
      href: '/brands',
      title: 'Brands',
      desc: 'Manufacturer hubs for engine and alternator research',
      count: stats.brandCount,
      icon: Layers3,
    },
    {
      href: '/guides',
      title: 'Guides',
      desc: 'Practical references for generator specification decisions',
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

      <section className="home-hero catalog-grid border-b border-gray-900 pb-10 pt-2 sm:pb-14 sm:pt-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
          <div className="home-hero-copy lg:col-span-7">
            <h1 className="brand-display max-w-3xl font-bold text-gray-900">
              <span className="block text-blue-600">
                <CountUp end={stats.total} />+
              </span>
              Generator Engine Specifications
            </h1>
            <p className="measure-copy mt-7 text-base leading-relaxed text-gray-600 sm:text-lg">
              Search diesel and gas generator engines, alternators, manufacturer datasheets,
              emissions standards, and verified power ratings.
            </p>
            <div className="home-search mt-8 max-w-2xl">
              <Suspense>
                <SearchBar defaultValue="" target="/engines" viewOnSearch="grid" />
              </Suspense>
            </div>
            <div className="home-starters mt-6 grid max-w-2xl grid-cols-1 border-b border-gray-900 sm:grid-cols-3 sm:border-b-0">
              {HERO_STARTERS.map((starter) => (
                <Link
                  key={starter.href}
                  href={starter.href}
                  className="starter-link group p-4 sm:min-h-28 sm:border-b sm:border-r sm:border-t sm:border-gray-900 sm:last:border-r-0"
                >
                  <span className="min-w-0">
                    <span className="starter-link-kicker block text-[0.6875rem] font-bold uppercase text-blue-600">
                      {starter.tag}
                    </span>
                    <span className="block text-sm font-bold text-gray-900 group-hover:text-blue-600">
                      {starter.label}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                      {starter.desc}
                    </span>
                  </span>
                  <ArrowRight aria-hidden="true" className="motion-arrow h-4 w-4 shrink-0 text-blue-600" />
                </Link>
              ))}
            </div>
          </div>

          <dl className="home-stats grid grid-cols-3 border-t border-gray-900 lg:col-span-5">
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

      <section className="home-photo swiss-photo -mx-4 sm:-mx-6 lg:-mx-8">
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
        <div className="grid grid-cols-1 gap-8 border-t border-gray-900 pt-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="brand-section-title font-bold text-gray-900">Choose a catalog path</h2>
            <p className="measure-copy mt-4 text-sm leading-relaxed text-gray-600">
              Start with the broad index, then use catalog filters and brand pages
              when the project needs deeper model, power, or emissions detail.
            </p>
          </div>

          <div className="lg:col-span-8">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className="motion-link group grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-gray-200 py-4 hover:bg-blue-50 sm:grid-cols-[3.5rem_9rem_minmax(0,1fr)_auto]"
                >
                  <Icon aria-hidden="true" className="h-5 w-5 justify-self-center text-gray-400 group-hover:text-blue-600" />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-gray-900 group-hover:text-blue-600">
                      {section.title}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      <CountUp end={section.count} /> indexed
                    </span>
                  </span>
                  <p className="col-span-2 max-w-[54ch] text-sm leading-relaxed text-gray-500 sm:col-span-1">
                    {section.desc}
                  </p>
                  <ArrowRight aria-hidden="true" className="motion-arrow h-4 w-4 text-blue-600" />
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-gray-900 py-10 sm:py-14">
        <div className="grid grid-cols-1 gap-8 border-t border-gray-900 pt-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="brand-section-title font-bold text-gray-900">Move from research to package scope</h2>
            <p className="measure-copy mt-4 text-sm leading-relaxed text-gray-600">
              Compare the technical fit here, then continue into the Haifeng route
              that matches fuel, emissions, mobility, and documentation needs.
            </p>
          </div>

          <div className="lg:col-span-8">
            {PACKAGE_ROUTES.map((route) => (
              <a
                key={route.href}
                href={route.href}
                target="_blank"
                rel="noopener noreferrer"
                className="motion-link group grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-gray-200 py-4 hover:bg-blue-50 sm:grid-cols-[15rem_minmax(0,1fr)_auto]"
              >
                <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600">
                  {route.label}
                </span>
                <p className="col-span-2 max-w-[56ch] text-xs leading-relaxed text-gray-500 sm:col-span-1">
                  {route.desc}
                </p>
                <ArrowRight
                  aria-hidden="true"
                  className="motion-arrow col-start-2 row-start-1 h-4 w-4 justify-self-end text-blue-600 sm:col-start-3"
                />
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
